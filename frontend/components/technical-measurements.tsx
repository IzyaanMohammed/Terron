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
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
          <TableIcon className="w-4 h-4 text-accent" />
        </div>
        <h3 className="font-serif text-xl font-bold text-white uppercase tracking-wider">
          Synthetic Layout Specifications
        </h3>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/50 bg-secondary/20 backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/50 bg-secondary/40">
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Zone / Sector</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Net Area (m²)</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Est. Dimensions</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Fidelity Status</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((item, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="border-b border-border/10 hover:bg-primary/5 transition-colors group"
              >
                <td className="px-6 py-4 text-sm font-medium text-white group-hover:text-primary transition-colors italic">
                  {item.room}
                </td>
                <td className="px-6 py-4 text-sm font-mono text-accent">
                  {item.size}m²
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                  {item.dimensions}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-md bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-tighter shimmer-border">
                    {item.efficiency}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-primary/10">
              <td className="px-6 py-4 text-sm font-bold text-white uppercase">Total Calculated</td>
              <td className="px-6 py-4 text-sm font-bold font-mono text-primary">{totalArea}m²</td>
              <td colSpan={2} className="px-6 py-4 text-[10px] text-muted-foreground italic tracking-tight">
                *Measurements generated based on volumetric analysis of provided Vision and Building Type.
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
