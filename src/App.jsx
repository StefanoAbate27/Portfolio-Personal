import React, { useState } from "react";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import useSmoothScroll from "./hooks/useSmoothScroll";
import useReveal from "./hooks/useReveal";

import Preloader from "./components/Preloader";
import CustomCursor from "./components/CustomCursor";
import ParticleField from "./components/ParticleField";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Process from "./components/Process";
import WhySaae from "./components/WhySaae";
import Founder from "./components/Founder";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import SectionDivider from "./components/SectionDivider";

function Site() {
  const { language } = useLanguage();
  useSmoothScroll();
  useReveal();

  const D = language === "es"
    ? {
        a: ["Estudio de Desarrollo Web", "Sistemas a medida", "Construido con maestría", "SAAE"],
        b: ["El Fundador", "Stefano Abate", "CEO & Fundador", "Desde 2025"],
        c: ["Sobre Nosotros", "Diseño", "Desarrollo", "Producto", "SAAE"],
        d: ["Cómo trabajamos", "Del boceto al lanzamiento", "Entrega ágil", "SAAE"],
        e: ["Trabajo seleccionado", "Web · Data · E-commerce", "Enviado a producción", "SAAE"],
      }
    : {
        a: ["Web Development Studio", "Bespoke systems", "Built with mastery", "SAAE"],
        b: ["The Founder", "Stefano Abate", "CEO & Founder", "Since 2025"],
        c: ["About Us", "Design", "Development", "Product", "SAAE"],
        d: ["How we work", "Sketch to launch", "Agile delivery", "SAAE"],
        e: ["Selected work", "Web · Data · E-commerce", "Shipped to production", "SAAE"],
      };

  return (
    <div className="grain relative min-h-screen">
      <ParticleField />
      <CustomCursor />
      <Header />

      <main className="relative z-10">
        <section id="inicio">
          <Hero />
        </section>

        <SectionDivider items={D.a} />

        <section id="fundador">
          <Founder />
        </section>

        <SectionDivider items={D.c} reverse />

        <section id="nosotros">
          <Skills />
        </section>

        <SectionDivider items={D.d} />

        <section id="proceso">
          <Process />
        </section>

        <SectionDivider items={D.e} reverse />

        <section id="proyectos">
          <Projects />
        </section>

        <SectionDivider items={D.a} />

        <section id="por-que">
          <WhySaae />
        </section>

        <section id="contacto">
          <Contact />
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  return (
    <ThemeProvider>
      <LanguageProvider>
        {!ready && <Preloader onDone={() => setReady(true)} />}
        <Site />
      </LanguageProvider>
    </ThemeProvider>
  );
}
