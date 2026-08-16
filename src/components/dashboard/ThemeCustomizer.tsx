"use client";

import { useState } from "react";
import { useStore, useCurrentUser } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Palette, Sun, Moon, Stars, Check, Monitor } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const THEMES = [
  { id: "light", name: "Light", icon: Sun, bg: "#FFFFFF", card: "#F8F9FA", primary: "#FF8C00" },
  { id: "dark", name: "Dark", icon: Moon, bg: "#0B0F19", card: "#1A1D24", primary: "#FF8C00" },
  { id: "night", name: "Night", icon: Stars, bg: "#000000", card: "#0A0A0A", primary: "#9C27B0" },
];

const ACCENT_COLORS = [
  { id: "orange", name: "Orange", value: "#FF8C00" },
  { id: "purple", name: "Purple", value: "#9C27B0" },
  { id: "blue", name: "Blue", value: "#2196F3" },
  { id: "green", name: "Green", value: "#4CAF50" },
  { id: "red", name: "Red", value: "#F44336" },
  { id: "pink", name: "Pink", value: "#E91E63" },
  { id: "teal", name: "Teal", value: "#009688" },
  { id: "gold", name: "Gold", value: "#FFD700" },
];

const BACKGROUNDS = [
  { id: "none", name: "None" },
  { id: "stars", name: "Starfield" },
  { id: "gradient1", name: "Sunset" },
  { id: "gradient2", name: "Ocean" },
  { id: "gradient3", name: "Forest" },
];

export function ThemeCustomizer() {
  const user = useCurrentUser();
  const [theme, setTheme] = useState("dark");
  const [accentColor, setAccentColor] = useState("#FF8C00");
  const [background, setBackground] = useState("stars");

  const applyTheme = (themeId: string) => {
    setTheme(themeId);
    const root = document.documentElement;
    if (themeId === "light") {
      root.classList.remove("dark", "night");
    } else if (themeId === "dark") {
      root.classList.add("dark");
      root.classList.remove("night");
    } else if (themeId === "night") {
      root.classList.add("dark", "night");
    }
    toast.success(`${themeId.charAt(0).toUpperCase() + themeId.slice(1)} mode applied`);
  };

  const applyAccent = (color: string) => {
    setAccentColor(color);
    const root = document.documentElement;
    root.style.setProperty("--primary", color);
    root.style.setProperty("--ring", color);
    root.style.setProperty("--sidebar-primary", color);
    root.style.setProperty("--sidebar-ring", color);
    toast.success("Accent color updated");
  };

  const applyBackground = (bgId: string) => {
    setBackground(bgId);
    const body = document.body;
    body.setAttribute("data-bg", bgId);
    toast.success("Background updated");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Palette className="w-7 h-7 text-primary" /> Theme & Screen Customization
        </h1>
        <p className="text-muted-foreground mt-1">Customize the website appearance — choose your preferred mode, colors, and background.</p>
      </div>

      {/* Mode selection */}
      <Card>
        <CardHeader>
          <CardTitle>Display Mode</CardTitle>
          <CardDescription>Choose between Light, Dark, or Night mode</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {THEMES.map((t) => (
              <motion.div key={t.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <Card
                  className={`cursor-pointer transition-all ${theme === t.id ? "border-primary border-2 ring-2 ring-primary/20" : ""}`}
                  onClick={() => applyTheme(t.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className="grid place-items-center w-12 h-12 mx-auto mb-2 rounded-xl"
                      style={{ backgroundColor: t.bg, border: `1px solid ${t.card}` }}
                    >
                      <t.icon className="w-6 h-6" style={{ color: t.primary }} />
                    </div>
                    <p className="font-medium text-sm">{t.name}</p>
                    {theme === t.id && (
                      <div className="mt-1 grid place-items-center">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accent color */}
      <Card>
        <CardHeader>
          <CardTitle>Accent Color</CardTitle>
          <CardDescription>Choose your preferred highlight color</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {ACCENT_COLORS.map((c) => (
              <motion.button
                key={c.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => applyAccent(c.value)}
                className={`relative grid place-items-center w-12 h-12 rounded-full transition-all ${accentColor === c.value ? "ring-2 ring-offset-2 ring-offset-background" : ""}`}
                style={{ backgroundColor: c.value, ringColor: c.value }}
              >
                {accentColor === c.value && <Check className="w-5 h-5 text-white" />}
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Background */}
      <Card>
        <CardHeader>
          <CardTitle>Background Style</CardTitle>
          <CardDescription>Choose a background pattern or gradient</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {BACKGROUNDS.map((bg) => (
              <Card
                key={bg.id}
                className={`cursor-pointer transition-all ${background === bg.id ? "border-primary border-2" : ""}`}
                onClick={() => applyBackground(bg.id)}
              >
                <CardContent className="p-3 text-center">
                  <div className="h-16 rounded-lg mb-2 overflow-hidden" style={{
                    background: bg.id === "none" ? "var(--background)" :
                    bg.id === "stars" ? "radial-gradient(2px 2px at 30% 30%, white, transparent), radial-gradient(1px 1px at 70% 60%, white, transparent), #0B0F19" :
                    bg.id === "gradient1" ? "linear-gradient(135deg, #FF6B6B, #FFE66D)" :
                    bg.id === "gradient2" ? "linear-gradient(135deg, #2E3192, #1BFFFF)" :
                    bg.id === "gradient3" ? "linear-gradient(135deg, #134E5E, #71B280)" : "var(--background)"
                  }} />
                  <p className="text-xs font-medium">{bg.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Layout density */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Density</CardTitle>
          <CardDescription>Adjust spacing and compactness</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "comfortable", name: "Comfortable", spacing: "p-4" },
              { id: "compact", name: "Compact", spacing: "p-2" },
              { id: "spacious", name: "Spacious", spacing: "p-6" },
            ].map((d) => (
              <Card key={d.id} className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className={`text-center ${d.spacing}`}>
                  <Monitor className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs font-medium">{d.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reset */}
      <Button variant="outline" className="w-full" onClick={() => {
        applyTheme("dark");
        applyAccent("#FF8C00");
        applyBackground("stars");
        toast.success("Theme reset to default");
      }}>
        Reset to Default
      </Button>
    </div>
  );
}
