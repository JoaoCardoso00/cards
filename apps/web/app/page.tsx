import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"

export default function Page() {
  return (
    <div className="flex min-h-svh p-4 flex-col gap-8 items-center">
      <Navbar />
      <Hero />
      <div className="py-4" />
      <Features />
      <div className="py-4" />
      <HowItWorks />
    </div>
  )
}
