import { useEffect, useRef, useState } from 'react'
import {
  ExternalLink,
  ImagePlus,
  Mail,
  MessageCircle,
  MessageSquare,
  Send,
  User,
  UserRound,
} from 'lucide-react'
import {
  profile,
  seedComments,
  socials,
} from '../data/site'
import { useReveal } from '../hooks/useReveal'

const STORAGE_KEY = 'uzi-portfolio-comments-v1'
const LEGACY_STORAGE_KEYS = [
  'eka-portfolio-comments-v1',
  'eka-portfolio-comments-v2',
  'uzi-portfolio-comments-v2',
]
const BASE_COMMENT_COUNT = 0
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
const WEB3FORMS_KEY = String(
  import.meta.env.VITE_WEB3FORMS_ACCESS_KEY ?? '',
).trim()
const WEB3FORMS_TIMEOUT_MS = 20000
const COMMENT_TIME_ZONE = 'Asia/Jakarta'
const COMMENT_TIME_REFRESH_MS = 30 * 1000

function getCommentTimestamp(comment) {
  const direct = Number(comment?.created_at ?? comment?.createdAt)
  if (Number.isFinite(direct) && direct > 0) return direct

  const match = /^comment-(\d+)$/.exec(String(comment?.id ?? ''))
  return match ? Number(match[1]) : null
}

function formatCommentTime(timestamp, now) {
  if (!timestamp) return ''

  const minutes = Math.floor(Math.max(0, now - timestamp) / 60000)
  if (minutes < 1) return 'baru saja'
  if (minutes < 60) return `${minutes} menit yang lalu`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam yang lalu`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari yang lalu`

  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return `${weeks} minggu yang lalu`
  }

  return new Intl.DateTimeFormat('id-ID', {
    timeZone: COMMENT_TIME_ZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(timestamp)
}

function readStoredComments() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter(comment => comment && typeof comment === 'object')
      .map(comment => ({
        ...comment,
        created_at: getCommentTimestamp(comment) ?? Date.now(),
      }))
  } catch {
    return []
  }
}

function writeStoredComments(comments) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(comments))
  } catch {
    /* storage may be full or unavailable */
  }
}

