import React, { useEffect, useRef, useState } from "react";

/**
 * Custom cursor: a small dot that tracks the pointer 1:1 and a trailing ring
 * that lerps behind it and expands over interactive elements (aboutluca vibe).
 * Disabled on touch / coarse pointers.
 */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);
    document.body.classList.add("custom-cursor");

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: mouse.x, y: mouse.y };
    let rafId;

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
      }
    };

    const render = () => {
      ring.x += (mouse.x - ring.x) * 0.18;
      ring.y += (mouse.y - ring.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      }
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    const interactiveSel = 'a, button, input, textarea, select, [data-cursor], .cursor-hover';
    const onOver = (e) => {
      const t = e.target.closest(interactiveSel);
      if (t) {
        setHovering(true);
        setLabel(t.getAttribute("data-cursor") || "");
      }
    };
    const onOut = (e) => {
      const t = e.target.closest(interactiveSel);
      if (t) {
        setHovering(false);
        setLabel("");
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.body.classList.remove("custom-cursor");
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block" aria-hidden>
      <div
        ref={dotRef}
        className="absolute left-0 top-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-accent"
        style={{ transition: "opacity .3s" }}
      />
      <div
        ref={ringRef}
        className={`absolute left-0 top-0 flex items-center justify-center rounded-full border border-accent
          transition-[width,height,margin,background-color,opacity] duration-300 ease-expo
          ${hovering ? "h-16 w-16 -ml-8 -mt-8 bg-accent/10" : "h-9 w-9 -ml-[18px] -mt-[18px] bg-transparent"}`}
      >
        {label && (
          <span className="font-mono text-[9px] uppercase tracking-widest text-accent">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
