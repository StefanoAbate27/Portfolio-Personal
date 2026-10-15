import React, { Suspense, lazy, useState } from "react";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import useSmoothScroll from "./hooks/useSmoothScroll";
import useReveal from "./hooks/useReveal";
import useScrollFx from "./hooks/useScrollFx";
import { useLanguage } from "./context/LanguageContext";
import ScrollProgress from "./components/ScrollProgress";

import Preloader from "./components/Preloader";
import CustomCursor from "./components/CustomCursor";
import ParticleField from "./components/ParticleField";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Skills from "./components/Skills";
const ProjectsSpiral = lazy(() => import("./components/ProjectsSpiral"));
import SiteFrame from "./components/SiteFrame";
import Process from "./components/Process";
import WhySaae from "./components/WhySaae";
import Founder from "./components/Founder";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

function Site() {
  useSmoothScroll();
  useReveal();
  const { language } = useLanguage();
  useScrollFx([language]);

  return (
    <div className="grain relative min-h-screen">
      <ParticleField />
      <CustomCursor />
      <ScrollProgress />
      <SiteFrame />
      <Header />

      <main className="relative z-10">
        <section id="inicio" className="panel">
          <Hero />
        </section>

        <section id="fundador" className="panel">
          <Founder />
        </section>

        <section id="nosotros" className="panel section-alt">
          <Skills />
        </section>

        <section id="proceso" className="panel">
          <Process />
        </section>

        <section id="proyectos" className="panel" data-stack="off">
          <Suspense fallback={<div className="spiral-bg h-[100svh]" />}><ProjectsSpiral /></Suspense>
        </section>

        <section id="por-que" className="panel">
          <WhySaae />
        </section>

        <section id="contacto" className="panel section-alt">
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
