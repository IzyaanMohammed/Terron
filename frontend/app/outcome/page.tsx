'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { useProject, DEMO_PROJECT } from '@/context/project-context'
import { GreenCertificate } from '@/components/green-certificate'
import { MarketplaceCard } from '@/components/marketplace-card'
import { Award, ArrowRight, Recycle, ShoppingBag } from 'lucide-react'
import confetti from 'canvas-confetti'

const wasteResources = [
  {
    id: '1',
    name: 'Recycled Steel Beams',
    description: 'Structural steel from demolished buildings',
    co2Saved: 2.4,
    distance: 12,
    price: 850,
    unit: 'per tonne',
    available: 45,
    image: 'steel',
  },
  {
    id: '2',
    name: 'Reclaimed Timber',
    description: 'Premium hardwood from renovation projects',
    co2Saved: 1.8,
    distance: 8,
    price: 320,
    unit: 'per m³',
    available: 120,
    image: 'timber',
  },
  {
    id: '3',
    name: 'Crushed Concrete Aggregate',
    description: 'High-grade aggregate for foundations',
    co2Saved: 0.9,
    distance: 5,
    price: 45,
    unit: 'per tonne',
    available: 500,
    image: 'concrete',
  },
  {
    id: '4',
    name: 'Salvaged Brick',
    description: 'Heritage brick from historical sites',
    co2Saved: 0.6,
    distance: 15,
    price: 180,
    unit: 'per 1000 units',
    available: 25000,
    image: 'brick',
  },
  {
    id: '5',
    name: 'Recycled Glass Panels',
    description: 'Tempered glass from commercial renovations',
    co2Saved: 1.2,
    distance: 22,
    price: 95,
    unit: 'per m²',
    available: 340,
    image: 'glass',
  },
  {
    id: '6',
    name: 'Upcycled Insulation',
    description: 'Cotton-based insulation from textile waste',
    co2Saved: 2.1,
    distance: 18,
    price: 28,
    unit: 'per m²',
    available: 890,
    image: 'insulation',
  },
  {
    id: '7',
    name: 'Reclaimed Flooring',
    description: 'Oak parquet from luxury renovations',
    co2Saved: 1.5,
    distance: 9,
    price: 75,
    unit: 'per m²',
    available: 200,
    image: 'flooring',
  },
  {
    id: '8',
    name: 'Salvaged Fixtures',
    description: 'Premium bathroom & kitchen fixtures',
    co2Saved: 0.8,
    distance: 14,
    price: 450,
    unit: 'per set',
    available: 35,
    image: 'fixtures',
  },
]

export default function OutcomePage() {
  const { project } = useProject()
  const [showCertificate, setShowCertificate] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  
  const projectData = project || DEMO_PROJECT
  const isNatureFirst = projectData.selectedDesign === 'nature-first'

  const fireConfetti = useCallback(() => {
    const duration = 3000
    const end = Date.now() + duration

    const colors = ['#2d7a4f', '#c8952a', '#e8f0ea']

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: colors,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }, [])

  useEffect(() => {
    // Show confetti for Nature-First selection
    if (isNatureFirst) {
      setTimeout(() => {
        fireConfetti()
        setShowCertificate(true)
      }, 500)
    } else {
      setShowCertificate(true)
    }
  }, [isNatureFirst, fireConfetti])

  // Calculate distance from project site (mock calculation)
  const calculateDistance = (baseDistance: number) => {
    // Add some variation based on project location
    const variation = Math.random() * 5 - 2.5
    return Math.max(1, baseDistance + variation).toFixed(1)
  }

  return (
    <main className="relative min-h-screen">
      <Navigation />
      
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-card mb-6"
            >
              <Award className="w-5 h-5 text-accent" />
              <span className="font-medium">
                {isNatureFirst ? 'Nature-First Design Selected' : 'Design Confirmed'}
              </span>
            </motion.div>
            
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-white">
              {isNatureFirst ? (
                <>Your Green Approval Certificate</>
              ) : (
                'Project Approved'
              )}
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              {projectData.name} has been certified for environmental compliance.
            </p>
          </motion.div>
          
          {/* Certificate */}
          <AnimatePresence>
            {showCertificate && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', duration: 0.8 }}
                className="mb-16"
              >
                <GreenCertificate 
                  project={projectData}
                  isNatureFirst={isNatureFirst}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Marketplace Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Recycle className="w-6 h-6 text-primary" />
                  <h2 className="font-serif text-2xl md:text-3xl font-bold">
                    Waste-to-Resource Marketplace
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  Sustainable materials available near your project site
                </p>
              </div>
              <Link
                href="/marketplace"
                className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl glass hover:bg-secondary/50 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {/* Marketplace Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wasteResources.map((resource, index) => (
                <MarketplaceCard
                  key={resource.id}
                  resource={{
                    ...resource,
                    distance: parseFloat(calculateDistance(resource.distance)),
                  }}
                  delay={0.1 * index}
                  isHovered={hoveredCard === resource.id}
                  onHover={() => setHoveredCard(resource.id)}
                  onLeave={() => setHoveredCard(null)}
                />
              ))}
            </div>
            
            {/* Mobile View All */}
            <div className="md:hidden mt-6">
              <Link
                href="/marketplace"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl glass hover:bg-secondary/50 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                View All Materials
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.section>
          
          {/* Next Steps */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16"
          >
            <div className="glass-card rounded-2xl p-8 text-center">
              <h3 className="font-serif text-2xl font-bold mb-4">Ready to Begin Construction?</h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Your environmental analysis is complete. Download your full report or 
                connect with certified green contractors in your area.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors glow-emerald">
                  Download Full Report
                </button>
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl glass hover:bg-secondary/50 transition-colors">
                  Find Contractors
                </button>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  )
}
