import { Monitor, Gamepad2, Smartphone, Laptop, Cloud, HelpCircle, Apple, Tablet } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PlatformIconProps {
  platformName: string
  className?: string
  showTooltip?: boolean
  size?: number
}

export function PlatformIcon({ platformName, className = "", showTooltip = true, size = 16 }: PlatformIconProps) {
  const name = platformName.toLowerCase()

  // Icon und Farbe basierend auf dem Plattformnamen bestimmen
  let icon = <HelpCircle size={size} />
  let color = "text-white/70"

  if (name.includes("pc") || name.includes("windows")) {
    icon = <Monitor size={size} />
    color = "text-blue-400"
  } else if (name.includes("playstation") || name.includes("ps4") || name.includes("ps5")) {
    icon = <Gamepad2 size={size} />
    color = "text-blue-500"
  } else if (name.includes("xbox")) {
    icon = <Gamepad2 size={size} />
    color = "text-green-500"
  } else if (name.includes("nintendo") || name.includes("switch")) {
    icon = <Gamepad2 size={size} />
    color = "text-red-500"
  } else if (name.includes("ios") || name.includes("apple")) {
    icon = <Apple size={size} />
    color = "text-gray-300"
  } else if (name.includes("android")) {
    icon = <Smartphone size={size} />
    color = "text-green-400"
  } else if (name.includes("linux")) {
    icon = <Laptop size={size} />
    color = "text-orange-400"
  } else if (name.includes("mac")) {
    icon = <Laptop size={size} />
    color = "text-gray-300"
  } else if (name.includes("web") || name.includes("browser")) {
    icon = <Cloud size={size} />
    color = "text-purple-400"
  } else if (name.includes("mobile")) {
    icon = <Smartphone size={size} />
    color = "text-blue-300"
  } else if (name.includes("tablet")) {
    icon = <Tablet size={size} />
    color = "text-indigo-300"
  }

  const iconElement = <span className={`${color} ${className}`}>{icon}</span>

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{iconElement}</TooltipTrigger>
          <TooltipContent className="bg-slate-900/95 backdrop-blur-md border-white/20">
            <p>{platformName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return iconElement
}
