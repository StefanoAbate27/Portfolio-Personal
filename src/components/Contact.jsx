import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { Mail, MapPin, Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function Contact() {
  const { language } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", type: "", budget: "", msg: "" });
  const [loading, setLoading] = useState(false);

  const t = {
    es: {
      eyebrow: "Contacto",
      big1: "Empecemos",
      big2: "un proyecto",
      desc: "Cuéntanos qué quieres construir. Preparamos una propuesta clara y, si avanzamos, lo llevamos a producción con rapidez.",
      steps: [
        ["Cuéntanos tu idea", "Completa el formulario con tu objetivo y presupuesto."],
        ["Cotización en 24h", "Te enviamos alcance, plazo y precio sin compromiso."],
        ["Kickoff y entrega", "Arrancamos y lanzamos sin demoras."],
      ],
      typeLabel: "Tipo de proyecto",
      types: ["Landing", "Web App", "E-commerce", "Sistema interno"],
      budgetLabel: "Presupuesto aproximado",
      budgets: ["< $500", "$500 – $1.5k", "$1.5k – $5k", "$5k +"],
      name: "Tu nombre", email: "Tu correo", message: "Cuéntanos sobre tu proyecto",
      send: "Enviar por WhatsApp", sendMail: "Enviar por correo", sending: "Enviando...",
      or: "o",
      fill: "Completa nombre, correo y mensaje.",
      subject: "Nuevo proyecto para SAAE",
      avail: "Disponible para nuevos proyectos",
    },
    en: {
      eyebrow: "Contact",
      big1: "Let's start",
      big2: "a project",
      desc: "Tell us what you want to build. We prepare a clear proposal and, if we move forward, ship it to production fast.",
      steps: [
        ["Tell us your idea", "Fill the form with your goal and budget."],
        ["Quote in 24h", "We send scope, timeline and price, no commitment."],
        ["Kickoff & delivery", "We start and launch without delays."],
      ],
      typeLabel: "Project type",
      types: ["Landing", "Web App", "E-commerce", "Internal system"],
      budgetLabel: "Approximate budget",
      budgets: ["< $500", "$500 – $1.5k", "$1.5k – $5k", "$5k +"],
      name: "Your name", email: "Your email", message: "Tell us about your project",
      send: "Send via WhatsApp", sendMail: "Send via email", sending: "Sending...",
      or: "or",
      fill: "Fill name, email and message.",
      subject: "New project for SAAE",
      avail: "Available for new projects",
    },
  }[language];

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const buildMessage = () =>
    (language === "es" ? "Hola SAAE, soy " : "Hi SAAE, I'm ") +
    `${form.name} (${form.email}).\n` +
    (language === "es" ? "Tipo" : "Type") + `: ${form.type || "—"} · ` +
    (language === "es" ? "Presupuesto" : "Budget") + `: ${form.budget || "—"}\n` +
    (language === "es" ? "Proyecto" : "Project") + `: ${form.msg}`;

  const valid = () => {
    if (!form.name || !form.email || !form.msg) { alert(t.fill); return false; }
    return true;
  };

  const sendWhatsApp = (e) => {
    e.preventDefault();
    if (!valid()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.open(`https://wa.me/584247582675?text=${encodeURIComponent(buildMessage())}`, "_blank");
      setForm({ name: "", email: "", type: "", budget: "", msg: "" });
    }, 500);
  };

  const sendEmail = () => {
    if (!valid()) return;
    const url = `mailto:stefanoabate.dev@gmail.com?subject=${encodeURIComponent(t.subject)}&body=${encodeURIComponent(buildMessage())}`;
    window.location.href = url;
  };

  const inputCls = "w-full rounded-xl border border-line/15 bg-bg/60 px-4 py-3.5 text-ink placeholder:text-muted/70 outline-none transition focus:border-ink";
  const chip = (active) =>
    `rounded-full border px-4 py-2 label transition-colors ${active ? "border-ink bg-ink text-bg" : "border-line/20 text-muted hover:border-ink hover:text-ink"}`;

  return (
    <div className="container-x py-24 md:py-32">
      <div className="mb-14 reveal">
        <span className="eyebrow">— {t.eyebrow}</span>
        <h2 className="display-hero title-depth mt-5 text-ink">
          <span className="block text-5xl sm:text-7xl md:text-[6.5vw]">{t.big1}</span>
          <span className="block text-5xl text-ink/85 sm:text-7xl md:text-[6.5vw]">{t.big2}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* LEFT — text / funnel */}
        <div className="reveal lg:col-span-5">
          <p className="max-w-md text-base leading-relaxed text-muted md:text-lg">{t.desc}</p>

          <ol className="mt-10 space-y-6">
            {t.steps.map(([title, d], i) => (
              <li key={i} className="flex gap-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line/20 font-display text-sm text-ink">{i + 1}</span>
                <div>
                  <h4 className="font-display text-base font-semibold text-ink">{title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{d}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 space-y-3 border-t border-line/12 pt-8">
            <a href="mailto:stefanoabate.dev@gmail.com" data-cursor="Mail" className="group flex items-center gap-3 text-ink">
              <Mail size={16} className="text-muted" /> <span className="font-display break-all">stefanoabate.dev@gmail.com</span>
            </a>
            <a href="https://wa.me/584247582675" target="_blank" rel="noopener noreferrer" data-cursor="Chat" className="group flex items-center gap-3 text-ink">
              <FaWhatsapp size={16} className="text-muted" /> <span className="font-display">+58 424 758 2675</span>
            </a>
            <div className="flex items-center gap-3 text-ink">
              <MapPin size={16} className="text-muted" /> <span className="font-display">San Cristóbal, Táchira — Venezuela</span>
            </div>
          </div>

          <div className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-line/15 px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="label text-muted">{t.avail}</span>
          </div>
        </div>

        {/* RIGHT — form */}
        <motion.form onSubmit={sendWhatsApp} className="reveal card-surface p-6 md:p-8 lg:col-span-7" data-delay="120">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input value={form.name} onChange={set("name")} placeholder={t.name} className={inputCls} />
            <input value={form.email} onChange={set("email")} placeholder={t.email} type="email" className={inputCls} />
          </div>

          <div className="mt-6">
            <span className="label text-muted">{t.typeLabel}</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {t.types.map((ty) => (
                <button type="button" key={ty} onClick={() => setForm((f) => ({ ...f, type: ty }))} className={chip(form.type === ty)}>
                  {form.type === ty && <Check size={12} className="mr-1 inline" />}{ty}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <span className="label text-muted">{t.budgetLabel}</span>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {t.budgets.map((b) => (
                <button type="button" key={b} onClick={() => setForm((f) => ({ ...f, budget: b }))}
                  className={`rounded-xl border px-3 py-3 text-center label transition-colors ${form.budget === b ? "border-accent bg-accent/10 text-ink" : "border-line/20 text-muted hover:border-ink hover:text-ink"}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <textarea value={form.msg} onChange={set("msg")} rows="4" placeholder={t.message} className={`mt-6 ${inputCls} resize-none`} />

          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <motion.button type="submit" disabled={loading} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} data-cursor="WhatsApp"
              className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-full bg-ink px-7 py-4 label text-bg transition disabled:opacity-50">
              <FaWhatsapp className="text-base" />
              {loading ? t.sending : t.send}
            </motion.button>
            <span className="text-center label text-muted sm:px-1">{t.or}</span>
            <motion.button type="button" onClick={sendEmail} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} data-cursor="Mail"
              className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-full border border-line/25 px-7 py-4 label text-ink transition hover:border-ink">
              <Mail className="text-base" size={16} />
              {t.sendMail}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
