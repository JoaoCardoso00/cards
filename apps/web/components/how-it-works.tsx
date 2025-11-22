"use client"

import { motion } from "motion/react"
import { Play } from "lucide-react"

export function HowItWorks() {
  return (
    <div className="w-full max-w-7xl border rounded-2xl p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
        className="mb-12"
      >
        <h2 className="text-4xl font-serif mb-4">How it Works</h2>
        <p className="text-neutral-400 text-lg">See how simple it is to get started</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
        className="relative w-full aspect-video rounded-xl overflow-hidden bg-neutral-950 flex items-center justify-center group cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-100 transition-opacity duration-300" />
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="relative z-10 flex items-center justify-center w-20 h-20 rounded-full bg-primary"
        >
          <Play className="w-8 h-8 text-black fill-black" />
        </motion.div>
        <span className="absolute bottom-4 left-4 text-sm text-neutral-400">
          Video placeholder - Add your demo video here
        </span>
      </motion.div>
    </div>
  )
}
