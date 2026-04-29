'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Zap, MapPin, TrendingUp, ArrowRight, Shield, Droplets, Wind, Sun, Leaf } from 'lucide-react'
import { ThermalVisualizer } from './thermal-visualizer'

interface EcoDossierItem {
  trick: string
  location: string
  why?: string
  how?: string
  method?: string  // legacy fallback
  benefit?: string
  urgency?: 'Critical' | 'High' | 'Medium'
}

interface DesignProblem {
  problem: string
  dataEvidence: string
  fix: string
  impact: string
}

interface SustainabilityDossierProps {
  dossier: EcoDossierItem[]
  designProblems?: DesignProblem[]
  temp?: number
  thermalRisk?: string
  calculatedMetrics?: any
}

const urgencyConfig = {
  Critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400' },
  High:     { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', dot: 'bg-orange-400' },
  Medium:   { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-400' },
}

const getTrickIcon = (trick: string) => {
  const t = trick.toLowerCase()
  if (t.includes('wind') || t.includes('ventil')) return Wind
  if (t.includes('water') || t.includes('drain') || t.includes('grey') || t.includes('rain')) return Droplets
  if (t.includes('solar') || t.includes('sun') || t.includes('shad') || t.includes('louvre')) return Sun
  if (t.includes('green') || t.includes('plant') || t.includes('bio') || t.includes('garden')) return Leaf
  if (t.includes('thermal') || t.includes('cool') || t.includes('heat')) return Zap
  return Shield
}

export function SustainabilityDossier({ dossier, designProblems = [], temp = 32, thermalRisk, calculatedMetrics }: SustainabilityDossierProps) {
  const thermalRiskColor = thermalRisk === 'Critical' ? 'text-red-400' 
    : thermalRisk === 'High' ? 'text-orange-400' 
    : thermalRisk === 'Moderate' ? 'text-yellow-400' 
    : 'text-primary'

  return (
    <div className="space-y-16">

      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/30 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Zap className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="font-serif text-3xl font-bold text-white">Environmental Intelligence Dossier</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.3em] font-mono">Data-Driven · Site-Specific · Actionable</p>
          </div>
        </div>
        {thermalRisk && (
          <div className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest ${thermalRiskColor} ${thermalRisk === 'Critical' ? 'border-red-500/30 bg-red-500/10' : 'border-white/10 bg-white/5'}`}>
            Thermal Risk: {thermalRisk}
          </div>
        )}
      </div>

      {/* Design Problem Diagnosis */}
      {designProblems.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h4 className="font-serif text-xl font-bold text-white">Original Design Diagnosis</h4>
            <div className="flex-1 h-px bg-orange-500/20" />
            <span className="text-[10px] text-orange-400/60 font-mono uppercase tracking-widest">{designProblems.length} issues identified</span>
          </div>

          <div className="space-y-4">
            {designProblems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="rounded-2xl border border-orange-500/15 bg-orange-500/5 overflow-hidden"
              >
                {/* Problem Header */}
                <div className="px-6 py-4 flex items-start gap-4 border-b border-orange-500/10">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-orange-400">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{item.problem}</p>
                    <p className="text-xs text-orange-300/70 mt-1 font-mono">{item.dataEvidence}</p>
                  </div>
                </div>
                {/* Fix */}
                <div className="px-6 py-4 flex items-start gap-4">
                  <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-white/80 leading-relaxed">{item.fix}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                      <TrendingUp className="w-3 h-3 text-primary" />
                      <span className="text-[10px] text-primary font-bold">{item.impact}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Eco Dossier Interventions */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <h4 className="font-serif text-xl font-bold text-white">Tactical Eco Interventions</h4>
          <div className="flex-1 h-px bg-primary/20" />
          <span className="text-[10px] text-primary/60 font-mono uppercase tracking-widest">{dossier.length} actions</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {dossier.map((item, idx) => {
            const urgency = item.urgency || 'Medium'
            const uc = urgencyConfig[urgency] || urgencyConfig.Medium
            const Icon = getTrickIcon(item.trick)

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                className={`rounded-3xl border ${uc.border} ${uc.bg} p-10 relative overflow-hidden group hover:bg-white/[0.04] transition-all shadow-xl`}
              >
                {/* Urgency Tag */}
                <div className={`absolute top-6 right-6 flex items-center gap-2 px-4 py-1.5 rounded-full border ${uc.border} text-xs font-bold uppercase tracking-widest ${uc.color}`}>
                  <div className={`w-2 h-2 rounded-full ${uc.dot} animate-pulse`} />
                  {urgency}
                </div>

                {/* Header */}
                <div className="flex items-start gap-6 mb-10 pr-24">
                  <div className={`w-14 h-14 rounded-2xl ${uc.bg} border ${uc.border} flex items-center justify-center shrink-0 shadow-glow`}>
                    <Icon className={`w-7 h-7 ${uc.color}`} />
                  </div>
                  <div>
                    <h5 className="font-serif text-2xl font-bold text-white leading-tight">{item.trick}</h5>
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="w-4 h-4 text-white/40" />
                      <span className="text-xs text-white/40 font-mono tracking-widest uppercase">{item.location}</span>
                    </div>
                  </div>
                </div>

                {/* Content Sections - More Spaced Out */}
                <div className="space-y-8">
                  {/* Why (data-based) */}
                  {(item.why || item.method) && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-emerald-400/60 uppercase tracking-[0.3em]">Rationale & Impact</p>
                      <p className="text-lg text-white/80 leading-relaxed font-light">{item.why || item.method}</p>
                    </div>
                  )}

                  {/* How */}
                  {item.how && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-sky-400/60 uppercase tracking-[0.3em]">Implementation Strategy</p>
                      <p className="text-lg text-white/80 leading-relaxed font-light">{item.how}</p>
                    </div>
                  )}

                  {/* Benefit */}
                  {item.benefit && (
                    <div className={`mt-8 p-6 rounded-2xl ${uc.bg} border ${uc.border} flex items-center gap-4`}>
                      <div className={`p-2 rounded-lg ${uc.bg}`}>
                        <TrendingUp className={`w-6 h-6 ${uc.color}`} />
                      </div>
                      <p className={`text-lg font-bold ${uc.color}`}>{item.benefit}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )
            )
          })}
        </div>
      </div>

      {/* Thermal Visualizer */}
      <ThermalVisualizer temp={temp} efficiency={calculatedMetrics?.thermalEfficiency || 88} />
    </div>
  )
}
