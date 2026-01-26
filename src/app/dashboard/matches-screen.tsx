"use client"

import { useState } from "react"

// FIXED: Export Default
export default function MatchesScreen() {
  const [filter, setFilter] = useState("live")

  return (
    <div className="p-4 space-y-4 text-foreground pb-20">
      <h2 className="text-2xl font-bold">Matches</h2>

      {/* Custom Tabs */}
      <div className="w-full bg-card p-1 rounded-2xl grid grid-cols-3 gap-1">
        {["live", "upcoming", "completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-xl py-2 text-sm font-bold capitalize transition-all ${filter === tab ? "bg-green-500 text-black shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4 pt-2">
        {filter === "live" && (
          <>
            <SimpleMatchCard teamA="IND" teamB="AUS" time="LIVE" odds1="1.45" odds2="2.80" league="World Cup T20" isLive={true} />
            <SimpleMatchCard teamA="ENG" teamB="PAK" time="LIVE" odds1="1.90" odds2="1.90" league="ODI Series" isLive={true} />
          </>
        )}
        {filter === "upcoming" && (
          <>
            <SimpleMatchCard teamA="SA" teamB="NZ" time="Tomorrow, 14:00" odds1="2.10" odds2="1.75" league="Test Match" />
            <SimpleMatchCard teamA="BAN" teamB="SL" time="24 Oct, 18:30" odds1="2.50" odds2="1.55" league="T20 Series" />
          </>
        )}
      </div>
    </div>
  )
}

function SimpleMatchCard({ teamA, teamB, time, odds1, odds2, league, isLive }: any) {
  return (
    <div className="bg-card border border-border p-4 rounded-3xl space-y-4">
      <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        <span>{league}</span>
        <span className={isLive ? "text-red-500 animate-pulse" : ""}>{time}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center font-bold text-xs text-foreground border border-border">{teamA}</div>
          <span className="font-black text-lg text-muted-foreground">VS</span>
          <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center font-bold text-xs text-foreground border border-border">{teamB}</div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 font-bold text-sm hover:bg-green-500 hover:text-black transition-all">
            {odds1}
          </button>
          <button className="px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-bold text-sm hover:bg-yellow-500 hover:text-black transition-all">
            {odds2}
          </button>
        </div>
      </div>
    </div>
  )
}