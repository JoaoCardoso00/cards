"use client"

import { motion } from "motion/react"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "How does the AI generate flashcards?",
    answer: "Our AI analyzes your content and automatically generates relevant question-answer pairs. It understands context and creates diverse question types to improve retention."
  },
  {
    question: "Can I edit the AI-generated cards?",
    answer: "Yes! You have full control to edit, delete, or reorganize any cards. We also allow you to add custom notes and tags for better organization."
  },
  {
    question: "What formats can I upload?",
    answer: "You can paste text directly, upload PDFs, Word documents, or simply type your content. We support multiple formats to make it easy for you."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! Our Free plan lets you create up to 5 flashcard sets with basic AI generation. Upgrade anytime to unlock unlimited sets and advanced features."
  }
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="w-full max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
        className="mb-12 text-center"
      >
        <h2 className="text-4xl font-serif mb-4">Frequently Asked Questions</h2>
        <p className="text-neutral-400 text-lg">Got questions? We have answers</p>
      </motion.div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.05 }}
            viewport={{ once: true, margin: "-100px" }}
            className="border rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-900/50 transition-colors text-left"
            >
              <span className="font-semibold text-lg">{faq.question}</span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              </motion.div>
            </button>

            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: openIndex === index ? "auto" : 0,
                opacity: openIndex === index ? 1 : 0
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900/50">
                <p className="text-neutral-300">{faq.answer}</p>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
