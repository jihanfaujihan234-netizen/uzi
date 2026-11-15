import { useCallback, useEffect, useRef, useState } from 'react'
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
  seedComments,
  socials,
} from '../data/site'
import { useReveal } from '../hooks/useReveal'
import { supabase } from '../lib/supabase'

const BASE_COMMENT_COUNT = 0
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
const WEB3FORMS_KEY = String(
  import.meta.env.VITE_WEB3FORMS_ACCESS_KEY ?? '',
).trim()
const WEB3FORMS_TIMEOUT_MS = 20000
const COMMENT_TIME_ZONE = 'Asia/Jakarta'
const COMMENT_TIME_REFRESH_MS = 30 * 1000
const COMMENT_FETCH_MS = 30 * 1000
const COMMENT_NAME_LIMIT = 60
const COMMENT_TEXT_LIMIT = 1000
const AVATAR_MAX_SIZE = 160
const SUPABASE_MISSING_MESSAGE =
  'Supabase belum terkonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env.local, lalu restart server (npm run dev).'

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

function mapSupabaseComment(row) {
  return {
    id: row.id,
    name: row.name,
    message: row.message ?? '',
    avatar_url: row.avatar_url || '',
    created_at: new Date(row.created_at).getTime(),
  }
}

function describeSupabaseError(error, action) {
  const status = Number(error?.status)
  const code = String(error?.code ?? '')
  const message = String(error?.message ?? '')

  if (status === 401 || /invalid api key/i.test(message)) {
    return 'Koneksi Supabase ditolak (401). VITE_SUPABASE_ANON_KEY tidak valid: gunakan publishable key berawalan sb_publishable_ dari project yang sama.'
  }

  if (
    code === 'PGRST205' ||
    /could not find the table|relation .*comments.* does not exist/i.test(
      message,
    )
  ) {
    return 'Tabel public.comments tidak ditemukan di Supabase.'
  }

  if (code === '42501' || /row-level security/i.test(message)) {
    return `Akses ${action} ditolak oleh Row Level Security. Periksa policy anon pada tabel public.comments.`
  }

  if (code === '42703' || /column .* does not exist/i.test(message)) {
    return `Kolom tabel comments tidak cocok. ${message}`
  }

  if (code === 'PGRST204' || /schema cache/i.test(message)) {
    return `Kolom tabel comments belum dikenali Supabase. ${message}`
  }

  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return 'Tidak bisa menghubungi Supabase. Periksa koneksi internet lalu coba lagi.'
  }

  return message ? `Gagal ${action}: ${message}` : `Gagal ${action}. Coba lagi.`
}

