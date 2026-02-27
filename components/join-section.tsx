"use client"

import { useState } from "react"
import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, Send, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase-client"

const INTEREST_OPTIONS = [
  "Startup Development",
  "AI Product Building",
  "Event Management",
  "Marketing & Branding",
  "Research & Innovation",
  "Public Relations",
  "Design & Media",
]

export function JoinSection() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [registerError, setRegisterError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [interests, setInterests] = useState<string[]>([])
  const [department, setDepartment] = useState("")
  const [certificateName, setCertificateName] = useState("")
  const nameRef = React.useRef<HTMLInputElement>(null)
  const registerRef = React.useRef<HTMLInputElement>(null)
  const emailRef = React.useRef<HTMLInputElement>(null)
  const reasonRef = React.useRef<HTMLTextAreaElement>(null)

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    )
  }

  const validateRegisterNumber = (value: string) => {
    if (value && !/^\d{12}$/.test(value)) {
      setRegisterError("Register Number must contain exactly 12 digits.")
    } else {
      setRegisterError("")
    }
  }

  const validateEmail = (value: string) => {
    if (value && !/^[a-zA-Z0-9._%+-]+@stjosephs\.ac\.in$/.test(value)) {
      setEmailError("Please enter a valid college email ID ending with @stjosephs.ac.in")
    } else {
      setEmailError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (registerError || emailError) {
      setError("Please fix the errors in the form.")
      return
    }

    const fullName = nameRef.current?.value || ""
    const year = document.querySelector('input[name="year"]:checked') as HTMLInputElement
    const registerNumber = registerRef.current?.value || ""
    const email = emailRef.current?.value || ""
    const reason = reasonRef.current?.value || ""
    const startupExperience = document.querySelector('input[name="startup-experience"]:checked') as HTMLInputElement

    if (!fullName || !year || !registerNumber || !email || !department) {
      setError("Please fill in all required fields.")
      return
    }

    setLoading(true)

    try {
      const payload = {
        full_name: fullName,
        register_number: registerNumber,
        email,
        department,
        year: year.value,
        reason,
        interests,
        startup_experience: startupExperience?.value || "",
      }

      // 1. Try direct Supabase insert (most reliable)
      const { error: sbError } = await supabase.from("ed_cell_submissions").insert([payload])
      
      if (sbError) {
        console.error("Supabase insert failed:", sbError)
        // If direct insert fails, try the API route as backup
        const res = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName,
            registerNumber,
            email,
            department,
            year: year.value,
            reason,
            interests,
            startupExperience: startupExperience?.value || "",
          }),
        })

        if (!res.ok) {
          throw new Error("Both Supabase direct insert and API fallback failed")
        }
      }

      // Success! Clear local storage backup if it exists to avoid confusion
      localStorage.removeItem("ed_cell_submissions")

      setCertificateName(fullName)
      setSubmitted(true)
    } catch (err) {
      console.error("Submission failed:", err)
      setError("Failed to submit form. Please check your internet connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCertificate = async () => {
    const rawName = certificateName || nameRef.current?.value || ""
    const name = rawName.trim()
    if (!name) {
      alert("Name is missing in the form.")
      return
    }

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        img.src = src
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error(`Failed to load: ${src}`))
      })

    try {
      let img: HTMLImageElement
      try {
        img = await loadImage("/images/certificate.png")
      } catch {
        img = await loadImage("/certificate.png")
      }

      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        alert("Unable to create canvas context.")
        return
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const maxWidth = canvas.width * 0.5
      let fontSize = Math.round(canvas.width * 0.035)
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"

      const family =
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

      ctx.font = `600 ${fontSize}px ${family}`
      const displayName = name.toUpperCase()
      let metrics = ctx.measureText(displayName)
      while (metrics.width > maxWidth && fontSize > 14) {
        fontSize -= 2
        ctx.font = `600 ${fontSize}px ${family}`
        metrics = ctx.measureText(displayName)
      }

      const x = canvas.width / 2
      const y = canvas.height * 0.47
      ctx.fillText(displayName, x, y)

      const link = document.createElement("a")
      link.href = canvas.toDataURL("image/png")
      link.download = `ED-Cell-Certificate-${displayName.replace(/\s+/g, "-")}.png`
      link.click()
    } catch (err) {
      console.error("[ED Cell] Certificate generation error:", err)
      alert(
        "Unable to generate certificate. Please ensure certificate.png is placed in the public/images or public folder and try again.",
      )
    }
  }

  return (
    <section id="join" className="relative py-24 bg-secondary/30">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Join Us
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Be Part of the Movement
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground leading-relaxed">
            Ready to build something extraordinary? Join the ED Cell and start
            your entrepreneurial journey today.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-border bg-card p-8 shadow-sm">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <CheckCircle2 className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Application Submitted!
              </h3>
              <p className="mt-2 text-muted-foreground">
                Thank you for your interest. You can now download your certificate.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handleDownloadCertificate}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Download Certificate
                </Button>
                <Button
                  variant="outline"
                  className="border-border text-foreground"
                  onClick={() => setSubmitted(false)}
                >
                  Submit Another
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {error && (
                <Alert className="border-destructive/30 bg-destructive/5">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-foreground">Basic Details</h3>
                <p className="text-sm text-muted-foreground">All fields marked are required.</p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-foreground">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  ref={nameRef}
                  id="name"
                  placeholder="Enter your full name"
                  required
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="department" className="text-foreground">
                  Department <span className="text-destructive">*</span>
                </Label>
                <Select required onValueChange={setDepartment} value={department}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Artificial Intelligence & Data Science (AI&DS)">Artificial Intelligence & Data Science (AI&DS)</SelectItem>
                    <SelectItem value="Computer Science and Engineering (CSE)">Computer Science and Engineering (CSE)</SelectItem>
                    <SelectItem value="Electronics and Communication Engineering (ECE)">Electronics and Communication Engineering (ECE)</SelectItem>
                    <SelectItem value="Electrical and Electronics Engineering (EEE)">Electrical and Electronics Engineering (EEE)</SelectItem>
                    <SelectItem value="Information Technology (IT)">Information Technology (IT)</SelectItem>
                    <SelectItem value="Bio Technology (BIO_TECH)">Bio Technology</SelectItem>
                    <SelectItem value="Mechanical Engineering (MECH)">Mechanical Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-medium text-foreground">
                  Year of Study <span className="text-destructive">*</span>
                </legend>
                <RadioGroup required name="year" className="flex flex-col gap-2">
                  {["I Year", "II Year", "III Year", "IV Year"].map((year) => (
                    <div key={year} className="flex items-center gap-3">
                      <RadioGroupItem value={year} id={`year-${year}`} />
                      <Label htmlFor={`year-${year}`} className="text-foreground font-normal cursor-pointer">
                        {year}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </fieldset>

              <div className="flex flex-col gap-2">
                <Label htmlFor="register" className="text-foreground">
                  Register Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  ref={registerRef}
                  id="register"
                  placeholder="e.g. 412223104001"
                  required
                  inputMode="numeric"
                  maxLength={12}
                  onChange={(e) => validateRegisterNumber(e.target.value)}
                  className={`bg-background border-border text-foreground placeholder:text-muted-foreground ${
                    registerError ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                />
                {registerError && (
                  <p className="text-sm text-destructive">{registerError}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-foreground">
                  College Mail ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  ref={emailRef}
                  id="email"
                  type="email"
                  placeholder="yourname@stjosephs.ac.in"
                  required
                  onChange={(e) => validateEmail(e.target.value)}
                  className={`bg-background border-border text-foreground placeholder:text-muted-foreground ${
                    emailError ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                />
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
              </div>

              <div className="border-t border-border" />

              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-foreground">Tell Us More</h3>
                <p className="text-sm text-muted-foreground">Help us understand your interests better.</p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="reason" className="text-foreground">
                  Why do you want to join ED Cell?
                </Label>
                <Textarea
                  ref={reasonRef}
                  id="reason"
                  placeholder="Tell us about your entrepreneurial interests, ideas, or what excites you about ED Cell..."
                  rows={4}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
                />
              </div>

              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-medium text-foreground">
                  Areas of Interest
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {INTEREST_OPTIONS.map((interest) => (
                    <div key={interest} className="flex items-center gap-3">
                      <Checkbox
                        id={`interest-${interest}`}
                        checked={interests.includes(interest)}
                        onCheckedChange={() => toggleInterest(interest)}
                      />
                      <Label
                        htmlFor={`interest-${interest}`}
                        className="text-foreground font-normal cursor-pointer"
                      >
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
              </fieldset>

              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-medium text-foreground">
                  Have you worked on any startup idea before?
                </legend>
                <RadioGroup name="startup-experience" className="flex gap-6">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="yes" id="startup-yes" />
                    <Label htmlFor="startup-yes" className="text-foreground font-normal cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="no" id="startup-no" />
                    <Label htmlFor="startup-no" className="text-foreground font-normal cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </fieldset>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2 mt-2"
              >
                {loading ? "Submitting..." : "Submit Application"}
                {!loading && <Send className="h-4 w-4" />}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
