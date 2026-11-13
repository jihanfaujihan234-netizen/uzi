import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Code, FileText, Images, School } from 'lucide-react'
import TopoCanvas from './TopoCanvas'
import FolderCard from './FolderCard'
import { education, experience, folders, profile } from '../data/site'
import { useReveal } from '../hooks/useReveal'
import { usePortfolio } from '../context/PortfolioContext'
import { useSmoothScroll } from '../context/SmoothScrollContext'

function TimelineItem({ item, index }) {
  return (
    <li className="timeline-item" style={{ '--index': index }}>
      <span className="timeline-node">{index + 1}</span>
      <div className="timeline-content">
        <div className="timeline-top">
          <span className="timeline-logo">
            {item.logo ? (
              <img src={item.logo} alt="" loading="lazy" decoding="async" />
            ) : (
              <School
                className="timeline-logo-icon"
                size={20}
                aria-hidden="true"
              />
            )}
          </span>
          <span className="timeline-org" title={item.org}>
            {item.org}
          </span>
          <span className="timeline-years">{item.years}</span>
        </div>
        <h5 className="timeline-role">{item.role}</h5>
        <p className="timeline-meta">
          <span>{item.place}</span>
          <span className="timeline-dot" aria-hidden="true" />
          <span className="timeline-tag">{item.tag}</span>
        </p>
      </div>
    </li>
  )
}

export default function About() {
  const aboutRef = useRef(null)
  const photoRef = useRef(null)
  const hintTimerRef = useRef(0)
  const [hinting, setHinting] = useState(false)
  const { goToTab } = usePortfolio()
  const { scrollTo } = useSmoothScroll()

  useReveal(aboutRef)

  useEffect(() => {
    const photo = photoRef.current
    if (!photo) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const observer = new IntersectionObserver(
      entries => {
        if (!entries[0].isIntersecting) return
        observer.disconnect()
        setHinting(true)
        hintTimerRef.current = window.setTimeout(() => setHinting(false), 3200)
      },
      { threshold: 0.45 },
    )
    observer.observe(photo)

    return () => {
      observer.disconnect()
      window.clearTimeout(hintTimerRef.current)
    }
  }, [])

  const handlePointerMove = event => {
    const photo = photoRef.current
    if (!photo || event.pointerType === 'touch') return
    const rect = photo.getBoundingClientRect()
    photo.style.setProperty('--mx', `${event.clientX - rect.left}px`)
    photo.style.setProperty('--my', `${event.clientY - rect.top}px`)
  }

  const handleViewProjects = event => {
    event.preventDefault()
    const target = document.getElementById('Portofolio')
    if (!target) return
    scrollTo(target.getBoundingClientRect().top + window.scrollY - 60, {
      duration: 1.2,
    })
  }

  return (
    <section id="About" className="about" ref={aboutRef}>
      <div className="about-topo" aria-hidden="true">
        <div className="about-topo-sticky">
          <TopoCanvas variant="dark" />
        </div>
      </div>
      <div className="about-top-fade" aria-hidden="true" />

      <div className="about-inner">
        <h2 className="about-heading" data-reveal>
          About Me
        </h2>

        <div className="about-hero">
          <div className="about-photo-col" data-reveal>
            <div
              className="photo-wrap"
              ref={photoRef}
              onPointerMove={handlePointerMove}
            >
              <div className="photo-mask">
                <img
                  className="photo-base"
                  src="/images/portrait-uniform.webp"
                  alt="Foto Jihan Fauzi"
                  decoding="async"
                />
                <img
                  className={`photo-spider${hinting ? ' is-hinting' : ''}`}
                  src="/images/cyberpunk-portrait.png"
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                />
              </div>
              <span className="photo-hint" aria-hidden="true">
                Coba dekatkan kursor
              </span>
            </div>
          </div>

          <div className="about-title-col" data-reveal>
            <h3 className="about-title">
              <span className="grad-vi block">Hi, I&apos;m</span>
              <span className="block text-white">
                {profile.firstName}
                <br />
                {profile.lastName}
              </span>
            </h3>
            <a
              className="btn-primary about-desktop-action"
              href={profile.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText size={16} aria-hidden="true" />
              View CV
            </a>
            <Link
              className="btn-primary about-desktop-action about-gallery-action"
              to="/gallery"
            >
              <Images size={16} aria-hidden="true" />
              MY GALERY
            </Link>
          </div>

          <div className="about-copy-col" data-reveal>
            <p>{profile.bio}</p>
            <a
              className="btn-primary about-desktop-action"
              href="#Portofolio"
              onClick={handleViewProjects}
            >
              <Code size={16} aria-hidden="true" />
              View Projects
            </a>
          </div>

          <div className="about-mobile-actions" data-reveal>
            <a
              className="btn-primary"
              href={profile.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText size={16} aria-hidden="true" />
              View CV
            </a>
            <Link className="btn-primary" to="/gallery">
              <Images size={16} aria-hidden="true" />
              MY GALERY
            </Link>
            <a
              className="btn-primary"
              href="#Portofolio"
              onClick={handleViewProjects}
            >
              <Code size={16} aria-hidden="true" />
              View Projects
            </a>
          </div>
        </div>

        <div className="about-lists">
          <section className="timeline-column" data-reveal>
            <h4 className="timeline-heading">Education</h4>
            <ol className="timeline-list">
              {education.map((item, index) => (
                <TimelineItem item={item} index={index} key={item.id} />
              ))}
            </ol>
          </section>

          <section className="timeline-column" data-reveal>
            <h4 className="timeline-heading">Experience</h4>
            <div className="experience-scroll" data-lenis-prevent>
              <ol className="timeline-list">
                {experience.map((item, index) => (
                  <TimelineItem item={item} index={index} key={item.id} />
                ))}
              </ol>
            </div>
          </section>
        </div>

        <div className="about-folders" data-reveal>
          {folders.map(folder => (
            <FolderCard folder={folder} key={folder.id} onOpen={goToTab} />
          ))}
        </div>
      </div>
    </section>
  )
}
