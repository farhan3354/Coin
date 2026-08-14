"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Toaster as AppToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProviderClient({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>((typeof window !== "undefined" && (localStorage.getItem("theme") as Theme)) || "dark");

  useEffect(() => {
    const apply = (t: Theme) => {
      const root = document.documentElement;
      if (t === "dark") root.classList.add("dark");
      else if (t === "light") root.classList.remove("dark");
      else {
        // system
        const prefers = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefers) root.classList.add("dark");
        else root.classList.remove("dark");
      }
    };
    apply(theme);
    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
      <AppToaster />
      <SonnerToaster />
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback: return a noop implementation
    return { theme: "dark" as Theme, setTheme: () => {} };
  }
  return ctx;
}

export default ThemeProviderClient;
