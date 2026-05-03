'use client'

import { motion } from 'framer-motion'
import { Leaf, MapPin, Package } from 'lucide-react'

interface Resource {
  id: string
  name: string
  description: string
  co2Saved: number
  distance: number
  price: number
  unit: string
  available: number
  image: string
  category?: string
}

interface MarketplaceCardProps {
  resource: Resource
  delay?: number
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
  onClick?: () => void
}

// Material background patterns
const materialPatterns: Record<string, string> = {
  steel: 'linear-gradient(135deg, #3d4f5f 0%, #2a3a47 100%)',
  timber: 'linear-gradient(135deg, #8b6914 0%, #5c4a0f 100%)',
  concrete: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
  brick: 'linear-gradient(135deg, #a34d2d 0%, #7a3a22 100%)',
  glass: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
  insulation: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)',
  flooring: 'linear-gradient(135deg, #92400e 0%, #78350f 100%)',
  fixtures: 'linear-gradient(135deg, #a3a3a3 0%, #737373 100%)',
}

export function MarketplaceCard({ resource, delay = 0, isHovered, onHover, onLeave, onClick }: MarketplaceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      className="glass-card rounded-2xl overflow-hidden cursor-pointer group hover:border-primary/40 transition-all"
    >
      {/* Image Area */}
      <div className="relative h-40 flex items-center justify-center overflow-hidden bg-secondary/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50" />
        <img 
          src={`https://image.pollinations.ai/prompt/${encodeURIComponent(`industrial photo of ${resource.name} sustainable construction material`)}?width=400&height=300&seed=${resource.id}&nologo=true`}
          alt={resource.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* CO2 Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/90 backdrop-blur-sm">
          <Leaf className="w-3 h-3 text-primary" />
          <span className="text-xs font-bold text-primary">{resource.co2Saved}t CO₂</span>
        </div>
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50" />
        
        {/* Icon */}
        <Package className="w-12 h-12 text-white/30" />
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h4 className="font-medium text-white mb-1 group-hover:text-primary transition-colors">
          {resource.name}
        </h4>
        <p className="text-xs text-white/60 mb-3 line-clamp-2">
          {resource.description}
        </p>
        
        {/* Price and availability */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <span className="text-lg font-bold text-accent">${resource.price}</span>
            <span className="text-xs text-muted-foreground ml-1">{resource.unit}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {resource.available.toLocaleString()} available
          </span>
        </div>
        
        {/* Distance indicator - shows on hover */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: isHovered ? 'auto' : 0, 
            opacity: isHovered ? 1 : 0 
          }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="pt-3 border-t border-border flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm">
              <span className="text-foreground font-medium">{resource.distance} km</span>
              <span className="text-muted-foreground"> from your site</span>
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
