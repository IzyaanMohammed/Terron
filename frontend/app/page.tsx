'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Zap, Shield, BarChart3 } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { HeroScene } from '@/components/hero-scene'
import { AnimatedLetters } from '@/components/animated-text'
import { StatsCounter } from '@/components/stats-counter'

const features = [
  {
    icon: Zap,
    title: 'Real-Time Analysis',
    description: 'Instant environmental impact assessment using live climate and biodiversity data.',
  },
  {
    icon: Shield,
    title: 'Regulatory Compliance',
    description: 'Automated checks against local and international environmental standards.',
  },
  {
    icon: BarChart3,
    title: 'Predictive Modeling',
    description: 'AI-driven forecasts for long-term sustainability and carbon footprint reduction.',
  },
]

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
        {/* 3D Background */}
        <HeroScene />
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center pt-24">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
              Environmental Intelligence Platform
            </span>
          </motion.div>
          
          {/* Main Headline */}
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-white">
            <AnimatedLetters text="Before You Build," delay={0.3} />
            <br />
            <span className="text-gradient-gold">
              <AnimatedLetters text="Nature Decides." delay={0.6} />
            </span>
          </h1>
          
          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Harness AI-powered environmental analysis to transform construction. 
            Predict impact, optimize designs, and build in harmony with nature.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              href="/new-project"
              className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all glow-emerald"
            >
              Start Environmental Analysis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/marketplace"
              className="flex items-center gap-2 px-8 py-4 rounded-xl glass text-foreground font-medium hover:bg-secondary/50 transition-all"
            >
              Explore Marketplace
            </Link>
          </motion.div>
          
          {/* Stats Counter */}
          <StatsCounter />
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-primary" />
          </motion.div>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-white">
              Intelligence at Every Stage
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From site selection to post-construction monitoring, Terron provides 
              comprehensive environmental insights.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-card rounded-2xl p-8 hover:border-primary/40 transition-colors group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Process Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-white">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three steps to sustainable construction excellence.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Input Location', desc: 'Enter your project coordinates and building specifications.' },
              { step: '02', title: 'AI Analysis', desc: 'Our engine processes climate, biodiversity, and regulatory data.' },
              { step: '03', title: 'Get Recommendations', desc: 'Receive optimized designs ranked by environmental impact.' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                <div className="text-8xl font-serif font-bold text-primary/10 absolute -top-8 left-0">
                  {item.step}
                </div>
                <div className="relative pt-12 pl-4">
                  <h3 className="font-serif text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative py-32 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto glass-card rounded-3xl p-12 md:p-16 text-center shimmer-border glow-gold"
        >
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 text-white">
            Ready to Build <span className="text-gradient-gold">Responsibly?</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Join 14,000+ projects that have transformed their environmental footprint with Terron.
          </p>
          <Link
            href="/new-project"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-accent text-accent-foreground font-bold text-lg hover:bg-accent/90 transition-all"
          >
            Start Your Free Analysis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold">Terron</span>
            <span className="text-muted-foreground text-sm">© 2026</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