function resizeProfilePhoto(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    const cleanup = () => URL.revokeObjectURL(objectUrl)

    image.onload = () => {
      try {
        const scale = Math.min(
          1,
          AVATAR_MAX_SIZE / Math.max(image.width, image.height),
        )
        const width = Math.max(1, Math.round(image.width * scale))
        const height = Math.max(1, Math.round(image.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Canvas tidak didukung.')
        context.drawImage(image, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      } catch (error) {
        reject(error)
      } finally {
        cleanup()
      }
    }

    image.onerror = () => {
      cleanup()
      reject(new Error('Gagal membaca foto profil.'))
    }

    image.src = objectUrl
  })
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
  const [commentsLoading, setCommentsLoading] = useState(Boolean(supabase))
  const [commentsError, setCommentsError] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  useReveal(sectionRef)

  const fetchComments = useCallback(async (options = {}) => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('comments')
        .select('id, name, message, avatar_url, created_at')
        .order('created_at', { ascending: false })
        .limit(200)

      if (error) throw error

      setUserComments((data || []).map(mapSupabaseComment))
      setCommentsError('')
    } catch (error) {
      if (!options.silent) {
        setCommentsError(describeSupabaseError(error, 'memuat komentar'))
      }
    } finally {
      setCommentsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    fetchComments()

    const channel = supabase
      .channel('public:comments')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        payload => {
          if (!payload?.new) return
          const incoming = mapSupabaseComment(payload.new)
          setUserComments(current =>
            current.some(comment => comment.id === incoming.id)
              ? current
              : [incoming, ...current],
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchComments])

  useEffect(() => {
    if (!supabase) return undefined

    const refresh = () => {
      if (!document.hidden) fetchComments({ silent: true })
    }
    const interval = window.setInterval(refresh, COMMENT_FETCH_MS)

    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [fetchComments])

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

  const handleFile = async event => {
    const file = event.target.files?.[0]
    setCommentError('')

    if (!file) {
      setPhoto('')
      setPhotoName('')
      return
    }

    if (!file.type.startsWith('image/')) {
      setCommentError('Foto profil harus berupa gambar.')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setCommentError('Ukuran foto profil maksimal 5MB.')
      event.target.value = ''
      return
    }

    try {
      const resized = await resizeProfilePhoto(file)
      setPhoto(resized)
      setPhotoName(file.name)
    } catch {
      setCommentError('Gagal memproses foto profil. Coba gambar lain.')
      setPhoto('')
      setPhotoName('')
      event.target.value = ''
    }
  }

  const handleCommentSubmit = async event => {
    event.preventDefault()
    if (commentSubmitting) return

    if (!supabase) {
      setCommentError(SUPABASE_MISSING_MESSAGE)
      return
    }

    const name = commentForm.name.trim()
    const text = commentForm.text.trim()

    if (!name || !text) {
      setCommentError('Isi nama dan komentar terlebih dahulu.')
      return
    }

    if (name.length > COMMENT_NAME_LIMIT) {
      setCommentError(`Nama maksimal ${COMMENT_NAME_LIMIT} karakter.`)
      return
    }

    if (text.length > COMMENT_TEXT_LIMIT) {
      setCommentError(`Komentar maksimal ${COMMENT_TEXT_LIMIT} karakter.`)
      return
    }

    setCommentSubmitting(true)
    setCommentError('')
    setCommentStatus('')

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({ name, message: text, avatar_url: photo || null })
        .select('id, name, message, avatar_url, created_at')
        .single()

      if (error) throw error

      const incoming = mapSupabaseComment(data)
      setUserComments(current =>
        current.some(comment => comment.id === incoming.id)
          ? current
          : [incoming, ...current],
      )

      setCommentForm({ name: '', text: '' })
      setPhoto('')
      setPhotoName('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      setCommentStatus('Komentar berhasil ditambahkan.')
    } catch (error) {
      setCommentError(describeSupabaseError(error, 'mengirim komentar'))
    } finally {
      setCommentSubmitting(false)
    }
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
                    maxLength={COMMENT_NAME_LIMIT}
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
                    maxLength={COMMENT_TEXT_LIMIT}
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

                <button
                  type="submit"
                  className="btn-primary contact-submit"
                  disabled={commentSubmitting || !supabase}
                >
                  <Send size={16} aria-hidden="true" />
                  {commentSubmitting ? 'Mengirim...' : 'Kirim Komentar'}
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
                {!supabase ? (
                  <p className="comment-empty">{SUPABASE_MISSING_MESSAGE}</p>
                ) : commentsLoading ? (
                  <p className="comment-empty">Memuat komentar...</p>
                ) : commentsError ? (
                  <p className="comment-empty">{commentsError}</p>
                ) : comments.length === 0 ? (
                  <p className="comment-empty">
                    Belum ada komentar. Jadilah yang pertama!
                  </p>
                ) : (
                  comments.map(comment => (
                    <article className="comment-row" key={comment.id}>
                      <span className="comment-avatar">
                        {comment.avatar_url ? (
                          <img src={comment.avatar_url} alt="" />
                        ) : (
                          <UserRound size={18} aria-hidden="true" />
                        )}
                      </span>
                      <div className="comment-body">
                        <strong>{comment.name}</strong>
                        <p>{comment.message}</p>
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
