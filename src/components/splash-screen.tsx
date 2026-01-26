"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function SplashScreen() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-background">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative"
      >
        <div className="w-32 h-32 bg-orange-500/20 rounded-full absolute -inset-6 blur-3xl animate-pulse" />
        <div className="relative z-10 flex items-center gap-0">
          <span className="text-4xl font-black italic text-orange-500 tracking-tight">CRICBET</span>
          <span className="bg-[#1a2234] text-white text-2xl font-black px-3 py-1 rounded-lg ml-1">
            SK<span className="text-orange-500">I</span>LL
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-8 text-center px-6"
      >
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">Fast • Secure • Real-Time</p>
      </motion.div>
    </div>
  )
}
