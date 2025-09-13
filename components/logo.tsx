"use client"

import { useRouter } from "next/navigation"
import { Shield } from "lucide-react"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const router = useRouter()

  const handleLogoClick = () => {
    router.push("/")
  }

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  }

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  }

  return (
    <button
      onClick={handleLogoClick}
      className={`${sizeClasses[size]} bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background cursor-pointer group ${className}`}
      aria-label="Go to home page"
      type="button"
      title="Click to go to home page"
    >
      <Shield className={`${iconSizes[size]} text-primary-foreground group-hover:text-primary-foreground/90 transition-colors duration-200`} />
    </button>
  )
}