import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"

export default function Page() {
  return (
    <div className="flex min-h-svh p-4 flex-col gap-4 items-center">
      <Navbar />
      <Hero />
    </div>
  )
}
