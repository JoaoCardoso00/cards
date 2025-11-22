import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { Pricing } from "@/components/pricing"
import { FAQ } from "@/components/faq"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <div className="flex flex-col min-h-svh">
      <div className="flex-1 flex flex-col gap-8 items-center p-4">
        <Navbar />
        <Hero />
        <div className="py-4" />
        <HowItWorks />
        <div className="py-14" />
        <Pricing />
        <div className="py-14" />
        <FAQ />
        <div className="py-8" />
      </div>
      <CTA />
      <div className="py-4" />
      <Footer />
    </div>
  )
}
