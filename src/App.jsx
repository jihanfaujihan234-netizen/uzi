import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SmoothScrollProvider } from './context/SmoothScrollContext'
import { PortfolioProvider } from './context/PortfolioContext'
import HomePage from './pages/HomePage'
import ProjectDetail from './components/ProjectDetail'
import NotFound from './components/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScrollProvider>
        <PortfolioProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/project/:slug" element={<ProjectDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PortfolioProvider>
      </SmoothScrollProvider>
    </BrowserRouter>
  )
}
