import { createContext, useCallback, useContext, useState } from 'react'
import { useSmoothScroll } from './SmoothScrollContext'

const PortfolioContext = createContext(null)

export function usePortfolio() {
  return useContext(PortfolioContext)
}

export function PortfolioProvider({ children }) {
  const [activeTab, setActiveTab] = useState('projects')
  const { scrollTo } = useSmoothScroll()

  const goToTab = useCallback(
    (tab, options = {}) => {
      setActiveTab(tab)
      if (options.scroll === false) return

      requestAnimationFrame(() => {
        const gallery = document.getElementById('Portofolio-Gallery')
        if (!gallery) return
        const top = gallery.getBoundingClientRect().top + window.scrollY
        scrollTo(Math.max(0, top), { duration: 1.15 })
      })
    },
    [scrollTo],
  )

  return (
    <PortfolioContext.Provider value={{ activeTab, setActiveTab, goToTab }}>
      {children}
    </PortfolioContext.Provider>
  )
}
