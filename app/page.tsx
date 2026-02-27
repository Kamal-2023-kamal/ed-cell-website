"use client"

import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { DepartmentSection } from "@/components/department-section"
import { ProgramsSection } from "@/components/programs-section"
import { EventsSection } from "@/components/events-section"
import { TeamSection } from "@/components/team-section"
import { GallerySection } from "@/components/gallery-section"
import { ContactSection } from "@/components/contact-section"
import { SiteFooter } from "@/components/site-footer"

export default function Home() {
  return (
    <div className="relative min-h-screen scroll-smooth">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <DepartmentSection />
        <ProgramsSection />
        <EventsSection />
        <TeamSection />
        <GallerySection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  )
}
