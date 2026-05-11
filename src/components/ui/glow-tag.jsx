import * as React from "react"
import { cn } from "@/lib/utils"

const glowVariants = {
  cyan: "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[inset_0_0_12px_rgba(6,182,212,0.2),0_0_12px_rgba(6,182,212,0.3)]",
  blue: "bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-[inset_0_0_12px_rgba(59,130,246,0.2),0_0_12px_rgba(59,130,246,0.3)]",
  purple: "bg-purple-500/10 border-purple-500/40 text-purple-400 shadow-[inset_0_0_12px_rgba(168,85,247,0.2),0_0_12px_rgba(168,85,247,0.3)]",
  yellow: "bg-yellow-500/10 border-yellow-500/40 text-yellow-400 shadow-[inset_0_0_12px_rgba(234,179,8,0.2),0_0_12px_rgba(234,179,8,0.3)]",
  green: "bg-green-500/10 border-green-500/40 text-green-400 shadow-[inset_0_0_12px_rgba(34,197,94,0.2),0_0_12px_rgba(34,197,94,0.3)]",
  red: "bg-red-500/10 border-red-500/40 text-red-400 shadow-[inset_0_0_12px_rgba(239,68,68,0.2),0_0_12px_rgba(239,68,68,0.3)]",
  orange: "bg-orange-500/10 border-orange-500/40 text-orange-400 shadow-[inset_0_0_12px_rgba(249,115,22,0.2),0_0_12px_rgba(249,115,22,0.3)]",
  pink: "bg-pink-500/10 border-pink-500/40 text-pink-400 shadow-[inset_0_0_12px_rgba(236,72,153,0.2),0_0_12px_rgba(236,72,153,0.3)]",
  gray: "bg-zinc-400/10 border-zinc-400/40 text-zinc-300 shadow-[inset_0_0_12px_rgba(161,161,170,0.2),0_0_12px_rgba(161,161,170,0.3)]",
}

const GlowTag = React.forwardRef(({ className, color = "blue", icon: Icon, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-solid text-sm font-semibold backdrop-blur-md transition-all duration-300 cursor-default hover:brightness-125 select-none",
        "tracking-wide",
        glowVariants[color] || glowVariants.blue,
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-current opacity-90 text-black/80">
          <Icon className="w-3.5 h-3.5 stroke-[3] text-black mix-blend-plus-darker" />
        </div>
      )}
      <span className="drop-shadow-[0_0_8px_currentColor]">{children}</span>
    </div>
  )
})
GlowTag.displayName = "GlowTag"

export { GlowTag }
