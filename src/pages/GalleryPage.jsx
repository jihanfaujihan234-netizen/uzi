import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Images } from 'lucide-react'
import FloatingPhotoGallery from '../components/FloatingPhotoGallery'
import FolderCard from '../components/FolderCard'
import { myGalleryFolders } from '../data/site'
import { useReveal } from '../hooks/useReveal'
import { useSmoothScroll } from '../context/SmoothScrollContext'

export default function GalleryPage() {
  const pageRef = useRef(null)
  const [activeFolderId, setActiveFolderId] = useState(null)
  const { scrollTo } = useSmoothScroll()

  useReveal(pageRef, [activeFolderId])

  useEffect(() => {
    document.title = 'MY GALERY | Jihan Fauzi'
    window.scrollTo(0, 0)
  }, [])

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
    scrollTo(0, { duration: 0.9 })
  }

  const closeFolder = () => {
    setActiveFolderId(null)
    scrollTo(0, { duration: 0.9 })
  }

  return (
    <main
      className={`gallery-page${activeFolder ? ' gallery-page--stage' : ''}`}
      ref={pageRef}
    >
      {activeFolder ? (
        <FloatingPhotoGallery
          key={activeFolder.id}
          photos={activeFolder.images}
          title={activeFolder.label}
          count={activeFolder.images.length}
          folderId={activeFolder.id}
          onBack={closeFolder}
        />
      ) : (
        <>
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
          </div>
        </>
      )}
    </main>
  )
}
