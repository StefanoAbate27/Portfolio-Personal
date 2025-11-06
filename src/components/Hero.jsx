import React from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import { Phone } from "lucide-react"
import { FaWhatsapp, FaTelegram } from "react-icons/fa"

import profileImage from "../assets/profile.png";
const avatar = profileImage;

export default function Hero() {
  const { language } = useLanguage()

  const texts = {
    es: {
      disponible: "Disponible para proyectos",
      saludo: "Soy Stefano Abate",
      rol: "Desarrollador Full-Stack",
      descripcion: "Diseño y construyo experiencias digitales premium: webapps escalables, interfaces limpias y flujos que convierten. Trabajo con startups y empresas para llevar productos a producción rápidamente.",
      proyectos: "Proyectos",
      clientes: "Clientes",
      calificacion: "Calificación",
      contratarme: "Contrátame",
      verTrabajos: "Ver trabajos"
    },
    en: {
      disponible: "Available for projects",
      saludo: "I’m Stefano Abate",
      rol: "Full-Stack Developer",
      descripcion: "I design and build premium digital experiences: scalable webapps, clean interfaces, and conversion-driven flows. I work with startups and companies to ship products quickly.",
      proyectos: "Projects",
      clientes: "Clients",
      calificacion: "Rating",
      contratarme: "Hire me",
      verTrabajos: "View works"
    }
  }

  const t = texts[language]

  function smoothScrollTo(element) {
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset
    const startPosition = window.pageYOffset
    const distance = targetPosition - startPosition
    const duration = 600
    let start = null

    function step(timestamp) {
      if (!start) start = timestamp
      const progress = timestamp - start
      const easeInOut = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      const percentage = Math.min(progress / duration, 1)
      window.scrollTo(0, startPosition + distance * easeInOut(percentage))
      if (progress < duration) {
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
  }

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      smoothScrollTo(element)
    }
  }

  return (
    <div className="min-h-screen flex items-center z-10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-3 bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-medium">
            {t.disponible}
          </div>

          <h1 className="mt-6 text-4xl md:text-5xl font-extrabold leading-tight">
            {language === 'es' ? (
              <>
                {t.saludo}, <span className="text-dark">{t.rol}</span>
              </>
            ) : (
              <>
                <span className="text-dark">{t.rol}</span> — {t.saludo}
              </>
            )}
          </h1>

          <p className="mt-4 text-slate-600 max-w-lg">{t.descripcion}</p>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={() => scrollToSection('contacto')}
              className="
                px-6 py-3 rounded-full bg-gray-900 text-white font-semibold
                transition-shadow duration-300
                hover:shadow-[0_0_15px_rgba(59,130,246,1),0_0_30px_rgba(59,130,246,0.9)]
                hover:-translate-y-1
              "
            >
              {t.contratarme}
            </button>
            <button
              onClick={() => scrollToSection('proyectos')}
              className="
                px-5 py-3 rounded-full border border-slate-200 text-slate-700
                hover:bg-slate-100
                transition-shadow duration-300
                hover:shadow-[0_0_12px_rgba(59,130,246,0.9),0_0_20px_rgba(59,130,246,0.7)]
              "
            >
              {t.verTrabajos}
            </button>
          </div>

          <div className="mt-6 flex items-center gap-6 text-slate-600">
            <a
              href="tel:+584247582675"
              className="hover:text-slate-900 transition transform hover:scale-110"
            >
              <Phone size={28} />
            </a>

            <a
              href="https://wa.me/584247582675"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-500 transition transform hover:scale-110"
            >
              <FaWhatsapp size={28} />
            </a>

            <a
              href="https://t.me/StefanoA1227"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 transition transform hover:scale-110"
            >
              <FaTelegram size={28} />
            </a>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 max-w-sm">
            <div className="p-4 bg-white rounded-xl shadow text-center">
              <div className="text-2xl font-bold">15+</div>
              <div className="text-xs text-slate-500">{t.proyectos}</div>
            </div>
            <div className="p-4 bg-white rounded-xl shadow text-center">
              <div className="text-2xl font-bold">15+</div>
              <div className="text-xs text-slate-500">{t.clientes}</div>
            </div>
            <div className="p-4 bg-white rounded-xl shadow text-center">
              <div className="text-2xl font-bold">4.9/5</div>
              <div className="text-xs text-slate-500">{t.calificacion}</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9 }}
          className="flex justify-center md:justify-end"
        >
          <div
            className="
              relative w-80 h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden
              shadow-[0_0_40px_8px_rgba(59,130,246,0.7)]
            "
          >
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            <div className="absolute -right-8 top-8 w-36 h-36 bg-blue-500 rounded-full blur-3xl opacity-40"></div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
