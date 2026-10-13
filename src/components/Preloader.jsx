import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SaaeLogo from "./SaaeLogo";

/**
 * Preloader estilo Vanty: el isotipo se rellena de abajo hacia arriba sobre
 * una versión tenue, y luego la cortina se desliza hacia arriba.
 */
export default function Preloader({ onDone }) {
  const [gone, setGone] = useState(false);
  const SIZE = 88;

  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setTimeout(() => setGone(true), 250);
    };
    // espera la carga + el relleno del logo (mín. ~1.8s, máx. 3s)
    const minT = setTimeout(() => {
      if (document.readyState === "complete") finish();
      else window.addEventListener("load", finish, { once: true });
    }, 1800);
    const maxT = setTimeout(finish, 3000);
    return () => {
      clearTimeout(minT);
      clearTimeout(maxT);
      window.removeEventListener("load", finish);
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-[10000] grid place-items-center bg-bg"
          exit={{ y: "-100%" }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="relative" style={{ width: SIZE, height: SIZE }}>
            <div className="absolute inset-0 opacity-20">
              <SaaeLogo size={SIZE} tone="auto" />
            </div>
            <motion.div
              className="absolute inset-0"
              initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
              transition={{ duration: 1.5, ease: [0.65, 0, 0.35, 1], delay: 0.15 }}
            >
              <SaaeLogo size={SIZE} tone="auto" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
