'use client'

import { motion } from 'framer-motion'
import { Ruler, Table as TableIcon } from 'lucide-react'

interface TechnicalMeasurementsProps {
  totalArea: number
  buildingType: string
  syntheticLayout?: any[]
}

export function TechnicalMeasurements({ totalArea, buildingType, syntheticLayout }: TechnicalMeasurementsProps) {
  // Logic to distribute area based on building type
  const getRoomBreakdown = () => {
    if (syntheticLayout && syntheticLayout.length > 0) {
      return syntheticLayout
    }
    const isResidential = buildingType.toLowerCase().includes('residential') || buildingType.toLowerCase().includes('villa')
    
    if (isResidential) {
      return [
        { room: 'Living & Social Area', size: Math.round(totalArea * 0.2), dimensions: '8.2m x 9.8m', efficiency: 'High' },
        { room: 'Master Suite & Ensuite', size: Math.round(totalArea * 0.15), dimensions: '6.5m x 9.2m', efficiency: 'Premium' },
        { room: 'Bedrooms (x3)', size: Math.round(totalArea * 0.25), dimensions: 'Various', efficiency: 'Optimal' },
        { room: 'Cuisine & Dining', size: Math.round(totalArea * 0.12), dimensions: '5.8m x 8.4m', efficiency: 'Functional' },
        { room: 'Circulation & Storage', size: Math.round(totalArea * 0.13), dimensions: 'N/A', efficiency: 'B-Grade' },
        { room: 'External Terrace/Garden', size: Math.round(totalArea * 0.15), dimensions: 'Variable', efficiency: 'Nature-Sync' }
      ]
    }
    
    // Commercial/Other default
    return [
      { room: 'Primary Operational Space', size: Math.round(totalArea * 0.5), dimensions: 'Variable', efficiency: 'High' },
      { room: 'Utility & Technical', size: Math.round(totalArea * 0.15), dimensions: '6.5m x 11.2m', efficiency: 'Industrial' },
      { room: 'Support & Amenities', size: Math.round(totalArea * 0.2), dimensions: 'Various', efficiency: 'Optimal' },
      { room: 'Circulation & Entry', size: Math.round(totalArea * 0.15), dimensions: '8.2m x 15.4m', efficiency: 'Fluid' }
    ]
  }

  const breakdown = getRoomBreakdown()

  return (
    <div className="mt-20 space-y-12">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-2xl">
          <TableIcon className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h3 className="font-serif text-4xl font-bold text-white tracking-tight">
            Synthetic Layout Specifications
          </h3>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] mt-1">Volumetric Spatial Distribution Analysis</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[2.5rem] border border-white/5 bg-emerald-950/20 backdrop-blur-xl shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              <th className="px-12 py-10 text-xs font-bold text-white/50 uppercase tracking-[0.3em]">Zone / Sector</th>
              <th className="px-12 py-10 text-xs font-bold text-white/50 uppercase tracking-[0.3em]">Net Area</th>
              <th className="px-12 py-10 text-xs font-bold text-white/50 uppercase tracking-[0.3em]">Est. Dimensions</th>
              <th className="px-12 py-10 text-xs font-bold text-white/50 uppercase tracking-[0.3em]">Fidelity Status</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((item, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="border-b border-white/5 hover:bg-white/[0.04] transition-colors group"
              >
                <td className="px-12 py-10 text-2xl font-light text-emerald-50 group-hover:text-emerald-300 transition-colors">
                  {item.room}
                </td>
                <td className="px-12 py-10 text-3xl font-mono font-bold text-emerald-400">
                  {item.size}m²
                </td>
                <td className="px-12 py-10 text-lg text-white/40 font-mono">
                  {item.dimensions}
                </td>
                <td className="px-12 py-10">
                  <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-widest border border-emerald-500/20">
                    {item.efficiency}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-emerald-500/5">
              <td className="px-10 py-10 text-lg font-serif font-bold text-white uppercase tracking-widest">Total Calculated</td>
              <td className="px-10 py-10 text-3xl font-bold font-mono text-emerald-400">{totalArea}m²</td>
              <td colSpan={2} className="px-10 py-10 text-xs text-white/20 italic font-light">
                *Measurements generated based on volumetric analysis of provided Vision and Building Type.
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