export default function Contact() {
  const sectionRef = useRef(null)
  const fileInputRef = useRef(null)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [contactStatus, setContactStatus] = useState('')
  const [contactError, setContactError] = useState('')
  const [contactSubmitting, setContactSubmitting] = useState(false)

  const [commentForm, setCommentForm] = useState({ name: '', text: '' })
  const [photo, setPhoto] = useState('')
  const [photoName, setPhotoName] = useState('')
  const [commentError, setCommentError] = useState('')
  const [commentStatus, setCommentStatus] = useState('')
  const [userComments, setUserComments] = useState([])
  const [now, setNow] = useState(() => Date.now())

  useReveal(sectionRef)

  useEffect(() => {
    try {
      LEGACY_STORAGE_KEYS.forEach(key => window.localStorage.removeItem(key))
    } catch {
      /* storage may be unavailable */
    }

    const storedComments = readStoredComments()
    setUserComments(storedComments)
    if (storedComments.length > 0) writeStoredComments(storedComments)
  }, [])

  useEffect(() => {
    const interval = window.setInterval(
      () => setNow(Date.now()),
      COMMENT_TIME_REFRESH_MS,
    )
    const refresh = () => setNow(Date.now())
    const handleVisibility = () => {
      if (!document.hidden) refresh()
    }

    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  const comments = [...userComments, ...seedComments]
  const commentCount = BASE_COMMENT_COUNT + comments.length

  const handleContactChange = event => {
    const { name, value } = event.target
    setContactForm(current => ({ ...current, [name]: value }))
    setContactError('')
    setContactStatus('')
  }

  const handleContactSubmit = async event => {
    event.preventDefault()
    if (contactSubmitting) return

    if (
      !contactForm.name.trim() ||
      !contactForm.email.trim() ||
      !contactForm.message.trim()
    ) {
      setContactError('Lengkapi nama, email, dan pesan terlebih dahulu.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      setContactError('Format email belum benar.')
      return
    }

    if (!WEB3FORMS_KEY) {
      setContactError(
        'Form kontak belum dikonfigurasi. Tambahkan VITE_WEB3FORMS_ACCESS_KEY.',
      )
      return
    }

    setContactSubmitting(true)
    setContactError('')
    setContactStatus('')

    const controller = new AbortController()
    const timeout = window.setTimeout(
      () => controller.abort(),
      WEB3FORMS_TIMEOUT_MS,
    )

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name: contactForm.name.trim(),
          email: contactForm.email.trim(),
          message: contactForm.message.trim(),
          subject: `Pesan baru dari ${contactForm.name.trim()} - uzi-portfolio`,
        }),
        signal: controller.signal,
      })

      const raw = await response.text()
      let result = null
      try {
        result = raw ? JSON.parse(raw) : null
      } catch {
        result = null
      }

      if (!response.ok || !result?.success) {
        const apiMessage =
          result && typeof result.message === 'string' ? result.message : ''
        throw new Error(apiMessage || 'Gagal mengirim pesan. Silakan coba lagi.')
      }

      setContactForm({ name: '', email: '', message: '' })
      setContactStatus('Terima kasih! Pesan kamu sudah terkirim.')
    } catch (error) {
      let message =
        'Gagal mengirim pesan. Periksa koneksi internet lalu coba lagi.'
      if (error instanceof DOMException && error.name === 'AbortError') {
        message =
          'Pengiriman terlalu lama. Periksa koneksi internet lalu coba lagi.'
      } else if (
        error instanceof Error &&
        error.message &&
        error.message !== 'Failed to fetch'
      ) {
        message = error.message
      }
      setContactError(message)
    } finally {
      window.clearTimeout(timeout)
      setContactSubmitting(false)
    }
  }

  const handleFile = event => {
    const file = event.target.files?.[0]
    setCommentError('')

    if (!file) {
      setPhoto('')
      setPhotoName('')
      return
    }

    if (!file.type.startsWith('image/')) {
      setCommentError('Foto profil harus berupa gambar.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setCommentError('Ukuran foto profil maksimal 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPhoto(String(reader.result || ''))
      setPhotoName(file.name)
    }
    reader.readAsDataURL(file)
  }

  const handleCommentSubmit = event => {
    event.preventDefault()
    if (!commentForm.name.trim() || !commentForm.text.trim()) {
      setCommentError('Isi nama dan komentar terlebih dahulu.')
      return
    }

    const createdAt = Date.now()
    const nextComment = {
      id: `comment-${createdAt}`,
      name: commentForm.name.trim(),
      text: commentForm.text.trim(),
      created_at: createdAt,
      photo: photo && photo.length < 250000 ? photo : '',
    }

    const next = [nextComment, ...userComments]
    setUserComments(next)
    writeStoredComments(next)
    setCommentForm({ name: '', text: '' })
    setPhoto('')
    setPhotoName('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    setCommentError('')
    setCommentStatus('Komentar berhasil ditambahkan.')
  }

  return (
    <section id="Contact" className="contact" ref={sectionRef}>
      <div className="contact-inner">
        <h2 className="contact-heading" data-reveal>
          Hubungi Saya
        </h2>

        <div className="contact-grid">
          <div className="contact-column">
            <div className="contact-card" data-reveal>
              <h3 className="contact-card-title">Hubungi</h3>
              <p className="contact-card-sub">
                Ada yang mau didiskusikan? Langsung kirim pesan aja ya..!
              </p>

              <form className="contact-form" onSubmit={handleContactSubmit} noValidate>
                <div className="input-shell">
                  <User size={18} aria-hidden="true" />
                  <input
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    placeholder="Nama Anda"
                    aria-label="Nama Anda"
                    autoComplete="name"
                  />
                </div>

                <div className="input-shell">
                  <Mail size={18} aria-hidden="true" />
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    placeholder="Email Anda"
                    aria-label="Email Anda"
                    autoComplete="email"
                  />
                </div>

                <div className="input-shell input-shell--area">
                  <MessageSquare size={18} aria-hidden="true" />
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    placeholder="Pesan Anda"
                    aria-label="Pesan Anda"
                    rows={4}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary contact-submit"
                  disabled={contactSubmitting}
                >
                  <Send size={16} aria-hidden="true" />
                  {contactSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
                </button>

                {contactError ? (
                  <p className="form-status is-error" role="alert">
                    {contactError}
                  </p>
                ) : null}
                {contactStatus ? (
                  <p className="form-status is-success" role="status">
                    {contactStatus}
                  </p>
                ) : null}
              </form>
            </div>

            <div className="contact-card find-me" data-reveal>
              <h3 className="find-me-title">Find Me</h3>
              <div className="social-list">
                {socials.map(social => (
                  <a
                    key={social.id}
                    className="social-row"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className={`social-icon social-icon--${social.id}`}>
                      <img src={social.icon} alt="" loading="lazy" decoding="async" />
                    </span>
                    <span className="social-text">
                      <strong>{social.label}</strong>
                      <small>{social.handle}</small>
                    </span>
                    <ExternalLink size={16} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="contact-column">
            <div className="contact-card" data-reveal>
              <div className="card-heading">
                <span className="card-heading-icon">
                  <MessageCircle size={20} aria-hidden="true" />
                </span>
                <h3>Tulis Komentar</h3>
              </div>

              <form className="comment-form" onSubmit={handleCommentSubmit} noValidate>
                <div className="comment-field">
                  <label htmlFor="comment-name">Nama</label>
                  <input
                    id="comment-name"
                    type="text"
                    value={commentForm.name}
                    onChange={event =>
                      setCommentForm(current => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Masukkan nama kamu"
                    autoComplete="name"
                  />
                </div>

                <div className="comment-field">
                  <label htmlFor="comment-text">Komentar</label>
                  <textarea
                    id="comment-text"
                    rows={4}
                    value={commentForm.text}
                    onChange={event =>
                      setCommentForm(current => ({
                        ...current,
                        text: event.target.value,
                      }))
                    }
                    placeholder="Tulis komentar kamu di sini..."
                  />
                </div>

                <div className="comment-field">
                  <label htmlFor="comment-photo">Foto Profil (opsional)</label>
                  <input
                    id="comment-photo"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    className="file-input"
                  />
                  <button
                    type="button"
                    className="file-button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus size={18} aria-hidden="true" />
                    {photoName || 'Choose Profile Photo'}
                  </button>
                  <p className="file-note">Max file size: 5MB</p>
                </div>

                <button type="submit" className="btn-primary contact-submit">
                  <Send size={16} aria-hidden="true" />
                  Kirim Komentar
                </button>

                {commentError ? (
                  <p className="form-status is-error" role="alert">
                    {commentError}
                  </p>
                ) : null}
                {commentStatus ? (
                  <p className="form-status is-success" role="status">
                    {commentStatus}
                  </p>
                ) : null}
              </form>
            </div>

            <div className="contact-card comments-card" data-reveal>
              <div className="card-heading">
                <span className="card-heading-icon">
                  <MessageCircle size={20} aria-hidden="true" />
                </span>
                <h3>
                  Komentar <span>({commentCount})</span>
                </h3>
              </div>

              <div className="comment-list" data-lenis-prevent>
                {comments.length === 0 ? (
                  <p className="comment-empty">
                    Belum ada komentar. Jadilah yang pertama!
                  </p>
                ) : (
                  comments.map(comment => (
                    <article className="comment-row" key={comment.id}>
                      <span className="comment-avatar">
                        {comment.photo ? (
                          <img src={comment.photo} alt="" />
                        ) : (
                          <UserRound size={18} aria-hidden="true" />
                        )}
                      </span>
                      <div className="comment-body">
                        <strong>{comment.name}</strong>
                        <p>{comment.text}</p>
                      </div>
                      <span className="comment-time">
                        {formatCommentTime(getCommentTimestamp(comment), now)}
                      </span>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
