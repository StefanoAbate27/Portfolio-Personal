import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";

export default function Contact() {
  const { language } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const texts = {
    es: {
      titulo: "Hablemos 👋",
      descripcion:
        "¿Tienes un proyecto, idea o colaboración? Estoy disponible para escucharte y crear algo increíble juntos.",
      placeholderName: "Tu nombre",
      placeholderEmail: "Tu correo electrónico",
      placeholderMsg: "Cuéntame sobre tu proyecto o idea",
      enviar: "Enviar mensaje",
      enviando: "Enviando...",
      alertaCompletar: "Por favor, completa todos los campos.",
      alertaEnviado: "Redirigiendo a WhatsApp...",
    },
    en: {
      titulo: "Let's talk 👋",
      descripcion:
        "Have a project, idea, or collaboration? I’m available to chat and build something amazing together.",
      placeholderName: "Your name",
      placeholderEmail: "Your email",
      placeholderMsg: "Tell me about your project or idea",
      enviar: "Send message",
      enviando: "Sending...",
      alertaCompletar: "Please fill all fields.",
      alertaEnviado: "Redirecting to WhatsApp...",
    },
  };

  const t = texts[language];

  const submit = (e) => {
    e.preventDefault();
    if (!name || !email || !msg) return alert(t.alertaCompletar);

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(t.alertaEnviado);
      const texto = `Hola, soy ${name}. Mi correo es ${email}. Quisiera hablar sobre: ${msg}`;
      const url = `https://wa.me/584247582675?text=${encodeURIComponent(texto)}`;
      window.open(url, "_blank");
      setName("");
      setEmail("");
      setMsg("");
    }, 800);
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center text-gray-800 overflow-hidden bg-transparent">
      {/* Sección principal */}
      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 px-6 py-20 lg:py-0">
        {/* Columna izquierda */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col justify-center px-4 space-y-8"
        >
          <h2
            className="text-5xl font-bold text-gray-900 leading-tight"
            style={{
              textShadow:
                "0 10px 40px rgba(59,130,246,0.4), 0 14px 50px rgba(59,130,246,0.6), 0 10px 40px rgba(59,130,246,0.4)",
            }}
          >
            {t.titulo}
          </h2>

          <p className="text-lg text-gray-600 max-w-md">{t.descripcion}</p>

          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaMapMarkerAlt className="text-blue-600 text-xl" />
              </div>
              <span className="text-gray-700 font-medium">
                San Cristóbal, Táchira - Venezuela
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaEnvelope className="text-blue-600 text-xl" />
              </div>
              <a
                href="mailto:stefanoabate2002@gmail.com"
                className="text-blue-700 hover:underline font-medium"
              >
                stefanoabate2002@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <FaWhatsapp className="text-green-600 text-xl" />
              </div>
              <a
                href="https://wa.me/584247582675"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:underline font-medium"
              >
                +58 424 758 2675
              </a>
            </div>
          </div>
        </motion.div>

        {/* Columna derecha (formulario) */}
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="relative bg-gray-900 p-10 rounded-3xl shadow-[0_0_35px_rgba(59,130,246,0.6)] overflow-hidden flex flex-col justify-center space-y-6"
        >
          <div className="absolute inset-0 border border-blue-400/30 rounded-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.placeholderName}
              className="p-4 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.placeholderEmail}
              type="email"
              className="p-4 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            rows="6"
            placeholder={t.placeholderMsg}
            className="w-full p-4 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          ></textarea>

          <div className="flex justify-end mt-6">
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 px-7 py-3 rounded-full bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold text-lg shadow-[0_0_20px_rgba(34,197,94,0.8)] hover:shadow-[0_0_30px_rgba(34,197,94,1)] transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                t.enviando
              ) : (
                <>
                  <FaWhatsapp className="text-2xl animate-pulse" />
                  {t.enviar}
                </>
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}