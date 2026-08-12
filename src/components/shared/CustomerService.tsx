"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Headphones, X, MessageCircle, Mail, Phone, WhatsApp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export function CustomerService() {
  const [open, setOpen] = useState(false);
  const { setView } = useStore();

  const options = [
    { icon: MessageCircle, label: "WhatsApp", value: "+971 50 932 7341", action: () => window.open("https://wa.me/971509327341", "_blank") },
    { icon: Mail, label: "Email", value: "support@earncoin.com", action: () => window.open("mailto:support@earncoin.com", "_blank") },
    { icon: Phone, label: "Phone", value: "+971 50 932 7341", action: () => {} },
    { icon: Headphones, label: "Support Ticket", value: "Open a ticket", action: () => setView("contact") },
  ];

  return (
    <>
      {/* Floating button on RIGHT side */}
      <motion.button
        initial={{ x: 80 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-30 grid place-items-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg"
        aria-label="Customer Service"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Headphones className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Expandable panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-30 w-64 rounded-xl border bg-card shadow-xl overflow-hidden"
          >
            <div className="p-4 border-b bg-primary/10">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Headphones className="w-4 h-4 text-primary" /> Customer Service
              </h3>
              <p className="text-xs text-muted-foreground mt-1">We're here to help 24/7</p>
            </div>
            <div className="p-2 space-y-1">
              {options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => { opt.action(); setOpen(false); }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <div className="grid place-items-center w-8 h-8 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <opt.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{opt.value}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
