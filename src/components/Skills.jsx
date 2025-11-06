import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  SiReact,
  SiJavascript,
  SiTypescript,
  SiNodedotjs,
  SiTailwindcss,
  SiFigma,
  SiDocker,
  SiPostgresql,
  SiElectron,
  SiVite,
  SiStripe,
  SiVercel,
  SiSupabase,
  SiShopify,
  SiPython,
  SiCplusplus
} from 'react-icons/si'
import { useLanguage } from '../context/LanguageContext'

const skills = [
  { name: 'React', icon: SiReact, color: '#61DBFB' },
  { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
  { name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
  { name: 'Node.js', icon: SiNodedotjs, color: '#339933' },
  { name: 'Tailwind', icon: SiTailwindcss, color: '#38BDF8' },
  { name: 'Figma', icon: SiFigma, color: '#F24E1E' },
  { name: 'Docker', icon: SiDocker, color: '#2496ED' },
  { name: 'Postgres', icon: SiPostgresql, color: '#336791' },
  { name: 'Electron', icon: SiElectron, color: '#47848F' },
  { name: 'Vite', icon: SiVite, color: '#646CFF' },
  { name: 'Stripe', icon: SiStripe, color: '#635BFF' },
  { name: 'Vercel', icon: SiVercel, color: '#ffffff' },
  { name: 'Supabase', icon: SiSupabase, color: '#3ECF8E' },
  { name: 'Shopify', icon: SiShopify, color: '#96BF48' },
  { name: 'Python', icon: SiPython, color: '#3776AB' },
  { name: 'C++', icon: SiCplusplus, color: '#00599C' },
]

export default function Skills() {
  const { language } = useLanguage()
  const [hovered, setHovered] = useState(null)

  const texts = {
    es: { habilidades: 'Habilidades' },
    en: { habilidades: 'Skills' },
  }
  const t = texts[language]

  return (
    <div className="container mx-auto px-6 py-20">
<h2
  className="text-5xl sm:text-5xl md:text-5xl font-bold text-center mb-12 text-gray-800"
  style={{
    textShadow:
      "0 10px 40px rgba(59,130,246,0.4), 0 14px 50px rgba(59,130,246,0.6), 0 10px 40px rgba(59,130,246,0.4)"
  }}
>
  {t.habilidades}
</h2>

      <div className="grid md:grid-cols-4 gap-8">
        {skills.map(({ name, icon: Icon, color }, i) => (
          <motion.div
            key={name}
            className="
              flex items-center gap-4
              bg-gray-900 text-white
              rounded-2xl
              px-6 py-4
              cursor-default
              shadow-[0_4px_8px_rgba(59,130,246,0.7),0_8px_24px_rgba(59,130,246,0.5)]
              hover:shadow-[0_6px_12px_rgba(59,130,246,1),0_12px_36px_rgba(59,130,246,0.7)]
              transition-all duration-300
              select-none
              transform
              hover:-translate-y-1 hover:scale-105
            "
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, type: 'spring', stiffness: 120 }}
            viewport={{ once: true }}
            onMouseEnter={() => setHovered(name)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className={`
                flex items-center justify-center
                bg-gray-800 rounded-lg w-12 h-12
                transition-all duration-300
                ${hovered === name
                  ? `shadow-[0_0_15px_${color}]`
                  : 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_4px_8px_rgba(59,130,246,0.7)]'}
              `}
            >
              <Icon
                size={28}
                color={hovered === name ? color : '#ffffff'}
                className={`transition-all duration-300 ${
                  hovered === name ? 'drop-shadow-[0_0_8px_currentColor]' : ''
                }`}
              />
            </div>
            <span
              className="text-lg font-semibold transition-colors duration-300"
              style={{
                color: hovered === name ? color : '#ffffff',
              }}
            >
              {name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}