import React from 'react'
import { useLanguage } from '../context/LanguageContext' 

export default function Footer() {
  const { language } = useLanguage()

  const texts = {
    es: `© ${new Date().getFullYear()} Stefano Abate — Portafolio`,
    en: `© ${new Date().getFullYear()} Stefano Abate — Portfolio`
  }

  return (
    <footer className="py-8">
      <div className="container mx-auto px-6 text-center text-sm text-slate-500">
        {texts[language]}
      </div>
    </footer>
  )
}
