'use client'

import { motion } from 'framer-motion'
import { Shield, Leaf, Award, CheckCircle2 } from 'lucide-react'

interface ProjectData {
  name: string
  location: string
  area: number
  buildingType: string
  selectedDesign?: string
}

interface GreenCertificateProps {
  project: ProjectData
  isNatureFirst: boolean
}

export function GreenCertificate({ project, isNatureFirst }: GreenCertificateProps) {
  const certificationDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  
  const certificateId = `VS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  return (
    <div className="flex justify-center">
      <motion.div
        className={`
          relative max-w-2xl w-full rounded-3xl overflow-hidden
          ${isNatureFirst ? 'glow-gold' : 'glow-emerald'}
        `}
      >
        {/* Paper texture background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f5f0e8] to-[#e8e0d5]" />
        
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230d2b1a' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Holographic seal effect for Nature-First */}
        {isNatureFirst && (
          <motion.div
            className="absolute top-8 right-8 w-24 h-24"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#c8952a] via-[#e8c068] to-[#c8952a] opacity-80" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-[#f5f0e8] to-[#e8e0d5] flex items-center justify-center">
                <Award className="w-10 h-10 text-[#c8952a]" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-[#c8952a]/50" />
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
                  animation: 'shimmer 3s linear infinite',
                }}
              />
            </div>
          </motion.div>
        )}
        
        {/* Content */}
        <div className="relative p-10 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-[#2d7a4f]" />
              <span className="font-serif text-lg font-bold text-[#2d7a4f] tracking-wider uppercase">
                Terron
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#0d2b1a] mb-2">
              {isNatureFirst ? 'Green Approval Certificate' : 'Environmental Compliance Certificate'}
            </h2>
            <p className="text-[#5a6b5e] text-sm">
              Official Environmental Intelligence Certification
            </p>
          </div>
          
          {/* Decorative line */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#2d7a4f]/30 to-transparent" />
            <Leaf className="w-5 h-5 text-[#2d7a4f]" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#2d7a4f]/30 to-transparent" />
          </div>
          
          {/* Certificate Body */}
          <div className="text-center mb-8">
            <p className="text-[#5a6b5e] mb-4">This is to certify that</p>
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#0d2b1a] mb-4">
              {project.name}
            </h3>
            <p className="text-[#5a6b5e] mb-6">
              located at <span className="text-[#0d2b1a] font-medium">{project.location}</span>
            </p>
            <p className="text-[#5a6b5e] leading-relaxed max-w-md mx-auto">
              has successfully completed comprehensive environmental analysis and meets
              {isNatureFirst ? ' the highest standards of ' : ' '}
              <span className="text-[#2d7a4f] font-semibold">
                {isNatureFirst ? 'Nature-First sustainable construction' : 'environmental compliance'}
              </span>
              {' '}requirements.
            </p>
          </div>
          
          {/* Project Details */}
          <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
            <div className="text-center p-4 rounded-xl bg-[#0d2b1a]/5">
              <p className="text-xs text-[#5a6b5e] uppercase tracking-wider mb-1">Building Type</p>
              <p className="text-[#0d2b1a] font-medium">{project.buildingType}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-[#0d2b1a]/5">
              <p className="text-xs text-[#5a6b5e] uppercase tracking-wider mb-1">Project Area</p>
              <p className="text-[#0d2b1a] font-medium">{project.area} m²</p>
            </div>
          </div>
          
          {/* Certification Mark */}
          {isNatureFirst && (
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#2d7a4f]/10 border border-[#2d7a4f]/20">
                <CheckCircle2 className="w-5 h-5 text-[#2d7a4f]" />
                <span className="text-[#2d7a4f] font-bold uppercase tracking-wider text-sm">
                  Bio-Score: A
                </span>
              </div>
            </div>
          )}
          
          {/* Decorative line */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#2d7a4f]/30 to-transparent" />
            <div className="w-2 h-2 rounded-full bg-[#2d7a4f]/30" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#2d7a4f]/30 to-transparent" />
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-[#5a6b5e]">
            <div>
              <p className="font-mono">{certificateId}</p>
            </div>
            <div className="text-right">
              <p>Issued: {certificationDate}</p>
            </div>
          </div>
        </div>
        
        {/* Border decoration */}
        <div className="absolute inset-4 border border-[#2d7a4f]/20 rounded-2xl pointer-events-none" />
        <div className="absolute inset-6 border border-[#2d7a4f]/10 rounded-xl pointer-events-none" />
      </motion.div>
    </div>
  )
}
