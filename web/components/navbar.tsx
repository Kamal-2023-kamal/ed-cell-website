"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Programs", href: "#programs" },
  { label: "Events", href: "#events" },
  { label: "Team", href: "#team" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
  { label: "Admin", href: "/admin", isAdmin: true },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoSrc, setLogoSrc] = useState("/images/logo-transparent.png")
  const pathname = usePathname()

  const toHref = (link: { href: string; isAdmin?: boolean }) => {
    if (link.isAdmin) return link.href
    // Always point to home page section anchors
    return `/${link.href}`
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <a href="/#home" className="flex items-center gap-3">
          <Image
            src={logoSrc}
            alt="ED Cell Logo"
            width={90}
            height={90}
            className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
            onError={() => setLogoSrc("/images/logo.png")}
          />
          <div className="hidden sm:block">
            <p className="text-sm font-bold leading-tight text-foreground">
              Entrepreneurship and Development Cell
            </p>
            <p className="text-xs text-muted-foreground leading-tight">
              Dept of ADS
            </p>
          </div>
        </a>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={toHref(link)}
              className={cn(
                "px-3 py-2 text-sm transition-colors rounded-md",
                link.isAdmin
                  ? "text-accent font-semibold hover:bg-accent/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a href="/join" className="hidden md:block">
            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Join ED Cell
            </Button>
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border">
          <div className="flex flex-col px-6 py-4 gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={toHref(link)}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-3 py-2.5 text-sm transition-colors rounded-md",
                  link.isAdmin
                    ? "text-accent font-semibold hover:bg-accent/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/join"
              onClick={() => setMobileOpen(false)}
              className="mt-2"
            >
              <Button
                size="sm"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Join ED Cell
              </Button>
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
