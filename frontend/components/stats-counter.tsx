'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface CountUpProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  decimals?: number
}

function useCountUp({ end, duration = 2, decimals = 0 }: CountUpProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  
  useEffect(() => {
    if (!inView) return
    
    let startTime: number
    let animationFrame: number
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = easeOutQuart * end
      
      setCount(currentCount)
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, inView])
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(decimals) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(decimals) + 'k'
    }
    return num.toFixed(decimals)
  }
  
  return { count: formatNumber(count), ref }
}

interface StatPillProps {
  value: number
  label: string
  suffix?: string
  delay?: number
  decimals?: number
}

function StatPill({ value, label, suffix = '', delay = 0, decimals = 0 }: StatPillProps) {
  const { count, ref } = useCountUp({ end: value, duration: 2.5, decimals })
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay, 
        duration: 0.6,
        type: 'spring',
        stiffness: 100
      }}
      className="glass-card rounded-2xl px-6 py-4 flex flex-col items-center gap-1"
    >
      <span ref={ref} className="text-2xl md:text-3xl font-bold text-gradient-gold font-mono">
        {count}{suffix}
      </span>
      <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </motion.div>
  )
}

export function StatsCounter() {
  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
      <StatPill 
        value={2300000} 
        label="CO₂ Prevented" 
        suffix=" tonnes"
        delay={0.8}
        decimals={1}
      />
      <StatPill 
        value={14000} 
        label="Analyses" 
        suffix="+"
        delay={1}
        decimals={0}
      />
      <StatPill 
        value={89} 
        label="Green Adoption" 
        suffix="%"
        delay={1.2}
        decimals={0}
      />
    </div>
  )
}
