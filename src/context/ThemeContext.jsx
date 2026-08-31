import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

function prefersDark() {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch (_) {
    return false;
  }
}

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored; // manual choice wins
  } catch (_) {}
  // otherwise follow the device theme
  return prefersDark() ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // apply the class (no persisting here — only manual choices persist)
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  // follow the device theme automatically, until the user chooses manually
  useEffect(() => {
    let mq;
    try {
      mq = window.matchMedia("(prefers-color-scheme: dark)");
    } catch (_) {
      return;
    }
    const onChange = (e) => {
      try {
        const stored = localStorage.getItem("theme");
        if (stored === "light" || stored === "dark") return; // manual wins
      } catch (_) {}
      setTheme(e.matches ? "dark" : "light");
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  const persist = (t) => {
    try {
      localStorage.setItem("theme", t);
    } catch (_) {}
  };

  const toggleTheme = () =>
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      persist(next);
      return next;
    });

  const setThemeManual = (t) => {
    persist(t);
    setTheme(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeManual }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
