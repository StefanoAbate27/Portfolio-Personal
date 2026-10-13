import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { Mail } from "lucide-react";

export const SOCIALS = [
  { letter: "L", label: "LinkedIn", href: "https://www.linkedin.com/in/stefano-abate-75b362345", Icon: FaLinkedinIn },
  { letter: "G", label: "GitHub", href: "https://github.com/StefanoAbate27", Icon: FaGithub },
  { letter: "W", label: "WhatsApp", href: "https://wa.me/584247582675", Icon: FaWhatsapp },
  { letter: "@", label: "Email", href: "mailto:stefanoabate.dev@gmail.com", Icon: Mail },
];

/**
 * Fichas de redes con efecto flip letra↔icono (estilo Scottish): al pasar el
 * cursor por el grupo, cada ficha gira en 3D revelando el icono y muestra
 * un tooltip con el nombre de la red.
 */
export default function SocialFlip({ items = SOCIALS, className = "" }) {
  const [hovered, setHovered] = useState(false);
  const [tip, setTip] = useState(null);

  return (
    <div
      className={`flex items-center gap-2.5 ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTip(null); }}
    >
      {items.map(({ letter, label, href, Icon }, i) => (
        <a
          key={label}
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noopener noreferrer"
          aria-label={label}
          data-cursor={label}
          className="relative h-10 w-10"
          style={{ perspective: "700px" }}
          onMouseEnter={() => setTip(i)}
          onMouseLeave={() => setTip(null)}
          onFocus={() => { setHovered(true); setTip(i); }}
          onBlur={() => { setHovered(false); setTip(null); }}
        >
          <AnimatePresence>
            {hovered && tip === i && (
              <motion.span
                initial={{ opacity: 0, y: 6, scale: 0.8, x: "-50%" }}
                animate={{ opacity: 1, y: -38, scale: 1, x: "-50%" }}
                exit={{ opacity: 0, y: 6, scale: 0.8, x: "-50%" }}
                transition={{ duration: 0.2 }}
                className="pointer-events-none absolute left-1/2 top-0 z-20 whitespace-nowrap rounded-md bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-bg shadow-lg"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>

          <motion.span
            className="relative block h-full w-full"
            initial={false}
            animate={{ rotateY: hovered ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 15, delay: i * 0.07 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <span
              className="absolute inset-0 grid place-items-center rounded-lg bg-ink/[0.06] text-base font-bold text-ink ring-1 ring-line/15"
              style={{ backfaceVisibility: "hidden" }}
            >
              {letter}
            </span>
            <span
              className="absolute inset-0 grid place-items-center rounded-lg bg-accent text-white"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <Icon size={16} />
            </span>
          </motion.span>
        </a>
      ))}
    </div>
  );
}
