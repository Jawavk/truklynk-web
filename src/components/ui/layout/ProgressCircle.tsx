"use client"

import type * as React from "react"
import { Cake, Gift, UserPlus } from "lucide-react";

interface ProgressCircleProps {
  value: number
  maxValue: number
  size?: number
  strokeWidth?: number
  className?: string
  children?: React.ReactNode,
  selectedFilter?:string | null
}

export function ProgressCircle({
  value,
  maxValue,
  size = 120,
  strokeWidth = 8,
  className = "",
  children,
  selectedFilter
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percentage = Math.round((value / maxValue) * 100)
  const offset = circumference - (percentage / 100) * circumference

  const getBackgroundColor = () => {
    if (selectedFilter) {
      return "#ffffff" // White background when selected
    }
    return "#f3f4f6" // Default gray-100 when not selected
  }

  const getProgressColor = () => {
    switch (selectedFilter) {
      case "Birthday":
        return "#ec4899" // pink-500
      case "Wedding":
        return "#22c55e" // green-500
      case "Welcoming":
        return "#eab308" // yellow-500
      default:
        return "#374151" // gray-700
    }
  }

  // const getCircleColor = (isBackground = false) => {
 
  //   // Foreground colors (darker shades)
  //   switch (selectedFilter) {
  //     case "Birthday":
  //       return "#831843" // pink-900
  //     case "Wedding":
  //       return "#14532d" // green-900
  //     case "Welcoming":
  //       return "#713f12" // yellow-900
  //     default:
  //       return "#374151" // gray-700
  //   }
  // }


  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={getBackgroundColor()}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={getProgressColor()}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{value}</span>
        {children}
      </div>
    </div>
  )
}

