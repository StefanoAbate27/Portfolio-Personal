import React from "react";
import Marquee from "./Marquee";

/** Thin, elegant navy marquee strip used to join sections (no white gaps). */
export default function SectionDivider({ items, reverse = false }) {
  return (
    <div className="border-y border-cream/10 bg-navy py-2.5 text-cream/85">
      <Marquee items={items} reverse={reverse} className="text-[11px] uppercase tracking-[0.3em] md:text-xs" sep="✳" />
    </div>
  );
}
