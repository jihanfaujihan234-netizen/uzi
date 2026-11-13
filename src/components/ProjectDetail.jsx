import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronDown,
  Code2,
} from 'lucide-react'
import {
  SiCss,
  SiFigma,
  SiGooglegemini,
  SiHtml5,
  SiJavascript,
  SiNodedotjs,
  SiReact,
  SiTailwindcss,
  SiVite,
} from 'react-icons/si'
import { projects } from '../data/site'

const TECH_ICONS = {
  Figma: SiFigma,
  'VS Code': Code2,
  VSCode: Code2,
  HTML: SiHtml5,
  CSS: SiCss,
  JavaScript: SiJavascript,
  'React JS': SiReact,
  React: SiReact,
  'Tailwind CSS': SiTailwindcss,
  Tailwind: SiTailwindcss,
  Vite: SiVite,
  'Node JS': SiNodedotjs,
  NodeJS: SiNodedotjs,
  Gemini: SiGooglegemini,
  'Adobe Illustrator': Code2,
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const project = projects.find(item => item.slug === slug)

  useEffect(() => {
    if (!project) {
      document.title = 'Proyek tidak ditemukan | Jihan Fauzi'
      return
    }
    document.title = `${project.title} | Jihan Fauzi`
  }, [project])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!project) {
    return (
      <main className="detail-page detail-missing">
        <div className="detail-blob detail-blob--1" aria-hidden="true" />
        <div className="detail-container">
          <h1>Proyek tidak ditemukan</h1>
          <p>Sepertinya tautan yang kamu buka sudah tidak tersedia.</p>
          <Link className="detail-back" to="/">
            <ArrowLeft size={18} aria-hidden="true" />
            Kembali ke Home
          </Link>
        </div>
      </main>
    )
  }

  const hasLongDetail = project.detail !== project.short
  const description = expanded
    ? `${project.short}\n\n${project.detail}`
    : project.short

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/')
  }

  return (
    <main className="detail-page">
      <div className="detail-blob detail-blob--1" aria-hidden="true" />
      <div className="detail-blob detail-blob--2" aria-hidden="true" />
      <div className="detail-blob detail-blob--3" aria-hidden="true" />

      <div className="detail-container">
        <div className="detail-topbar">
          <button type="button" className="detail-back" onClick={handleBack}>
            <ArrowLeft size={18} aria-hidden="true" />
            Back
          </button>
          <nav className="detail-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Projects</Link>
            <span aria-hidden="true">›</span>
            <span>{project.title}</span>
          </nav>
        </div>

        <div className="detail-grid">
          <div className="detail-copy">
            <h1>{project.title}</h1>

            <p className="detail-desc">{description}</p>

            {hasLongDetail ? (
              <button
                type="button"
                className="detail-expand"
                onClick={() => setExpanded(current => !current)}
                aria-expanded={expanded}
              >
                {expanded ? 'Sembunyikan' : 'Lihat selengkapnya'}
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className={expanded ? 'is-rotated' : ''}
                />
              </button>
            ) : null}

            <h2 className="detail-tech-heading">
              <Code2 size={18} aria-hidden="true" />
              Technologies Used
            </h2>
            <div className="detail-tech">
              {project.tech.map(tech => {
                const Icon = TECH_ICONS[tech] ?? Code2
                return (
                  <span className="detail-chip" key={tech}>
                    <Icon aria-hidden="true" />
                    {tech}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="detail-media">
            <img
              src={project.image}
              alt={`Pratinjau proyek ${project.title}`}
              decoding="async"
            />
          </div>
        </div>

        <p className="detail-copyright">
          © 2026 Jihan Fauzi™. All Rights Reserved.
        </p>
      </div>
    </main>
  )
}
