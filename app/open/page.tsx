
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Rocket, Sparkles, Zap, ArrowRight } from "lucide-react"

export default function GrandOpeningPage() {
  const [stage, setStage] = useState<"initial" | "countdown" | "reveal" | "celebrate">("initial")
  const [count, setCount] = useState(5)
  const [particles, setParticles] = useState<
    Array<{ x: number; y: number; scale: number; opacity: number; driftY: number; duration: number }>
  >([])
  const router = useRouter()

  useEffect(() => {
    if (stage === "countdown" && count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000)
      return () => clearTimeout(timer)
    } else if (stage === "countdown" && count === 0) {
      setStage("reveal")
    }
  }, [stage, count])

  useEffect(() => {
    if (stage === "reveal") {
      const timer = setTimeout(() => {
        setStage("celebrate")
        triggerConfetti()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [stage])

  useEffect(() => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1000
    const h = typeof window !== "undefined" ? window.innerHeight : 1000
    const next = Array.from({ length: 20 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      scale: Math.random() * 0.5 + 0.5,
      opacity: Math.random() * 0.3 + 0.1,
      driftY: Math.random() * -100,
      duration: Math.random() * 5 + 5,
    }))
    setParticles(next)
  }, [])

  const triggerConfetti = () => {
    const duration = 5 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)
  }

  const handleStart = () => {
    setStage("countdown")
  }

  const handleExplore = () => {
    router.push("/")
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white selection:bg-purple-500/30">
      {/* Background Grid Animation */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <motion.div 
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            repeatType: "reverse" 
          }}
          className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_800px_at_50%_50%,#7c3aed,transparent)]" 
        />
      </div>

      <AnimatePresence mode="wait">
        {stage === "initial" && (
          <motion.div
            key="initial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 text-center"
            >
              <h1 className="mb-2 text-4xl font-bold tracking-tighter sm:text-6xl md:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                Something Big
              </h1>
              <h2 className="text-2xl font-light tracking-widest text-purple-400 sm:text-4xl">
                IS COMING
              </h2>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white/10 px-8 py-4 text-lg font-semibold backdrop-blur-md transition-all hover:bg-white/20 hover:shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] border border-white/10"
            >
              <span className="relative z-10">Launch Experience</span>
              <Rocket className="relative z-10 h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-600/50 to-blue-600/50 opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.button>
          </motion.div>
        )}

        {stage === "countdown" && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, filter: "blur(20px)" }}
            className="relative z-10 flex min-h-screen items-center justify-center"
          >
            <motion.span
              key={count}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[12rem] font-bold leading-none tracking-tighter text-white sm:text-[20rem]"
            >
              {count}
            </motion.span>
          </motion.div>
        )}

        {stage === "reveal" && (
          <motion.div
            key="reveal"
            className="relative z-10 flex min-h-screen items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute inset-0 animate-pulse rounded-full bg-purple-500/50 blur-3xl" />
              <Image
                src="/images/logo-transparent.png"
                alt="ED Cell Logo"
                width={256}
                height={256}
                priority
                className="h-32 w-32 sm:h-64 sm:w-64 object-contain"
              />
            </motion.div>
          </motion.div>
        )}

        {stage === "celebrate" && (
          <motion.div
            key="celebrate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 text-center"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-8"
            >
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ 
                  repeat: Infinity, 
                  repeatType: "reverse", 
                  duration: 2 
                }}
                className="mb-6 inline-flex items-center justify-center rounded-full bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-400 ring-1 ring-inset ring-purple-500/20"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Officially Live
              </motion.div>
              
              <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-7xl md:text-9xl">
                <span className="block bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  Entrepreneurship and Development
                </span>
                <span className="block text-white">Cell</span>
              </h1>
              
              <p className="mx-auto max-w-2xl text-lg text-gray-400 sm:text-xl">
                Empowering the next generation of innovators and entrepreneurs.
                The future starts here.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExplore}
                className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-white px-8 py-4 text-lg font-bold text-black transition-all hover:bg-gray-200"
              >
                Enter Website
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Particles */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            initial={{
              x: p.x,
              y: p.y,
              scale: p.scale,
              opacity: p.opacity,
            }}
            animate={{
              y: [null, p.driftY],
              opacity: [null, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute h-2 w-2 rounded-full bg-white"
          />
        ))}
      </div>
    </div>
  )
}
