'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { useProject, DEMO_PROJECT_QUSAIS, DEMO_PROJECT_CULTURAL } from '@/context/project-context'
import { MapPin, Building2, Ruler, Zap, Loader2, Image, X, ArrowRight } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import map to avoid SSR issues
const ProjectMap = dynamic(() => import('@/components/project-map').then(mod => mod.ProjectMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-secondary/20 rounded-2xl flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  ),
})

const buildingTypes = [
  'Residential Villa',
  'Commercial Office',
  'Mixed-Use Development',
  'Industrial Facility',
  'Educational Campus',
  'Healthcare Center',
]

export default function NewProjectPage() {
  const router = useRouter()
  const { setProject } = useProject()
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    area: '',
    buildingType: 'Residential Villa',
    budget: '$500k - $1M',
    energyGoal: 'Net Zero Energy',
    primaryMaterial: 'Sustainable Timber',
    description: '',
    images: [] as string[],
  })
  
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTypingDemo, setIsTypingDemo] = useState(false)
  
  const nameInputRef = useRef<HTMLInputElement>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const areaInputRef = useRef<HTMLInputElement>(null)

  // Auto-type effect for demo
  const typeText = async (
    ref: React.RefObject<HTMLInputElement | null>,
    text: string,
    field: keyof typeof formData
  ) => {
    if (!ref.current) return
    
    for (let i = 0; i <= text.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 40))
      setFormData(prev => ({ ...prev, [field]: text.slice(0, i) }))
    }
  }

  // Generic demo loader
  const loadDemoProject = async (demo: typeof DEMO_PROJECT_QUSAIS) => {
    if (isTypingDemo) return
    setIsTypingDemo(true)
    
    // Reset form
    setFormData({ 
      name: '', 
      location: '', 
      area: '', 
      buildingType: 'Residential Villa',
      budget: '$500k - $1M',
      energyGoal: 'Net Zero Energy',
      primaryMaterial: 'Sustainable Timber',
      description: '',
      images: [],
    })
    setCoordinates(null)
    
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Type project name
    await typeText(nameInputRef, demo.name, 'name')
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Type location
    await typeText(locationInputRef, demo.location, 'location')
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Set coordinates and zoom map
    setCoordinates({ lat: demo.lat, lng: demo.lng })
    await new Promise(resolve => setTimeout(resolve, 400))
    
    // Type area
    await typeText(areaInputRef, demo.area.toString(), 'area')
    await new Promise(resolve => setTimeout(resolve, 300))

    // Set description, budget, energy goal, material, and images instantly
    setFormData(prev => ({
      ...prev,
      buildingType: demo.buildingType,
      budget: demo.budget,
      energyGoal: demo.energyGoal,
      primaryMaterial: demo.primaryMaterial,
      description: demo.description || '',
      images: demo.images || [],
    }))
    
    setIsTypingDemo(false)
  }

  const loadDemoQusais = () => loadDemoProject(DEMO_PROJECT_QUSAIS)
  const loadDemoCultural = () => loadDemoProject(DEMO_PROJECT_CULTURAL)

  // Geocode location on blur
  const handleLocationBlur = useCallback(async () => {
    if (!formData.location || formData.location.length < 3) return
    
    setIsGeocoding(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        setCoordinates({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        })
      }
    } catch (error) {
      // Fallback to Dubai coordinates if geocoding fails
      setCoordinates({ lat: 25.2048, lng: 55.2708 })
    } finally {
      setIsGeocoding(false)
    }
  }, [formData.location])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.location || !formData.area) return
    
    setIsSubmitting(true)
    
    // Use existing coordinates or fallback
    const projectCoords = coordinates || { lat: 25.2048, lng: 55.2708 }
    
    // Create project data
    const projectData = {
      id: `project-${Date.now()}`,
      name: formData.name,
      location: formData.location,
      lat: projectCoords.lat,
      lng: projectCoords.lng,
      area: parseInt(formData.area),
      buildingType: formData.buildingType,
      budget: formData.budget,
      energyGoal: formData.energyGoal,
      primaryMaterial: formData.primaryMaterial,
      description: formData.description,
      images: formData.images,
      analysisComplete: false,
    }
    
    setProject(projectData)
    
    // Navigate to loading screen
    await new Promise(resolve => setTimeout(resolve, 300))
    router.push('/analyzing')
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
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-white">
              New Environmental Analysis
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Enter your project details to receive comprehensive environmental intelligence.
            </p>
          </motion.div>
          
          {/* Two-Pane Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Pane */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-3xl p-8"
            >
              <div className="space-y-8 mb-10">
                {/* Enticing Quick Start Badge */}
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary animate-pulse"
                  >
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Instant Showcase: Try a Demo Now</span>
                  </motion.div>
                  <p className="text-muted-foreground text-sm text-center">
                    Skip the data entry and see Terron's intelligence in action with our flagship projects.
                  </p>
                </div>

                {/* Demo Buttons moved to top */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={loadDemoQusais}
                    disabled={isTypingDemo}
                    className="relative group overflow-hidden py-10 rounded-2xl border-2 border-accent/20 bg-accent/5 transition-all hover:bg-accent/10 hover:border-accent/40 active:scale-95 disabled:opacity-50"
                  >
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className="p-3 rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/20">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <span className="font-serif text-xl font-bold text-accent">Qusais Villa</span>
                      <span className="text-[10px] text-accent/60 uppercase tracking-tighter">Native Dubai Estate</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  <button
                    type="button"
                    onClick={loadDemoCultural}
                    disabled={isTypingDemo}
                    className="relative group overflow-hidden py-10 rounded-2xl border-2 border-primary/20 bg-primary/5 transition-all hover:bg-primary/10 hover:border-primary/40 active:scale-95 disabled:opacity-50"
                  >
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className="p-3 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                        <Zap className="w-6 h-6" />
                      </div>
                      <span className="font-serif text-xl font-bold text-primary">BBAY Concept</span>
                      <span className="text-[10px] text-primary/60 uppercase tracking-tighter">Sustainable Landmark</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/50" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Or Manually Configure</span>
                  <div className="h-px flex-1 bg-border/50" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Project Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Project Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Al Barsha Villa"
                      className="w-full pl-12 pr-4 py-4 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
                
                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      ref={locationInputRef}
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      onBlur={handleLocationBlur}
                      placeholder="e.g., Al Barsha, Dubai, UAE"
                      className="w-full pl-12 pr-12 py-4 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                    <AnimatePresence>
                      {isGeocoding && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {coordinates && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-mono text-primary"
                    >
                      {coordinates.lat.toFixed(4)}°N, {coordinates.lng.toFixed(4)}°E
                    </motion.p>
                  )}
                </div>
                
                {/* Area */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Project Area (m²)
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      ref={areaInputRef}
                      type="number"
                      value={formData.area}
                      onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                      placeholder="e.g., 450"
                      min="1"
                      className="w-full pl-12 pr-4 py-4 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
                
                {/* Building Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Building Type
                  </label>
                  <select
                    value={formData.buildingType}
                    onChange={(e) => setFormData(prev => ({ ...prev, buildingType: e.target.value }))}
                    className="w-full px-4 py-4 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer"
                  >
                    {buildingTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Budget */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Budget Range
                    </label>
                    <select
                      value={formData.budget}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                      className="w-full px-4 py-4 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      {['<$500k', '$500k - $1M', '$1M - $5M', '$5M+'].map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Energy Goal */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Energy Efficiency
                    </label>
                    <select
                      value={formData.energyGoal}
                      onChange={(e) => setFormData(prev => ({ ...prev, energyGoal: e.target.value }))}
                      className="w-full px-4 py-4 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      {['Standard', 'LEED Silver', 'LEED Gold', 'Net Zero Energy', 'Passivhaus'].map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Primary Material */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Preferred Construction Material
                  </label>
                  <select
                    value={formData.primaryMaterial}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryMaterial: e.target.value }))}
                    className="w-full px-4 py-4 bg-input border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer"
                  >
                    {['Sustainable Timber', 'Low-Carbon Concrete', 'Recycled Steel', 'Rammed Earth'].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Architectural Vision */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Architectural Vision & Requirements
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., 3-story modern villa with 4 bedrooms, open-plan living, private balcony, and floor-to-ceiling glass for nature immersion..."
                    rows={4}
                    className="w-full px-4 py-4 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Architectural References (Image Upload) */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider block">
                    Architectural References (Max 3)
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-border group">
                        <img src={img} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {formData.images.length < 3 && (
                      <label className="aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary">
                        <Image className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Upload Reference</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  images: [...prev.images, reader.result as string].slice(0, 3) 
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                

                    
                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.name || !formData.location || !formData.area}
                      className="w-full py-5 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-primary/20 glow-emerald active:scale-[0.98]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Calibrating Neural Engine...
                        </>
                      ) : (
                        <>
                          Run Full Environmental Audit
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
              </form>
            </motion.div>
            
            {/* Map Pane */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-3xl p-2 min-h-[500px] lg:min-h-0"
            >
              <ProjectMap coordinates={coordinates} />
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}
