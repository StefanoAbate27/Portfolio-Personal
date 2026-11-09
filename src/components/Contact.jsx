import React, { useState } from "react";
import { ArrowRight, ChevronDown, Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";

/* Contacto al estilo de vantydigital.com: titular grande en dos líneas, una frase
   corta y un formulario limpio de campos subrayados. Envía por WhatsApp o correo. */
export default function Contact() {
  const { language } = useLanguage();
  const es = language === "es";
  const [f, setF] = useState({ name: "", email: "", type: "", msg: "", budget: 2 });
  const [err, setErr] = useState(false);

  const t = es ? {
    eyebrow: "Siguiente paso", a: "Es momento de", b: "construir tu proyecto",
    lead: "Cuéntanos qué necesitas y te respondemos en menos de 24 h.",
    name: "Nombre", email: "Correo electrónico", type: "¿Qué necesitas?",
    types: ["Página web / landing", "Tienda online", "Aplicación web", "Sistema interno", "Aún no lo tengo claro"],
    msg: "Cuéntanos brevemente tu idea", budget: "Presupuesto aproximado",
    budgets: ["Menos de $500", "$500 – $1.000", "$1.000 – $2.500", "$2.500 – $5.000", "$5.000 – $10.000", "Más de $10.000"], send: "Enviar por WhatsApp", mail: "o envíalo por correo",
    fill: "Completa tu nombre, correo y mensaje.", subject: "Nuevo proyecto para SAAE", hi: "Hola SAAE, soy",
  } : {
    eyebrow: "Next step", a: "It's time to", b: "build your project",
    lead: "Tell us what you need and we'll reply within 24 h.",
    name: "Name", email: "Email", type: "What do you need?",
    types: ["Website / landing", "Online store", "Web application", "Internal system", "Not sure yet"],
    msg: "Briefly tell us your idea", budget: "Approximate budget",
    budgets: ["Under $500", "$500 – $1,000", "$1,000 – $2,500", "$2,500 – $5,000", "$5,000 – $10,000", "Over $10,000"], send: "Send via WhatsApp", mail: "or send it by email",
    fill: "Fill in your name, email and message.", subject: "New project for SAAE", hi: "Hi SAAE, I'm",
  };

  const set = (k) => (e) => { setF((s) => ({ ...s, [k]: e.target.value })); setErr(false); };
  const body = () => `${t.hi} ${f.name} (${f.email}).\n${f.type ? f.type + "\n" : ""}${t.budget}: ${t.budgets[f.budget]}\n${f.msg}`;
  const ok = () => { const v = f.name && f.email && f.msg; setErr(!v); return v; };
  const wa = (e) => { e.preventDefault(); if (ok()) window.open(`https://wa.me/584247582675?text=${encodeURIComponent(body())}`, "_blank"); };
  const mail = () => { if (ok()) window.location.href = `mailto:stefanoabate.dev@gmail.com?subject=${encodeURIComponent(t.subject)}&body=${encodeURIComponent(body())}`; };

  const field = "w-full border-b-2 border-line/20 bg-transparent py-4 text-lg text-ink outline-none transition-colors placeholder:text-muted focus:border-ink md:text-xl";

  return (
    <div className="container-x py-24 md:py-40">
      <div className="flex flex-col justify-between gap-16 lg:flex-row lg:gap-20">
        <div className="lg:w-[50%]">
          <span className="eyebrow reveal">{t.eyebrow}</span>
          <h2 className="display-hero mt-6 text-ink">
            <span className="block text-5xl sm:text-6xl lg:text-[3.4rem] xl:text-[4.1rem]">{t.a}</span>
            <span className="block text-5xl text-accent sm:text-6xl lg:text-[3.4rem] xl:text-[4.1rem]">{t.b}</span>
          </h2>
          <p className="reveal mt-8 max-w-md text-lg font-medium text-muted md:text-xl">{t.lead}</p>
          <div className="reveal mt-10 flex flex-col gap-1 text-base font-semibold text-ink">
            <a href="mailto:stefanoabate.dev@gmail.com" className="inline-flex w-fit items-center gap-3 py-2 transition-colors hover:text-accent"><Mail size={18} /> stefanoabate.dev@gmail.com</a>
            <a href="https://wa.me/584247582675" target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-3 py-2 transition-colors hover:text-accent"><FaWhatsapp size={18} /> +58 424 758 2675</a>
          </div>
        </div>

        <form onSubmit={wa} className="reveal flex w-full flex-col gap-6 md:gap-8 lg:w-[50%] lg:pt-10" data-delay="120">
          <div className="flex flex-col gap-6 sm:flex-row md:gap-8">
            <input className={field} placeholder={t.name} value={f.name} onChange={set("name")} />
            <input className={field} type="email" placeholder={t.email} value={f.email} onChange={set("email")} />
          </div>
          <div className="relative">
            <select className={`${field} cursor-pointer appearance-none pr-10 ${f.type ? "" : "text-muted"}`} value={f.type} onChange={set("type")}>
              <option value="" disabled>{t.type}</option>
              {t.types.map((o) => <option key={o} value={o} className="bg-bg text-ink">{o}</option>)}
            </select>
            <ChevronDown size={20} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-muted" />
          </div>
          {/* barra de presupuesto */}
          <div className="pt-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-lg text-muted md:text-xl">{t.budget}</span>
              <span className="text-lg font-bold text-ink md:text-xl">{t.budgets[f.budget]}</span>
            </div>
            <input type="range" min="0" max={t.budgets.length - 1} step="1" value={f.budget}
              onChange={(e) => setF((s) => ({ ...s, budget: Number(e.target.value) }))}
              aria-label={t.budget} aria-valuetext={t.budgets[f.budget]}
              className="budget-range mt-5 w-full" style={{ "--p": `${(f.budget / (t.budgets.length - 1)) * 100}%` }} />
            <div className="mt-2 flex justify-between text-[11px] font-semibold text-muted">
              <span>{t.budgets[0]}</span><span>{t.budgets[t.budgets.length - 1]}</span>
            </div>
          </div>
          <textarea className={`${field} resize-none`} rows={3} placeholder={t.msg} value={f.msg} onChange={set("msg")} />
          {err && <p className="text-sm font-semibold text-[#c2410c]">{t.fill}</p>}
          <div className="mt-2 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            <button type="submit" data-cursor="Go" className="btn-primary w-full justify-center !px-9 !py-4 !text-sm uppercase tracking-widest sm:w-fit">
              <FaWhatsapp size={17} /> {t.send} <ArrowRight size={16} />
            </button>
            <button type="button" onClick={mail} className="py-3 text-sm font-semibold text-muted underline-offset-4 transition-colors hover:text-ink hover:underline">{t.mail}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
