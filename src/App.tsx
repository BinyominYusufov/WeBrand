import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import Process from './components/Process'
import Portfolio from './components/Portfolio'
import Partners from './components/Partners'
import CTA from './components/CTA'
import Footer from './components/Footer'
import ContactModal from './components/ContactModal'
import { ModalProvider } from './context/ModalContext'

function App() {
  return (
    <ModalProvider>
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
      </div>
    </ModalProvider>
  )
}

export default App
