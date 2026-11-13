import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ImagePlus, Images, X } from 'lucide-react'
import FolderCard from '../components/FolderCard'
import { myGalleryFolders } from '../data/site'
import { useReveal } from '../hooks/useReveal'
import { useSmoothScroll } from '../context/SmoothScrollContext'

export default function GalleryPage() {
  const pageRef = useRef(null)
  const [activeFolderId, setActiveFolderId] = useState(null)
  const [activePhoto, setActivePhoto] = useState(null)
  const { scrollTo, stop, start } = useSmoothScroll()

  useReveal(pageRef, [activeFolderId])

  useEffect(() => {
    document.title = 'MY GALERY | Jihan Fauzi'
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (!activePhoto) return undefined
    stop()
    document.body.classList.add('has-modal')

    const handleKey = event => {
      if (event.key === 'Escape') setActivePhoto(null)
    }
    window.addEventListener('keydown', handleKey)

    return () => {
      start()
      document.body.classList.remove('has-modal')
      window.removeEventListener('keydown', handleKey)
    }
  }, [activePhoto, start, stop])

  const activeFolder = activeFolderId
    ? myGalleryFolders.find(folder => folder.id === activeFolderId)
    : null

  const folderCards = myGalleryFolders.map(folder => ({
    id: folder.id,
    label: folder.label,
    count: folder.images.length,
    images: folder.images.slice(0, 3).map(image => image.src),
  }))

  const openFolder = id => {
    setActiveFolderId(id)
    setActivePhoto(null)
    scrollTo(0, { duration: 0.9 })
  }

  const closeFolder = () => {
    setActiveFolderId(null)
    setActivePhoto(null)
  }

  return (
    <main className="gallery-page" ref={pageRef}>
      <div className="gallery-page-blob gallery-page-blob--1" aria-hidden="true" />
      <div className="gallery-page-blob gallery-page-blob--2" aria-hidden="true" />

      <div className="gallery-page-inner">
        <div className="gallery-page-topbar">
          <Link className="detail-back" to="/" state={{ scrollTo: 'About' }}>
            <ArrowLeft size={18} aria-hidden="true" />
            Kembali ke About
          </Link>
        </div>

        <header className="gallery-page-head" data-reveal>
          <span className="gallery-page-eyebrow">
            <Images size={16} aria-hidden="true" />
            Personal Album
          </span>
          <h1 className="gallery-page-title">MY GALERY</h1>
          <p className="gallery-page-sub">
            Arsip foto perjalanan hidup, dari masa kecil sampai kenangan
            sekolah. Pilih folder untuk melihat isinya.
          </p>
        </header>

        {activeFolder ? (
          <section className="gallery-folder-view" data-reveal>
            <div className="gallery-folder-head">
              <button
                type="button"
                className="gallery-folder-back"
                onClick={closeFolder}
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Semua Folder
              </button>
              <h2>
                {activeFolder.label}
                <span> ({activeFolder.images.length})</span>
              </h2>
            </div>

            {activeFolder.images.length > 0 ? (
              <div className="gallery-photo-grid">
                {activeFolder.images.map(photo => (
                  <button
                    key={photo.id}
                    type="button"
                    className="gallery-photo"
                    onClick={() => setActivePhoto(photo)}
                    aria-label={`Perbesar ${photo.alt}`}
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="gallery-empty">
                <span className="gallery-empty-icon">
                  <ImagePlus size={26} aria-hidden="true" />
                </span>
                <p>Belum ada foto di folder ini.</p>
                <small>Foto-foto akan segera ditambahkan.</small>
              </div>
            )}
          </section>
        ) : (
          <section
            className="my-gallery-folders"
            aria-label="Folder galeri"
            data-reveal
          >
            {folderCards.map(folder => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onOpen={openFolder}
              />
            ))}
          </section>
        )}
      </div>

      {activePhoto ? (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.alt}
          onClick={() => setActivePhoto(null)}
        >
          <button
            type="button"
            className="gallery-lightbox-close"
            aria-label="Tutup foto"
            onClick={() => setActivePhoto(null)}
          >
            <X size={22} aria-hidden="true" />
          </button>
          <img
            src={activePhoto.src}
            alt={activePhoto.alt}
            onClick={event => event.stopPropagation()}
          />
        </div>
      ) : null}
    </main>
  )
}
