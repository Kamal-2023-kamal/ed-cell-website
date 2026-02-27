"use client"

import Image from "next/image"

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Programs", href: "#programs" },
  { label: "Events", href: "/events" },
  { label: "Team", href: "#team" },
  { label: "Gallery", href: "#gallery" },
  { label: "Join Us", href: "/join" },
  { label: "Contact", href: "#contact" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="ED Cell Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="text-sm font-bold text-foreground">ED Cell</p>
                <p className="text-xs text-muted-foreground">
                  St. Joseph{"'"}s College of Engineering
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Entrepreneurship and Development Cell, Department of Artificial
              Intelligence & Data Science. Empowering the next generation of
              innovators.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Quick Links
            </h3>
            <ul className="mt-4 flex flex-col gap-2">
              {quickLinks.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Explore</h3>
            <ul className="mt-4 flex flex-col gap-2">
              {quickLinks.slice(4).map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Department */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Department
            </h3>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Department of Artificial Intelligence & Data Science
            </p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              St. Joseph{"'"}s College of Engineering
              <br />
              Old Mahabalipuram Road
              <br />
              Chennai, Tamil Nadu - 600119
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Entrepreneurship and Development
            Cell, Dept. of AI & Data Science, St. Joseph{"'"}s College of
            Engineering. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
