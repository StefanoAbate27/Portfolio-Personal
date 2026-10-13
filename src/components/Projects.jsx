import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Github, Eye } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const DATA = {
  es: {
    eyebrow: "Trabajo seleccionado",
    title: "Proyectos",
    lead: "Plataformas reales en producción, diseñadas y desarrolladas de principio a fin.",
    demo: "Ver proyecto",
    projects: [
      { title: "Scottish Eyewear", cat: "E-commerce · CRM", url: "scottisheyewear.com", desc: "Tienda de gafas con catálogo, canal mayorista y CRM de gestión.", tags: ["React", "TypeScript", "Supabase"], demo: "https://scottisheyewear.com", grad: "from-[#1f2d27] to-[#6a2a2f]" },
      { title: "Fidup", cat: "SaaS · Fidelización", url: "getfidup.com", desc: "Tarjetas de fidelidad digitales para Apple Wallet y Google Wallet.", tags: ["Node.js", "Wallet", "Docker"], demo: "https://getfidup.com", grad: "from-[#0f2a2e] to-[#1f7a6b]" },
      { title: "Tattoo AR", cat: "WebAR · Realidad aumentada", url: "tattoo-ar.vercel.app", desc: "Tatuajes que cobran vida con realidad aumentada, sin instalar apps.", tags: ["WebAR", "WebGL", "Supabase"], demo: "https://tattoo-ar.vercel.app", grad: "from-[#1a1325] to-[#5b2a6e]" },
      { title: "Vanty Digital", cat: "Plataforma · EdTech", url: "vantydigital.com", desc: "Agencia y academia online con membresías y panel de gestión.", tags: ["React", "Node.js", "Supabase"], demo: "https://vantydigital.com", grad: "from-[#2a1416] to-[#6a2931]" },
      { title: "Flowers by Me", cat: "E-commerce · Floristería", url: "flowersbyme.shop", desc: "Floristería online con carrito, pagos con Square y panel admin.", tags: ["React", "Vite", "Supabase"], demo: "https://flowersbyme.shop", grad: "from-[#3a2a3f] to-[#7a4a5e]" },
      { title: "Dashboard Financiero", cat: "Web App · Data", url: "dashboard.saae", desc: "Métricas e informes financieros en tiempo real.", tags: ["React", "Tailwind", "Charts"], demo: "https://dashboard-finance-cuyr.vercel.app", code: "https://github.com/StefanoAbate27/Dashboard-Finance", grad: "from-[#1B2A4A] to-[#3557a3]" },
      { title: "Landing 360 SEC", cat: "Landing · Conversión", url: "360sec.app", desc: "Landing de conversión rápida y clara para captar clientes.", tags: ["React", "Vite", "Figma"], demo: "https://360sec.vercel.app", code: "https://github.com/StefanoAbate27/360sec", grad: "from-[#123040] to-[#2f6d86]" },
      { title: "Control de Voluntariados", cat: "Escritorio · PC Táchira", url: "pc-tachira.app", desc: "App de escritorio con base de datos y reportes.", tags: ["Electron", "React", "DB"], demo: "https://drive.google.com/file/d/1bd2NLuVbDrjiuU4neER2xHDuxumczn4D/view?usp=share_link", code: "https://github.com/StefanoAbate27/control-voluntariados-pc-tachira", grad: "from-[#1f3a34] to-[#3f7d6b]" },
    ],
  },
  en: {
    eyebrow: "Selected work",
    title: "Projects",
    lead: "Real platforms in production, designed and built end to end.",
    demo: "View project",
    projects: [
      { title: "Scottish Eyewear", cat: "E-commerce · CRM", url: "scottisheyewear.com", desc: "Eyewear store with catalog, wholesale channel and management CRM.", tags: ["React", "TypeScript", "Supabase"], demo: "https://scottisheyewear.com", grad: "from-[#1f2d27] to-[#6a2a2f]" },
      { title: "Fidup", cat: "SaaS · Loyalty", url: "getfidup.com", desc: "Digital loyalty cards for Apple Wallet and Google Wallet.", tags: ["Node.js", "Wallet", "Docker"], demo: "https://getfidup.com", grad: "from-[#0f2a2e] to-[#1f7a6b]" },
      { title: "Tattoo AR", cat: "WebAR · Augmented reality", url: "tattoo-ar.vercel.app", desc: "Tattoos that come alive with augmented reality, no app install.", tags: ["WebAR", "WebGL", "Supabase"], demo: "https://tattoo-ar.vercel.app", grad: "from-[#1a1325] to-[#5b2a6e]" },
      { title: "Vanty Digital", cat: "Platform · EdTech", url: "vantydigital.com", desc: "Agency and online academy with memberships and management panel.", tags: ["React", "Node.js", "Supabase"], demo: "https://vantydigital.com", grad: "from-[#2a1416] to-[#6a2931]" },
      { title: "Flowers by Me", cat: "E-commerce · Florist", url: "flowersbyme.shop", desc: "Online florist with cart, Square payments and admin panel.", tags: ["React", "Vite", "Supabase"], demo: "https://flowersbyme.shop", grad: "from-[#3a2a3f] to-[#7a4a5e]" },
      { title: "Financial Dashboard", cat: "Web App · Data", url: "dashboard.saae", desc: "Real-time financial metrics and reporting.", tags: ["React", "Tailwind", "Charts"], demo: "https://dashboard-finance-cuyr.vercel.app", code: "https://github.com/StefanoAbate27/Dashboard-Finance", grad: "from-[#1B2A4A] to-[#3557a3]" },
      { title: "Landing 360 SEC", cat: "Landing · Conversion", url: "360sec.app", desc: "Fast, clear conversion landing to capture clients.", tags: ["React", "Vite", "Figma"], demo: "https://360sec.vercel.app", code: "https://github.com/StefanoAbate27/360sec", grad: "from-[#123040] to-[#2f6d86]" },
      { title: "Volunteer Manager", cat: "Desktop · PC Táchira", url: "pc-tachira.app", desc: "Desktop app with database and reports.", tags: ["Electron", "React", "DB"], demo: "https://drive.google.com/file/d/1bd2NLuVbDrjiuU4neER2xHDuxumczn4D/view?usp=share_link", code: "https://github.com/StefanoAbate27/control-voluntariados-pc-tachira", grad: "from-[#1f3a34] to-[#3f7d6b]" },
    ],
  },
};

