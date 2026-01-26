"use client"

import React from 'react'

// Using a named export to match your layout.tsx import
export function WhatsAppSupport() {
  return (
    <a
      href="https://wa.me/yournumber"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 z-50 bg-green-500 p-3 rounded-full shadow-lg"
    >
      <span className="text-white font-bold">WA</span>
    </a>
  )
}