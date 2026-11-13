import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  useEffect(() => {
    document.title = '404 | Jihan Fauzi'
  }, [])

  return (
    <main className="notfound-page">
      <div className="detail-blob detail-blob--1" aria-hidden="true" />
      <div className="notfound-inner">
        <span className="notfound-code">404</span>
        <h1>Halaman tidak ditemukan</h1>
        <p>Halaman yang kamu cari tidak tersedia atau sudah dipindahkan.</p>
        <Link className="detail-back" to="/">
          <ArrowLeft size={18} aria-hidden="true" />
          Kembali ke Home
        </Link>
      </div>
    </main>
  )
}