const ease = [0.16, 1, 0.3, 1];

export default function Projects() {
  const { language } = useLanguage();
  const t = DATA[language] || DATA.es;
  const [active, setActive] = useState(null);
  const previewRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  const onMove = (e) => {
    pos.current = { x: e.clientX, y: e.clientY };
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (previewRef.current) {
          previewRef.current.style.left = pos.current.x + "px";
          previewRef.current.style.top = pos.current.y + "px";
        }
      });
    }
  };

  return (
    <div className="relative py-24 md:py-32" onMouseMove={onMove}>
      <div className="container-x">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6 md:mb-16">
          <div className="reveal">
            <span className="eyebrow">{t.eyebrow}</span>
            <h2 className="display-hero mt-5 text-5xl text-ink sm:text-6xl md:text-7xl">{t.title}</h2>
          </div>
          <p className="reveal max-w-sm text-base font-medium leading-relaxed text-muted" data-delay="100">{t.lead}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6">
          {t.projects.map((p, i) => (
            <motion.a
              key={p.title}
              href={p.demo}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor={t.demo}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, ease, delay: (i % 2) * 0.08 }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive((cur) => (cur === i ? null : cur))}
              className="glass glass-hover group relative flex flex-col overflow-hidden rounded-3xl p-7 md:p-8"
            >
              {/* project identity bar */}
              <span className={`pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${p.grad} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

              <div className="flex items-start justify-between gap-4">
                <span className="text-4xl font-light leading-none text-accent md:text-5xl">{String(i + 1).padStart(2, "0")}</span>
                <span className="mt-1 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-muted md:text-[11px]">{p.cat}</span>
              </div>

              <h3 className="mt-8 text-2xl font-bold tracking-[-0.03em] text-ink md:text-3xl">{p.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted md:text-base">{p.desc}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {p.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-line/12 bg-bg/60 px-3 py-1.5 text-xs font-medium text-ink/80">{tag}</span>
                ))}
              </div>

              <div className="mt-7 flex items-center justify-between gap-3 border-t border-line/10 pt-5">
                <span className="min-w-0 flex-1 truncate text-xs text-muted">{p.url}</span>
                <div className="flex shrink-0 items-center gap-3">
                  {p.code && (
                    <button type="button" aria-label="Code" onClick={(e) => { e.preventDefault(); window.open(p.code, "_blank"); }}
                      className="grid h-9 w-9 place-items-center rounded-full border border-line/15 text-ink transition-colors hover:border-ink">
                      <Github size={15} />
                    </button>
                  )}
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-accent">
                    {t.demo}
                    <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Cursor-following preview (desktop) */}
      <div ref={previewRef} className="pointer-events-none fixed left-0 top-0 z-[60] hidden lg:block">
        {t.projects.map((p, i) => (
          <div
            key={p.title}
            className={`absolute left-0 top-0 aspect-[16/10] w-64 -translate-x-1/2 -translate-y-[115%] overflow-hidden rounded-xl border border-line/20 shadow-2xl transition-all duration-300 ease-expo
              ${active === i ? "scale-100 opacity-100 blur-0" : "scale-90 opacity-0 blur-md"}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${p.grad}`}>
              <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                <span className="ml-2 h-2 w-20 rounded-full bg-white/20" />
              </div>
              <div className="absolute inset-0 grid place-items-center">
                <span className="text-xl font-bold uppercase tracking-tight text-white/90 drop-shadow">{p.title}</span>
              </div>
              <div className="absolute bottom-2 left-3 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/70">
                <Eye size={11} /> {p.cat}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
