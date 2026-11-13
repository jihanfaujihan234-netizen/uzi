import { useEffect } from 'react'

export function useReveal(rootRef, dependencies = []) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.querySelectorAll('[data-reveal]').forEach(element => {
        element.classList.add('is-revealed')
      })
      return undefined
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-revealed')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )

    root.querySelectorAll('[data-reveal]').forEach(element => {
      observer.observe(element)
    })

    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)
}

export function useReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
