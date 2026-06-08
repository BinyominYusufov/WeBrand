import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import Process from './components/Process'
import Portfolio from './components/Portfolio'
import Partners from './components/Partners'
import Careers from './components/Careers'
import CTA from './components/CTA'
import Footer from './components/Footer'
import ContactModal from './components/ContactModal'
import ServiceDetailModal from './components/ServiceDetailModal'
import NotFound from './components/NotFound'
import { ModalProvider } from './context/ModalContext'

function Home() {
  return (
    <div className="relative min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Process />
        <Portfolio />
        <Partners />
        <CTA />
      </main>
      <Footer />
      <ContactModal />
      <ServiceDetailModal />
    </div>
  )
}

function Vacancies() {
  // Dedicated route for the careers section — reuses the existing Careers
  // component + content.ts data. Land at the top, not at a preserved scroll.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="relative min-h-screen bg-white">
      <Navbar />
      <main>
        <Careers />
      </main>
      <Footer />
      <ContactModal />
      <ServiceDetailModal />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ModalProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/devprojects" element={<Home />} />
          <Route path="/smmprojects" element={<Home />} />
          <Route path="/vacancies" element={<Vacancies />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ModalProvider>
    </BrowserRouter>
  )
}

export default App
