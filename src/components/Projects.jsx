import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Github, Eye } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import SaaeLogo from "./SaaeLogo";

const DATA = {
  es: {
    eyebrow: "Trabajo seleccionado",
    title: "Proyectos",
    lead: "Plataformas en producción. Pasa el cursor para previsualizar.",
    demo: "Ver demo", code: "Código",
    projects: [
      { title: "Vanty Digital", cat: "Plataforma · EdTech", url: "vantydigital.com", desc: "Plataforma y academia online con membresías y panel.", tags: ["React", "Node", "Supabase"], demo: "https://vantydigital.com", grad: "from-[#1B2A4A] to-[#2b3f6b]" },
      { title: "Flowers by Me", cat: "E-commerce · Floristería", url: "flowersbyme.shop", desc: "Floristería con carrito, pagos Square y panel admin.", tags: ["React", "Vite", "Supabase"], demo: "https://flowersbyme.shop", grad: "from-[#3a2a3f] to-[#7a4a5e]" },
      { title: "Dashboard Financiero", cat: "Web App · Data", url: "dashboard.saae", desc: "Métricas e informes financieros en tiempo real.", tags: ["React", "Tailwind", "Charts"], demo: "https://dashboard-finance-cuyr.vercel.app", code: "https://github.com/StefanoAbate27/Dashboard-Finance", grad: "from-[#1B2A4A] to-[#3557a3]" },
      { title: "Tienda LUXE", cat: "E-commerce · Frontend", url: "luxe.store", desc: "Tienda moderna con carrito y pagos integrados.", tags: ["JS", "CSS", "HTML"], demo: "https://ecommerce-luxe-snowy.vercel.app/", code: "https://github.com/StefanoAbate27/Ecommerce-LUXE", grad: "from-[#4a3a24] to-[#a9803f]" },
      { title: "Landing 360 SEC", cat: "Landing · CRO", url: "360sec.app", desc: "Landing de conversión, rápida y clara.", tags: ["React", "Vite", "Figma"], demo: "https://360sec.vercel.app", code: "https://github.com/StefanoAbate27/360sec", grad: "from-[#123040] to-[#2f6d86]" },
      { title: "Control de Voluntariados", cat: "Escritorio · PC Táchira", url: "pc-tachira.app", desc: "App de escritorio con base de datos y reportes.", tags: ["Electron", "React", "DB"], demo: "https://drive.google.com/file/d/1bd2NLuVbDrjiuU4neER2xHDuxumczn4D/view?usp=share_link", code: "https://github.com/StefanoAbate27/control-voluntariados-pc-tachira", grad: "from-[#1f3a34] to-[#3f7d6b]" },
      { title: "Analizador de Datos", cat: "Python · Analytics", url: "analyzer.py", desc: "Visualización y análisis de datos con Python.", tags: ["Python", "Streamlit"], demo: "https://py-financial-data-analyzer-pnz.streamlit.app", code: "https://github.com/StefanoAbate27/PY-Financial-Data-Analyzer", grad: "from-[#2a2440] to-[#5a4a8b]" },
      { title: "Portafolio Interactivo", cat: "Web · Motion", url: "portfolio.dev", desc: "Sitio con movimiento y animaciones fluidas.", tags: ["React", "Framer", "GSAP"], demo: "https://portfolio-five-gamma-zv3siuknw6.vercel.app/", code: "https://github.com/StefanoAbate27/Portfolio", grad: "from-[#1B2A4A] to-[#c99a46]" },
    ],
  },
  en: {
    eyebrow: "Selected work",
    title: "Projects",
    lead: "Platforms in production. Hover to preview.",
    demo: "View demo", code: "Code",
    projects: [
      { title: "Vanty Digital", cat: "Platform · EdTech", url: "vantydigital.com", desc: "Platform and online academy with memberships and panel.", tags: ["React", "Node", "Supabase"], demo: "https://vantydigital.com", grad: "from-[#1B2A4A] to-[#2b3f6b]" },
      { title: "Flowers by Me", cat: "E-commerce · Florist", url: "flowersbyme.shop", desc: "Florist store with cart, Square payments and admin.", tags: ["React", "Vite", "Supabase"], demo: "https://flowersbyme.shop", grad: "from-[#3a2a3f] to-[#7a4a5e]" },
      { title: "Financial Dashboard", cat: "Web App · Data", url: "dashboard.saae", desc: "Real-time financial metrics and reporting.", tags: ["React", "Tailwind", "Charts"], demo: "https://dashboard-finance-cuyr.vercel.app", code: "https://github.com/StefanoAbate27/Dashboard-Finance", grad: "from-[#1B2A4A] to-[#3557a3]" },
      { title: "LUXE Store", cat: "E-commerce · Frontend", url: "luxe.store", desc: "Modern store with cart and integrated payments.", tags: ["JS", "CSS", "HTML"], demo: "https://ecommerce-luxe-snowy.vercel.app/", code: "https://github.com/StefanoAbate27/Ecommerce-LUXE", grad: "from-[#4a3a24] to-[#a9803f]" },
      { title: "Landing 360 SEC", cat: "Landing · CRO", url: "360sec.app", desc: "Conversion landing — fast and clear.", tags: ["React", "Vite", "Figma"], demo: "https://360sec.vercel.app", code: "https://github.com/StefanoAbate27/360sec", grad: "from-[#123040] to-[#2f6d86]" },
      { title: "Volunteer Manager", cat: "Desktop · PC Táchira", url: "pc-tachira.app", desc: "Desktop app with database and reports.", tags: ["Electron", "React", "DB"], demo: "https://drive.google.com/file/d/1bd2NLuVbDrjiuU4neER2xHDuxumczn4D/view?usp=share_link", code: "https://github.com/StefanoAbate27/control-voluntariados-pc-tachira", grad: "from-[#1f3a34] to-[#3f7d6b]" },
      { title: "Data Analyzer", cat: "Python · Analytics", url: "analyzer.py", desc: "Data visualization and analysis with Python.", tags: ["Python", "Streamlit"], demo: "https://py-financial-data-analyzer-pnz.streamlit.app", code: "https://github.com/StefanoAbate27/PY-Financial-Data-Analyzer", grad: "from-[#2a2440] to-[#5a4a8b]" },
      { title: "Interactive Portfolio", cat: "Web · Motion", url: "portfolio.dev", desc: "Site with motion and smooth animations.", tags: ["React", "Framer", "GSAP"], demo: "https://portfolio-five-gamma-zv3siuknw6.vercel.app/", code: "https://github.com/StefanoAbate27/Portfolio", grad: "from-[#1B2A4A] to-[#c99a46]" },
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
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div className="reveal">
            <span className="eyebrow">— {t.eyebrow}</span>
            <h2 className="display-hero mt-4 text-5xl text-ink sm:text-6xl md:text-7xl">{t.title}</h2>
          </div>
          <p className="reveal max-w-xs text-sm leading-relaxed text-muted" data-delay="100">{t.lead}</p>
        </div>

        <div className="flex flex-col gap-6 md:gap-8">
          {t.projects.map((p, i) => {
            const fromLeft = i % 2 === 0;
            return (
              <motion.a
                key={p.title}
                href={p.demo}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor={t.demo}
                initial={{ opacity: 0, x: fromLeft ? -70 : 70 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.8, ease }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive((cur) => (cur === i ? null : cur))}
                className={`group relative block w-full max-w-3xl overflow-hidden rounded-2xl border border-line/15 bg-elevated/80 p-6 backdrop-blur-md transition-all duration-500 ease-expo hover:-translate-y-1 hover:border-accent/40 md:p-8 ${fromLeft ? "mr-auto" : "ml-auto"}`}
              >
                {/* chrome dots */}
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full border border-line/25" />
                    <span className="h-2.5 w-2.5 rounded-full border border-line/25" />
                    <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                  </span>
                  <span className="flex-1 truncate rounded-md bg-bg/50 px-3 py-1 text-center text-[11px] text-muted">{p.url}</span>
                  <span className="font-display text-4xl font-semibold text-ink/10 md:text-5xl">{String(i + 1).padStart(2, "0")}</span>
                </div>

                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <div className="min-w-0">
                    <span className="label text-accent">{p.cat}</span>
                    <h3 className="mt-2 font-display text-2xl font-semibold text-ink transition-transform duration-500 ease-expo group-hover:translate-x-1 md:text-4xl">{p.title}</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{p.desc}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-line/15 px-3 py-1 label text-muted">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2.5">
                    <span className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 label text-bg transition-transform duration-500 ease-expo group-hover:-translate-y-0.5">
                      {t.demo} <ArrowUpRight size={14} />
                    </span>
                    {p.code && (
                      <button type="button" onClick={(e) => { e.preventDefault(); window.open(p.code, "_blank"); }}
                        className="grid h-10 w-10 place-items-center rounded-full border border-line/20 text-ink transition-colors hover:border-ink">
                        <Github size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>

      {/* Cursor-following smoke preview */}
      <div ref={previewRef} className="pointer-events-none fixed left-0 top-0 z-[60] hidden lg:block">
        {t.projects.map((p, i) => (
          <div
            key={p.title}
            className={`absolute left-0 top-0 aspect-[16/10] w-72 -translate-x-1/2 -translate-y-full overflow-hidden rounded-xl border border-line/20 shadow-2xl transition-all duration-300 ease-expo
              ${active === i ? "scale-100 opacity-100 blur-0" : "pointer-events-none scale-75 opacity-0 blur-md"}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${p.grad}`}>
              <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                <span className="ml-2 h-2 w-20 rounded-full bg-white/20" />
              </div>
              <div className="absolute inset-x-4 top-9 flex gap-3">
                <div className="h-12 w-12 rounded-lg bg-white/15" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-2.5 w-2/3 rounded bg-white/25" />
                  <div className="h-2 w-1/2 rounded bg-white/15" />
                </div>
              </div>
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-display text-xl font-semibold uppercase tracking-widest text-white/90 drop-shadow">{p.title}</span>
              </div>
              <div className="absolute bottom-2 left-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/70">
                <Eye size={11} /> {p.cat}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
