'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { MarketplaceCard } from '@/components/marketplace-card'
import { InquiryModal } from '@/components/inquiry-modal'
import { Search, Filter, Leaf, TrendingUp } from 'lucide-react'

const allResources = [
  {
    id: '1',
    name: 'Recycled Steel Beams',
    description: 'Structural steel from demolished buildings, tested for load-bearing capacity',
    co2Saved: 2.4,
    distance: 12,
    price: 850,
    unit: 'per tonne',
    available: 45,
    image: 'steel',
    category: 'structural',
  },
  {
    id: '2',
    name: 'Reclaimed Timber',
    description: 'Premium hardwood from renovation projects, kiln-dried and graded',
    co2Saved: 1.8,
    distance: 8,
    price: 320,
    unit: 'per m³',
    available: 120,
    image: 'timber',
    category: 'structural',
  },
  {
    id: '3',
    name: 'Crushed Concrete Aggregate',
    description: 'High-grade aggregate for foundations and road base',
    co2Saved: 0.9,
    distance: 5,
    price: 45,
    unit: 'per tonne',
    available: 500,
    image: 'concrete',
    category: 'aggregate',
  },
  {
    id: '4',
    name: 'Salvaged Brick',
    description: 'Heritage brick from historical sites, carefully cleaned and sorted',
    co2Saved: 0.6,
    distance: 15,
    price: 180,
    unit: 'per 1000 units',
    available: 25000,
    image: 'brick',
    category: 'masonry',
  },
  {
    id: '5',
    name: 'Recycled Glass Panels',
    description: 'Tempered glass from commercial renovations, various sizes',
    co2Saved: 1.2,
    distance: 22,
    price: 95,
    unit: 'per m²',
    available: 340,
    image: 'glass',
    category: 'finishing',
  },
  {
    id: '6',
    name: 'Upcycled Insulation',
    description: 'Cotton-based insulation from textile waste, excellent R-value',
    co2Saved: 2.1,
    distance: 18,
    price: 28,
    unit: 'per m²',
    available: 890,
    image: 'insulation',
    category: 'insulation',
  },
  {
    id: '7',
    name: 'Reclaimed Flooring',
    description: 'Oak parquet from luxury renovations, restored to original beauty',
    co2Saved: 1.5,
    distance: 9,
    price: 75,
    unit: 'per m²',
    available: 200,
    image: 'flooring',
    category: 'finishing',
  },
  {
    id: '8',
    name: 'Salvaged Fixtures',
    description: 'Premium bathroom and kitchen fixtures, fully refurbished',
    co2Saved: 0.8,
    distance: 14,
    price: 450,
    unit: 'per set',
    available: 35,
    image: 'fixtures',
    category: 'finishing',
  },
  {
    id: '9',
    name: 'Recycled Aluminum',
    description: 'High-quality aluminum from industrial sources, ready for fabrication',
    co2Saved: 3.2,
    distance: 25,
    price: 1200,
    unit: 'per tonne',
    available: 28,
    image: 'steel',
    category: 'structural',
  },
  {
    id: '10',
    name: 'Reclaimed Slate Tiles',
    description: 'Natural slate roofing tiles from heritage renovations',
    co2Saved: 0.7,
    distance: 32,
    price: 65,
    unit: 'per m²',
    available: 450,
    image: 'concrete',
    category: 'roofing',
  },
  {
    id: '11',
    name: 'Salvaged Doors',
    description: 'Solid wood interior doors from residential demolitions',
    co2Saved: 0.5,
    distance: 11,
    price: 180,
    unit: 'per unit',
    available: 75,
    image: 'timber',
    category: 'finishing',
  },
  {
    id: '12',
    name: 'Recycled Copper Pipes',
    description: 'Cleaned and tested copper plumbing from commercial retrofits',
    co2Saved: 1.9,
    distance: 19,
    price: 680,
    unit: 'per 100m',
    available: 120,
    image: 'fixtures',
    category: 'plumbing',
  },
]

const categories = [
  { id: 'all', label: 'All Materials' },
  { id: 'structural', label: 'Structural' },
  { id: 'finishing', label: 'Finishing' },
  { id: 'aggregate', label: 'Aggregate' },
  { id: 'masonry', label: 'Masonry' },
  { id: 'insulation', label: 'Insulation' },
  { id: 'roofing', label: 'Roofing' },
  { id: 'plumbing', label: 'Plumbing' },
]

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [selectedResource, setSelectedResource] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleInquiry = (resource: any) => {
    setSelectedResource(resource)
    setIsModalOpen(true)
  }

  const filteredResources = allResources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalCO2Saved = allResources.reduce((sum, r) => sum + r.co2Saved * r.available, 0)

  return (
    <main className="relative min-h-screen text-white">
      <Navigation />
      
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-white">
              Waste-to-Resource <span className="text-gradient-gold">Marketplace</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Discover sustainable construction materials from verified suppliers
            </p>
          </motion.div>
          
          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6 mb-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary font-mono">{allResources.length}</p>
                <p className="text-sm text-white/70">Material Types</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent font-mono">{Math.round(totalCO2Saved).toLocaleString()}t</p>
                <p className="text-sm text-white/70">CO₂ Savings Potential</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-chart-3 font-mono">47</p>
                <p className="text-sm text-white/70">Verified Suppliers</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <p className="text-3xl font-bold text-primary font-mono">23%</p>
                </div>
                <p className="text-sm text-white/70">Avg. Cost Savings</p>
              </div>
            </div>
          </motion.div>
          
          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search materials..."
                className="w-full pl-12 pr-4 py-4 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <Filter className="w-5 h-5 text-white/50 flex-shrink-0" />
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                    ${selectedCategory === cat.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'glass hover:bg-secondary/50'
                    }
                  `}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>
          
          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mb-6"
          >
            <Leaf className="w-4 h-4 text-primary" />
            <span className="text-sm text-white/60">
              Showing <span className="text-foreground font-medium">{filteredResources.length}</span> sustainable materials
            </span>
          </motion.div>
          
          {/* Materials Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredResources.map((resource, index) => (
              <MarketplaceCard
                key={resource.id}
                resource={resource}
                delay={0.05 * index}
                isHovered={hoveredCard === resource.id}
                onHover={() => setHoveredCard(resource.id)}
                onLeave={() => setHoveredCard(null)}
                onClick={() => handleInquiry(resource)}
              />
            ))}
          </div>
          
          {/* Empty State */}
          {filteredResources.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-2">No materials found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <InquiryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        resource={selectedResource}
      />
    </main>
  )
}
