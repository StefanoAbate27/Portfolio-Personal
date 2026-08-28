import React from "react";
import { useTheme } from "../context/ThemeContext";
import navyMark from "../assets/saae-mark.png";       // navy brackets + ochre dot (transparent)
import creamMark from "../assets/saae-mark-cream-t.png"; // cream brackets + ochre dot (transparent)

/**
 * Official SAAE isotype (real logo assets), theme-aware.
 * tone:
 *   "auto"   → navy on light bg, cream on dark bg (page background placements)
 *   "invert" → the opposite (use on ink/navy chips & seals)
 *   "onDark" → always cream · "onLight" → always navy
 */
export default function SaaeLogo({ size = 28, className = "", tone = "auto", alt = "SAAE" }) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  let useCream;
  if (tone === "onDark") useCream = true;
  else if (tone === "onLight") useCream = false;
  else if (tone === "invert") useCream = !dark;
  else useCream = dark;

  return (
    <img
      src={useCream ? creamMark : navyMark}
      width={size}
      height={size}
      alt={alt}
      draggable="false"
      className={`inline-block select-none object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
