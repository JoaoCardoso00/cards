"use client"

import { motion } from "motion/react"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Get started with the basics",
    features: [
      "10 cards generated/month",
      "Unlimited flashcard sets",
      "Study mode",
      "Progress analytics for all plans"
    ],
    highlighted: false
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    description: "For serious learners",
    features: [
      "1,000 cards generated/month",
      "Advanced AI generation",
      "Smart learning algorithm",
      "Priority support",
      "Progress analytics",
      "Export your data"
    ],
    highlighted: true
  },
  {
    name: "Team",
    price: "$29.99",
    period: "/month",
    description: "For educators and teams",
    features: [
      "5,000 cards generated/month",
      "Team collaboration",
      "Class management",
      "Custom workspace",
      "Dedicated support",
      "Progress analytics"
    ],
    highlighted: false
  }
]

export function Pricing() {
  return (
    <div className="w-full max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
        className="mb-12 text-center"
      >
        <h2 className="text-4xl font-serif mb-4">Simple, Transparent Pricing</h2>
        <p className="text-neutral-400 text-lg">Choose the plan that works for you</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
            className={`rounded-2xl border p-8 flex flex-col ${plan.highlighted
                ? "border-primary bg-primary/5 md:scale-105"
                : "border-neutral-800"
              }`}
          >
            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-neutral-400 text-sm mb-4">{plan.description}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-neutral-400">{plan.period}</span>}
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mb-8"
            >
              <Button
                asChild
                variant={plan.highlighted ? "default" : "outline"}
                className="w-full"
              >
                <Link href={`/get-started?plan=${plan.name.toLowerCase()}`}>
                  Get Started
                </Link>
              </Button>
            </motion.div>

            <div className="space-y-4 flex-1">
              {plan.features.map((feature) => (
                <div key={feature} className="flex gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-300">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
