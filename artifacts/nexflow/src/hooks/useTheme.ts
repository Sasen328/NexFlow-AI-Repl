import { useState, useEffect } from "react";

const KEY   = "nf:theme";
const EVENT = "nf:theme-change";

function readDark() {
  const stored = localStorage.getItem(KEY);
  if (stored !== null) return stored === "dark";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function applyDark(val: boolean) {
  document.documentElement.classList.toggle("dark", val);
  localStorage.setItem(KEY, val ? "dark" : "light");
  window.dispatchEvent(new Event(EVENT));
}

/** Initialise once when the module is first imported so the class is applied
 *  before any React component renders. */
applyDark(readDark());

export function useTheme() {
  const [dark, setDarkState] = useState(readDark);

  useEffect(() => {
    const sync = () => {
      const v = readDark();
      setDarkState(v);
      document.documentElement.classList.toggle("dark", v);
    };
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage",  sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage",  sync);
    };
  }, []);

  const setDark = (val: boolean) => {
    setDarkState(val);
    applyDark(val);
  };

  const toggle = () => setDark(!dark);

  return { dark, setDark, toggle };
}
