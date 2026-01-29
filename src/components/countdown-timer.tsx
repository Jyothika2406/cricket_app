"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock, Zap, CheckCircle } from "lucide-react"

interface CountdownTimerProps {
  startTime: string | Date
  status: "upcoming" | "live" | "completed"
  onStatusChange?: (newStatus: "live") => void
  showBadge?: boolean
}

export function CountdownTimer({ 
  startTime, 
  status, 
  onStatusChange, 
  showBadge = true 
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    total: number
  } | null>(null)
  const [currentStatus, setCurrentStatus] = useState(status)

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      const matchStart = new Date(startTime)
      const total = matchStart.getTime() - now.getTime()

      if (total <= 0) {
        setTimeRemaining(null)
        if (currentStatus === "upcoming") {
          setCurrentStatus("live")
          onStatusChange?.("live")
        }
        return
      }

      setTimeRemaining({
        total,
        days: Math.floor(total / (1000 * 60 * 60 * 24)),
        hours: Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((total % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((total % (1000 * 60)) / 1000)
      })
    }

    // Calculate immediately
    calculateTimeRemaining()

    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [startTime, currentStatus, onStatusChange])

  // Update current status when prop changes
  useEffect(() => {
    setCurrentStatus(status)
  }, [status])

  const formatTime = () => {
    if (!timeRemaining) return null

    if (timeRemaining.days > 0) {
      return `${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m`
    }

    if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s`
    }

    if (timeRemaining.minutes > 0) {
      return `${timeRemaining.minutes}m ${timeRemaining.seconds}s`
    }

    return `${timeRemaining.seconds}s`
  }

  const getStatusBadge = () => {
    switch (currentStatus) {
      case "live":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
            <Zap className="w-3 h-3 mr-1" />
            LIVE
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            COMPLETED
          </Badge>
        )
      case "upcoming":
      default:
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            {formatTime() || "Starting soon..."}
          </Badge>
        )
    }
  }

  if (showBadge) {
    return getStatusBadge()
  }

  // Return just the countdown text
  if (currentStatus === "upcoming" && timeRemaining) {
    return <span className="text-yellow-400 font-mono text-sm">{formatTime()}</span>
  }

  if (currentStatus === "live") {
    return <span className="text-red-400 font-bold animate-pulse">LIVE NOW</span>
  }

  return <span className="text-gray-400">Completed</span>
}

export function MatchStatusBadge({ status }: { status: "upcoming" | "live" | "completed" }) {
  switch (status) {
    case "live":
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
          <Zap className="w-3 h-3 mr-1" />
          LIVE
        </Badge>
      )
    case "completed":
      return (
        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          COMPLETED
        </Badge>
      )
    case "upcoming":
    default:
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <Clock className="w-3 h-3 mr-1" />
          UPCOMING
        </Badge>
      )
  }
}
