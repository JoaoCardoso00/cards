"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

export function Hero() {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div className="border rounded-2xl w-full max-w-7xl px-4.5 py-4.5 grid grid-cols-1 md:grid-cols-3 gap-8">

      <div className="col-span-1 md:col-span-2 p-4 flex flex-col justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-5xl font-serif mb-4"
          >
            Minimalistic, AI Powered <br /> Flash Cards for you to study
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-lg text-neutral-300 font-light max-w-md"
          >
            Paste your notes or upload a document. Our AI generates flashcards automatically. Study with spaced repetition to remember what actually matters.
          </motion.p>

        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="flex gap-4 mt-8"
        >
          <Button asChild size="lg">
            <Link href="/get-started">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/learn-more">Learn More</Link>
          </Button>
        </motion.div>
      </div>

      <div className="flex items-center justify-center">
        <motion.button
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative w-full h-80 cursor-pointer"
        >
          <motion.div
            className="relative w-full h-full"
            initial={false}
            animate={{
              rotateY: isFlipped ? 180 : 0,
            }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="absolute w-full h-full rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex flex-col items-center justify-center p-6 text-center"
              style={{
                backfaceVisibility: "hidden",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="text-sm font-semibold text-purple-200 mb-4"
              >
                QUESTION
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-2xl font-bold text-white"
              >
                What is the capital of France?
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-xs text-purple-200 mt-8"
              >
                Click to reveal answer
              </motion.div>
            </div>

            <div
              className="absolute w-full h-full rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex flex-col items-center justify-center p-6 text-center"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="text-sm font-semibold text-emerald-200 mb-4"
              >
                ANSWER
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-2xl font-bold text-white"
              >
                Paris
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-xs text-emerald-200 mt-8"
              >
                Click to flip back
              </motion.div>
            </div>
          </motion.div>
        </motion.button>
      </div>

    </div>
  )
}
