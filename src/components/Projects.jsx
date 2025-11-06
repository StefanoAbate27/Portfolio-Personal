import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaReact,
  FaNodeJs,
  FaStripe,
  FaFigma,
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaPython,
} from "react-icons/fa";
import { SiTailwindcss, SiElectron, SiVite, SiStreamlit } from "react-icons/si";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { useLanguage } from "../context/LanguageContext";

export default function Projects() {
  const { language } = useLanguage();

  const translations = {
    es: {
      title: "Proyectos Destacados",
      demo: "Demo",
      code: "Código",
      projects: [
        {
          title: "Dashboard Financiero",
          desc: "Panel con métricas e informes avanzados.",
          demo: "https://dashboard-finance-cuyr.vercel.app",
          code: "https://github.com/StefanoAbate27/Dashboard-Finance",
        },
        {
          title: "Frontend Tienda minimalista",
          desc: "Tienda moderna con carrito y pagos integrados.",
          demo: "https://ecommerce-luxe-snowy.vercel.app/",
          code: "https://github.com/StefanoAbate27/Ecommerce-LUXE",
        },
        {
          title: "Landing 360 SEC",
          desc: "Landing optimizada para captar clientes.",
          demo: "https://360sec.vercel.app",
          code: "https://github.com/StefanoAbate27/360sec",
        },
        {
          title: "Control de Voluntariados PC Táchira",
          desc: "Sistema de escritorio con reportes y base de datos.",
          demo: "https://drive.google.com/file/d/1bd2NLuVbDrjiuU4neER2xHDuxumczn4D/view?usp=share_link",
          code: "https://github.com/StefanoAbate27/control-voluntariados-pc-tachira",
        },
        {
          title: "Analizador de Datos con Python",
          desc: "Herramienta para visualización y análisis estadístico.",
          demo: "https://py-financial-data-analyzer-pnz.streamlit.app",
          code: "https://github.com/StefanoAbate27/PY-Financial-Data-Analyzer",
        },
        {
          title: "Portafolio Interactivo",
          desc: "Sitio web moderno con efectos 3D y animaciones fluidas.",
          demo: "https://portfolio-five-gamma-zv3siuknw6.vercel.app/",
          code: "https://github.com/StefanoAbate27/Portfolio",
        },
      ],
    },

    en: {
      title: "Featured Projects",
      demo: "Demo",
      code: "Code",
      projects: [
        {
          title: "Financial Dashboard",
          desc: "Dashboard with advanced metrics and reports.",
          demo: "https://dashboard-finance-cuyr.vercel.app",
          code: "https://github.com/StefanoAbate27/Dashboard-Finance",
        },
        {
          title: "Frontend Minimal E-commerce",
          desc: "Modern store with cart and integrated payments.",
          demo: "https://ecommerce-luxe-snowy.vercel.app/",
          code: "https://github.com/StefanoAbate27/Ecommerce-LUXE",
        },
        {
          title: "Landing 360 SEC",
          desc: "Optimized landing page to attract clients.",
          demo: "https://360sec.vercel.app",
          code: "https://github.com/StefanoAbate27/360sec",
        },
        {
          title: "Volunteer Management - PC Táchira",
          desc: "Desktop system with reports and database integration.",
          demo: "https://drive.google.com/file/d/1bd2NLuVbDrjiuU4neER2xHDuxumczn4D/view?usp=share_link",
          code: "https://github.com/StefanoAbate27/control-voluntariados-pc-tachira",
        },
        {
          title: "Python Data Analyzer",
          desc: "Tool for statistical visualization and analysis.",
          demo: "https://py-financial-data-analyzer-pnz.streamlit.app",
          code: "https://github.com/StefanoAbate27/PY-Financial-Data-Analyzer",
        },
        {
          title: "Interactive Portfolio",
          desc: "Modern website with 3D effects and smooth animations.",
          demo: "https://portfolio-five-gamma-zv3siuknw6.vercel.app/",
          code: "https://github.com/StefanoAbate27/Portfolio",
        },
      ],
    },
  };

  const t = translations[language] || translations.es;

  const items = t.projects.map((p, i) => {
    let icons = [
      { icon: <FaReact />, color: "#61DBFB" },
      { icon: <SiTailwindcss />, color: "#38BDF8" },
      { icon: <FaFigma />, color: "#F24E1E" },
    ];

    if (p.title.includes("Voluntari") || p.title.includes("Volunteer")) {
      icons = [
        { icon: <FaReact />, color: "#61DBFB" },
        { icon: <SiElectron />, color: "#47848F" },
        { icon: <FaJs />, color: "#F7DF1E" },
        { icon: <SiTailwindcss />, color: "#38BDF8" },
        { icon: <SiVite />, color: "#646CFF" },
      ];
    }

    if (p.title.includes("E-commerce") || p.title.includes("Tienda")) {
      icons = [
        { icon: <FaJs />, color: "#F7DF1E" },
        { icon: <FaCss3Alt />, color: "#1572B6" },
        { icon: <FaHtml5 />, color: "#E34F26" },
      ];
    }

    if (p.title.includes("Python")) {
      icons = [
        { icon: <FaPython />, color: "#3776AB" },
        { icon: <SiStreamlit />, color: "#FF4B4B" },
      ];
    }

    if (p.title.includes("Landing 360 SEC")) {
      icons = [
        { icon: <FaHtml5 />, color: "#E34F26" },
        { icon: <FaCss3Alt />, color: "#1572B6" },
        { icon: <FaFigma />, color: "#F24E1E" },
        { icon: <FaReact />, color: "#61DBFB" },
        { icon: <SiVite />, color: "#646CFF" },
        { icon: <FaJs />, color: "#F7DF1E" },
      ];
    }

    return { ...p, id: i, icons };
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const particlesInit = async (main) => await loadFull(main);

  const floatVariants = {
    float: {
      y: [0, -12, 0, 12, 0],
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <div className="relative w-full min-h-[100vh] flex flex-col justify-center items-center px-4 sm:px-6 md:px-12">
      {/* Título */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-16 text-center drop-shadow-[0_0_20px_#3b82f6]">
        {t.title}
      </h2>

      {/* Tarjetas */}
      <div className="relative w-full flex justify-center items-center">
        <div
          style={{ perspective: 1400 }}
          className="relative w-full max-w-[1300px] flex flex-wrap justify-center items-center gap-8"
        >
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              variants={floatVariants}
              animate="float"
              onClick={() => setActiveIndex(i)}
              className="relative bg-gray-900 text-white rounded-2xl p-6 w-full sm:w-[350px] md:w-[400px] h-[300px] flex flex-col justify-between shadow-[0_0_15px_#1d4ed8,0_0_25px_#1e40af] border border-blue-500/30 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="text-center">
                <h3 className="text-xl md:text-2xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-white/80">{item.desc}</p>
              </div>

              {/* Íconos */}
              <div className="flex justify-center gap-5 mt-3 flex-wrap">
                {item.icons.map((iconObj, j) => (
                  <div
                    key={j}
                    className="transition-transform duration-300 ease-in-out"
                    style={{ filter: "drop-shadow(0 0 0 transparent)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.15)";
                      e.currentTarget.style.filter = `drop-shadow(0 0 10px ${iconObj.color}) drop-shadow(0 0 20px ${iconObj.color})`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.filter = "drop-shadow(0 0 0 transparent)";
                    }}
                  >
                    {React.cloneElement(iconObj.icon, {
                      size: 36,
                      color: "white",
                      style: { transition: "all 0.3s ease-in-out" },
                    })}
                  </div>
                ))}
              </div>

              {/* Botones */}
              <div className="flex justify-center gap-4 mt-4 flex-wrap">
                <motion.a
                  href={item.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, boxShadow: "0 0 18px rgba(59,130,246,0.5)" }}
                  className="px-6 py-2 bg-white text-gray-800 rounded-lg font-medium shadow-[0_0_10px_rgba(59,130,246,0.4)] transition-all duration-300"
                >
                  {t.demo}
                </motion.a>
                <motion.a
                  href={item.code}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, boxShadow: "0 0 18px rgba(59,130,246,0.5)" }}
                  className="px-6 py-2 bg-white text-gray-800 rounded-lg font-medium shadow-[0_0_10px_rgba(59,130,246,0.4)] transition-all duration-300"
                >
                  {t.code}
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}