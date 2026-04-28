'use client'

import { motion } from 'framer-motion'
import { Check, TrendingDown, DollarSign } from 'lucide-react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'

export interface DesignMetrics {
  carbon: number
  water: number
  biodiversity: number
  cost: number
  materials: number
}

interface Design {
  id: string
  title: string
  subtitle: string
  description: string
  bioScore: string
  co2Reduction: number
  costModifier: number
  metrics: DesignMetrics
  featured?: boolean
}

interface DesignCardProps {
  design: Design
  isSelected: boolean
  onSelect: () => void
  delay?: number
}

export function DesignCard({ design, isSelected, onSelect, delay = 0 }: DesignCardProps) {
  const chartData = [
    { subject: 'Carbon', value: design.metrics.carbon, fullMark: 100 },
    { subject: 'Water', value: design.metrics.water, fullMark: 100 },
    { subject: 'Bio', value: design.metrics.biodiversity, fullMark: 100 },
    { subject: 'Cost', value: design.metrics.cost, fullMark: 100 },
    { subject: 'Materials', value: design.metrics.materials, fullMark: 100 },
  ]

  const getBioScoreColor = (score: string) => {
    switch (score) {
      case 'A': return 'text-accent bg-accent/20'
      case 'B': return 'text-primary bg-primary/20'
      default: return 'text-muted-foreground bg-muted'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      onClick={onSelect}
      className={`
        relative rounded-2xl p-6 cursor-pointer transition-all duration-300
        ${design.featured 
          ? 'glass-card shimmer-border glow-gold' 
          : 'glass-card hover:border-primary/30'
        }
        ${isSelected 
          ? 'ring-2 ring-primary border-primary/50' 
          : ''
        }
      `}
    >
      {/* Featured badge */}
      {design.featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider">
          Recommended
        </div>
      )}
      
      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
        >
          <Check className="w-5 h-5 text-primary-foreground" />
        </motion.div>
      )}
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-serif text-2xl font-bold text-white leading-none">{design.title}</h3>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getBioScoreColor(design.bioScore)}`}>
            {design.bioScore}
          </span>
        </div>
        <p className="text-xs text-primary font-bold uppercase tracking-widest">{design.subtitle}</p>
      </div>
      
      {/* Radar Chart */}
      <div className={`${design.featured ? 'h-56' : 'h-44'} mb-6`}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} cx="50%" cy="50%" outerRadius={design.featured ? '80%' : '70%'}>
            <PolarGrid 
              stroke="rgba(45, 122, 79, 0.2)" 
              strokeDasharray="3 3"
            />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#ffffff', fontSize: 9, fontWeight: 'bold' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={false}
              axisLine={false}
            />
            <Radar
              name={design.title}
              dataKey="value"
              stroke={design.featured ? '#c8952a' : '#2d7a4f'}
              fill={design.featured ? '#c8952a' : '#2d7a4f'}
              fillOpacity={design.featured ? 0.4 : 0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Description */}
      <p className="text-sm text-white/70 mb-6 leading-relaxed">
        {design.description}
      </p>
      
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-primary" />
          <span className="text-sm text-white">
            <span className="font-bold text-primary">{design.co2Reduction}%</span> CO₂ reduced
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-accent" />
          <span className="text-sm text-white">
            <span className="font-bold text-accent">+{design.costModifier}%</span> cost
          </span>
        </div>
      </div>
    </motion.div>
  )
}
