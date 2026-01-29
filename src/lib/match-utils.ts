import Match from "@/models/Match"
import dbConnect from "@/lib/mongodb"

export type MatchStatus = "upcoming" | "live" | "completed"

/**
 * Calculate the real-time status of a match based on its start time
 * - If startTime is in the future → "upcoming"
 * - If startTime has passed and status is not "completed" → "live"
 * - If explicitly marked as "completed" → "completed"
 */
export function calculateMatchStatus(startTime: Date, currentStatus: MatchStatus): MatchStatus {
  const now = new Date()
  const matchStart = new Date(startTime)
  
  // If match is already marked as completed, keep it that way
  if (currentStatus === "completed") {
    return "completed"
  }
  
  // If match start time has passed, it should be "live"
  if (matchStart <= now) {
    return "live"
  }
  
  // Otherwise, it's still upcoming
  return "upcoming"
}

/**
 * Check if betting is allowed for a match
 * Betting is only allowed when:
 * - Match status is "upcoming" AND
 * - Match start time is still in the future
 */
export function isBettingAllowed(startTime: Date, status: MatchStatus): boolean {
  const now = new Date()
  const matchStart = new Date(startTime)
  
  // Betting is only allowed for upcoming matches that haven't started
  return status === "upcoming" && matchStart > now
}

/**
 * Check if a match can be edited by admin
 * Matches can only be edited when they are "upcoming"
 */
export function isMatchEditable(startTime: Date, status: MatchStatus): boolean {
  const now = new Date()
  const matchStart = new Date(startTime)
  
  // Match is editable only if it's upcoming and hasn't started
  return status === "upcoming" && matchStart > now
}

/**
 * Get time remaining until match starts
 * Returns null if match has already started
 */
export function getTimeRemaining(startTime: Date): {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
} | null {
  const now = new Date()
  const matchStart = new Date(startTime)
  const total = matchStart.getTime() - now.getTime()
  
  if (total <= 0) {
    return null
  }
  
  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((total % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((total % (1000 * 60)) / 1000)
  }
}

/**
 * Update match statuses in database based on current time
 * This should be called periodically or before fetching matches
 */
export async function updateMatchStatuses(): Promise<void> {
  await dbConnect()
  
  const now = new Date()
  
  // Update all "upcoming" matches whose start time has passed to "live"
  await Match.updateMany(
    {
      status: "upcoming",
      startTime: { $lte: now }
    },
    {
      $set: { status: "live" }
    }
  )
}

/**
 * Format countdown string
 */
export function formatCountdown(startTime: Date): string {
  const remaining = getTimeRemaining(startTime)
  
  if (!remaining) {
    return "Started"
  }
  
  if (remaining.days > 0) {
    return `${remaining.days}d ${remaining.hours}h`
  }
  
  if (remaining.hours > 0) {
    return `${remaining.hours}h ${remaining.minutes}m`
  }
  
  if (remaining.minutes > 0) {
    return `${remaining.minutes}m ${remaining.seconds}s`
  }
  
  return `${remaining.seconds}s`
}
