import { Navbar } from "@/components/navbar"
import { JoinSection } from "@/components/join-section"
import { SiteFooter } from "@/components/site-footer"

export const metadata = {
  title: "Join ED Cell - Entrepreneurship and Development Cell",
  description: "Apply to join the Entrepreneurship and Development Cell, Dept of ADS.",
}

export default function JoinPage() {
  return (
    <div className="relative min-h-screen scroll-smooth">
      <Navbar />
      <main>
        <JoinSection />
      </main>
      <SiteFooter />
    </div>
  )
}
