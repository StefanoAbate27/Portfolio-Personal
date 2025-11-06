import React from 'react'
import Particles from 'react-tsparticles'
import { loadFull } from 'tsparticles'
import Header from './components/Header.jsx'
import SocialBar from './components/SocialBar.jsx'
import Hero from './components/Hero.jsx'
import Projects from './components/Projects.jsx'
import Skills from './components/Skills.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

import { LanguageProvider } from './context/LanguageContext'

export default function App() {
  const particlesInit = async (engine) => {
    await loadFull(engine)
  }

  return (
    <LanguageProvider>
      <div className="relative min-h-screen overflow-x-hidden">
        {/* Fondo de partículas global y continuo */}
        <Particles
  id="tsparticles"
  init={particlesInit}
  options={{
    background: { color: 'transparent' },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: { enable: true, mode: 'repulse' },
        onClick: { enable: true, mode: 'push' }, // Activar click
        resize: true
      },
      modes: {
        repulse: { distance: 120 },
        push: { quantity: 3 } // Número de partículas que se generan al hacer click
      }
    },
    particles: {
      color: { value: '#161718ff' },
      links: { color: '#1b1c1dff', distance: 150, enable: true, opacity: 0.3, width: 1 },
      move: { enable: true, speed: 1, direction: 'none', outModes: { default: 'out' } },
      number: { value: 50, density: { enable: true, area: 800 } },
      opacity: { value: 0.4 },
      shape: { type: 'circle' },
      size: { value: { min: 1, max: 4 } },
    },
    detectRetina: true
  }}
  style={{ position: 'fixed', inset: 0, zIndex: -50, pointerEvents: 'none' }}
/>
        <Header />
        <SocialBar />

        <main className="relative z-10">
          <section id="inicio">
            <Hero />
          </section>
          <section id="proyectos">
            <Projects />
          </section>
          <section id="skills">
            <Skills />
          </section>
          <section id="contacto">
            <Contact />
          </section>
        </main>

        <Footer />
      </div>
    </LanguageProvider>
  )
}