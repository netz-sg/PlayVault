import type React from "react"
import { cn } from "@/lib/utils"

interface GlassContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "low" | "medium" | "high"
  border?: boolean
  glow?: boolean
  textContrast?: "low" | "high"
  overflow?: "visible" | "hidden" | "auto"
  children: React.ReactNode
}

export function GlassContainer({
  intensity = "medium",
  border = true,
  glow = false,
  textContrast = "low",
  overflow = "visible",
  className,
  children,
  ...props
}: GlassContainerProps) {
  const blurIntensity = {
    low: "backdrop-blur-sm",
    medium: "backdrop-blur-md",
    high: "backdrop-blur-lg",
  }

  const bgOpacity = {
    low: "bg-black/40",
    medium: "bg-black/50",
    high: "bg-black/60",
  }

  const overflowClass = {
    visible: "overflow-visible",
    hidden: "overflow-hidden",
    auto: "overflow-auto",
  }

  return (
    <div
      className={cn(
        "rounded-xl",
        blurIntensity[intensity],
        bgOpacity[intensity],
        border && "border border-white/20",
        glow && "shadow-[0_0_20px_rgba(74,222,128,0.2)]",
        textContrast === "high" && "text-white",
        "glass-highlight shadow-depth",
        overflowClass[overflow],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
