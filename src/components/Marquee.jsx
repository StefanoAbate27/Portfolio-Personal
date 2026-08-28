import React from "react";

/**
 * Infinite horizontal marquee. Duplicates children so the -50% translate loops
 * seamlessly. `items` is an array of strings; `sep` is the divider glyph.
 */
export default function Marquee({
  items = [],
  reverse = false,
  speed = "normal",
  className = "",
  sep = "✳",
}) {
  const speedClass =
    speed === "fast"
      ? "animate-marquee-fast"
      : speed === "slow"
      ? reverse
        ? "animate-marquee-reverse-slow"
        : "animate-marquee-slow"
      : reverse
      ? "animate-marquee-reverse"
      : "animate-marquee";

  const group = (
    <div className="flex shrink-0 items-center">
      {items.map((it, i) => (
        <span key={i} className="flex items-center">
          <span className="whitespace-nowrap">{it}</span>
          <span className="mx-6 text-accent md:mx-10">{sep}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={`flex w-full overflow-hidden ${className}`}>
      <div className={`flex min-w-max ${speedClass}`}>
        {group}
        {group}
      </div>
    </div>
  );
}
