import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  const sectionRef = useRef(null)
  const forestRef = useRef(null)
  const photoRef = useRef(null)
  const titleRef = useRef(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(titleRef.current, { opacity: 1 })
      gsap.set(forestRef.current, { display: 'none' })
      return undefined
    }

    const context = gsap.context(() => {
      gsap.set(titleRef.current, { opacity: 0 })

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      })

      timeline
        .to(forestRef.current, {
          scale: 4.6,
          opacity: 0,
          ease: 'none',
          duration: 0.22,
        })
        .to(
          photoRef.current,
          { yPercent: -12, ease: 'none', duration: 0.78 },
          0.22,
        )
        .to(titleRef.current, { opacity: 1, ease: 'none', duration: 0.11 }, 0.22)
        .to(titleRef.current, { yPercent: -50, ease: 'none', duration: 0.78 }, 0.22)
        .to(titleRef.current, { opacity: 0, ease: 'none', duration: 0.17 }, 0.83)
    }, section)

    return () => context.revert()
  }, [])

  return (
    <section id="Home" className="home" ref={sectionRef}>
      <div className="home-visuals">
        <div className="home-layers">
          <div className="home-layer home-layer--photo" ref={photoRef}>
            <img
              className="home-photo"
              src="/media/hero-tree-transparent.png"
              alt="Jihan Fauzi bersandar di pohon"
              loading="eager"
              decoding="async"
            />
          </div>

          <div className="home-title" ref={titleRef}>
            <div className="home-title-inner">
              <h1>
                <span className="block home-title-kicker">Welcome to my</span>
                <span className="home-title-word-wrap">
                  <span
                    className="block home-title-word"
                    data-text="Portofolio"
                  >
                    Portofolio
                  </span>
                  <span className="home-title-glints" aria-hidden="true" />
                </span>
              </h1>
            </div>
          </div>

          <div className="home-forest" ref={forestRef}>
            <img
              src="/media/hutan.svg"
              alt="Bingkai pepohonan hutan"
              loading="eager"
              decoding="async"
            />
          </div>

          <div className="home-fade" />
        </div>
      </div>
    </section>
  )
}
