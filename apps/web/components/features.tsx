"use client"

import { motion } from "motion/react"
import { Sparkles, Zap, Brain, BarChart3 } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI Generated",
    description: "Our AI creates relevant questions and answers from your content in seconds."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Create and organize flashcards faster than writing them manually."
  },
  {
    icon: Brain,
    title: "Smart Learning",
    description: "Adaptive algorithms focus on your weak areas to maximize retention."
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    description: "Monitor your learning journey with detailed statistics and insights."
  }
]

export function Features() {
  return (
    <div className="w-full max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
        className="mb-12"
      >
        <h2 className="text-4xl font-serif mb-4">Features</h2>
        <p className="text-neutral-400 text-lg">Everything you need to study effectively</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="border rounded-xl p-6 hover:border-primary/50 transition-colors"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="mb-4 inline-block"
              >
                <Icon className="w-8 h-8 text-primary" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-neutral-400 text-sm">{feature.description}</p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
