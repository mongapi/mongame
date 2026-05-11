import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

// Mapeo detallado de colores para recrear las sombras e iluminaciones compuestas
const colorVariants = {
  blue: {
    text: "text-blue-400",
    bgHighlight: "bg-blue-500",
    shadows: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-24px_40px_-10px_rgba(59,130,246,0.5),0_10px_30px_rgba(0,0,0,0.6)]",
    iconGlow: "drop-shadow-[0_0_18px_rgba(59,130,246,0.8)]"
  },
  purple: {
    text: "text-purple-400",
    bgHighlight: "bg-purple-500",
    shadows: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-24px_40px_-10px_rgba(168,85,247,0.5),0_10px_30px_rgba(0,0,0,0.6)]",
    iconGlow: "drop-shadow-[0_0_18px_rgba(168,85,247,0.8)]"
  },
  terra: {
    text: "text-amber-400",
    bgHighlight: "bg-amber-500",
    shadows: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-24px_40px_-10px_rgba(245,158,11,0.5),0_10px_30px_rgba(0,0,0,0.6)]",
    iconGlow: "drop-shadow-[0_0_18px_rgba(245,158,11,0.8)]"
  },
  pink: {
    text: "text-pink-400",
    bgHighlight: "bg-pink-500",
    shadows: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-24px_40px_-10px_rgba(236,72,153,0.5),0_10px_30px_rgba(0,0,0,0.6)]",
    iconGlow: "drop-shadow-[0_0_18px_rgba(236,72,153,0.8)]"
  },
  green: {
    text: "text-emerald-400",
    bgHighlight: "bg-emerald-500",
    shadows: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-24px_40px_-10px_rgba(52,211,153,0.5),0_10px_30px_rgba(0,0,0,0.6)]",
    iconGlow: "drop-shadow-[0_0_18px_rgba(52,211,153,0.8)]"
  }
};

export function GlowIconButton({ icon: Icon, color = "blue", className, onClick }) {
  const variant = colorVariants[color] || colorVariants.blue;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative group flex items-center justify-center w-28 h-28 rounded-[2rem]",
        "bg-[#111111]/90 backdrop-blur-3xl border border-white/5",
        "overflow-hidden transition-all duration-300 cursor-pointer",
        variant.shadows, // Sombras combinadas: la luz blanca superior, la luz inferior de color, y la sombra base
        className
      )}
    >


      {/* Ícono Frontal con Efecto Neón Extremo */}
      <div className={cn("relative z-10 transition-transform duration-500 group-hover:scale-110", variant.iconGlow)}>
        {Icon && <Icon className={cn("w-12 h-12 stroke-[2]", variant.text)} />}
      </div>
    </motion.button>
  );
}
