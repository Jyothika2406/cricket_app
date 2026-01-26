"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronRight, Zap, Wallet, Users } from "lucide-react"

// FIX: Changed to 'export function Onboarding' (Named Export)
export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const SLIDES = [
    {
      id: 1,
      title: "Fastest Cricket Lines",
      description: "Get the quickest updates and best odds for every match globally.",
      icon: <Zap className="w-16 h-16 text-green-500" />, // Changed text-primary to green-500 for visibility
      color: "bg-green-500/10",
    },
    {
      id: 2,
      title: "Instant Withdrawals",
      description: "Your winnings are yours. Withdraw to your bank account in seconds.",
      icon: <Wallet className="w-16 h-16 text-yellow-500" />,
      color: "bg-yellow-500/10",
    },
    {
      id: 3,
      title: "1M+ Trusted Users",
      description: "Join India's most secure and popular cricket betting community.",
      icon: <Users className="w-16 h-16 text-blue-500" />,
      color: "bg-blue-500/10",
    },
  ]

  const next = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1)
    } else {
      // This triggers the switch to Auth Screen
      onComplete()
    }
  }

  return (
    <div className="h-full w-full flex flex-col p-6 bg-background text-foreground">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="mb-12"
          >
            <div
              className={`w-32 h-32 rounded-3xl ${SLIDES[currentSlide].color} flex items-center justify-center mb-8 mx-auto relative overflow-hidden ring-1 ring-white/10`}
            >
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
              {SLIDES[currentSlide].icon}
            </div>
            <h2 className="text-3xl font-black italic uppercase mb-4">{SLIDES[currentSlide].title}</h2>
            <p className="text-muted-foreground leading-relaxed px-4 text-lg">
              {SLIDES[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2 mb-8">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? "w-8 bg-green-500" : "w-2 bg-muted"
                }`}
            />
          ))}
        </div>
      </div>

      <Button
        onClick={next}
        size="lg"
        className="w-full h-14 text-lg font-black italic uppercase rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center"
      >
        {currentSlide === SLIDES.length - 1 ? "Get Started" : "Next"}
        <ChevronRight className="ml-2 w-5 h-5" />
      </Button>
    </div>
  )
}