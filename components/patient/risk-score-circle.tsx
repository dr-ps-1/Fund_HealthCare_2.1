"use client"

import { cn } from "@/lib/utils"

interface RiskScoreCircleProps {
  score: number
  size?: "sm" | "md" | "lg"
}

export function RiskScoreCircle({ score, size = "lg" }: RiskScoreCircleProps) {
  const circumference = 2 * Math.PI * 45
  const progress = (score / 100) * circumference

  const getColor = () => {
    if (score >= 70) return "#DC2626"
    if (score >= 40) return "#F59E0B"
    return "#16A34A"
  }

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  }

  const fontClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  }

  return (
    <div className={cn("relative", sizeClasses[size])}>
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-secondary"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold", fontClasses[size])} style={{ color: getColor() }}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">Risk Score</span>
      </div>
    </div>
  )
}
