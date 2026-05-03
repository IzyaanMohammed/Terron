'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Navigation } from '@/components/navigation'
import { useProject, DEMO_PROJECT } from '@/context/project-context'
import { DesignCard } from '@/components/design-card'
import { generateImage } from '@/lib/api'
import {
  Thermometer,
  Droplets,
  Leaf,
  MapPin,
  ArrowRight,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Ruler,
  Wind,
  Sun,
  Compass,
  CheckCircle2,
  Activity,
  ChevronRight,
  Settings2,
  Zap,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Brain,
  Box,
  AlertTriangle,
  Cpu,
  History,
  TrendingUp
} from 'lucide-react'
import { AIChatbot } from '@/components/ai-chatbot'
import { SustainabilityDossier } from '@/components/sustainability-dossier'
import { TechnicalMeasurements } from '@/components/technical-measurements'

const DownloadReportButton = dynamic(() => import('@/components/DownloadReportButton'), { ssr: false })
const EcoModelViewer = dynamic(() => import('@/components/eco-model-viewer'), { ssr: false })

const designOptions = [
  {
    id: 'standard',
    title: 'Standard',
    subtitle: 'Baseline Design',
    description: 'Traditional construction methods with minimal environmental considerations.',
    bioScore: 'C',
    co2Reduction: 12,
    costModifier: 0,
    metrics: { carbon: 35, water: 40, biodiversity: 25, cost: 90, materials: 45 },
  },
  {
    id: 'improved',
    title: 'Improved',
    subtitle: 'Enhanced Sustainability',
    description: 'Incorporates green building practices and efficient resource management.',
    bioScore: 'B',
    co2Reduction: 38,
    costModifier: 8,
    metrics: { carbon: 55, water: 60, biodiversity: 50, cost: 75, materials: 65 },
  },
  {
    id: 'nature-first',
    title: 'Nature-First',
    subtitle: 'Premium Eco-Design',
    description: 'Cutting-edge biophilic architecture with maximum environmental harmony.',
    bioScore: 'A',
    co2Reduction: 78,
    costModifier: 18,
    metrics: { carbon: 90, water: 85, biodiversity: 95, cost: 60, materials: 88 },
    featured: true,
  },
]

// Extracted ArchitecturalImage to top-level
const ArchitecturalImage = ({
  prompt,
  seed,
  type,
  alt,
  className = "",
  onSourceUpdate,
  projectData,
}: {
  prompt: string;
  seed: number;
  type: 'realistic' | 'draft' | 'elevation' | 'site';
  alt: string;
  className?: string;
  onSourceUpdate?: (source: string) => void;
  projectData: any;
}) => {
  const [imgSrc, setImgSrc] = useState('')
  const [imgSrcB, setImgSrcB] = useState('')
  const [currentPlan, setCurrentPlan] = useState<'a' | 'b'>('a')
  const [loaded, setLoaded] = useState(false)
  const isFetchingRef = useRef(false)

  const fetchImage = useCallback(async (retryNum: number, force: boolean = false) => {
    if (isFetchingRef.current && !force) return
    isFetchingRef.current = true
    
    try {
      // 1. Curated Fallback Logic (Strategy Pattern)
      const projName = projectData.name.toLowerCase()
      const isDubai = projName.includes("qusais") || projName.includes("twar")
      const isBBAY = projName.includes("bbay")
      const isEcoTech = projName.includes("eco") || projName.includes("tech") || projName.includes("suburb")
      
      if (isDubai || isBBAY || isEcoTech) {
        const folder = isBBAY ? "bbay" : isEcoTech ? "curated" : "qusais"
        const prefix = isEcoTech ? "eco_" : ""
        const idx = (type === 'draft' ? 1 : type === 'elevation' ? 2 : type === 'site' ? 3 : 4)
        const curatedUrl = `/${folder}/${prefix}${idx}.png`
        
        setImgSrc(curatedUrl)
        setLoaded(true)
        onSourceUpdate?.('Terron Curated Master')
        isFetchingRef.current = false
        return
      }

      // 2. Neural Stream logic
      onSourceUpdate?.('Terron Neural Core')
      const apiSeed = seed + retryNum * 7
      const result = await generateImage(
        prompt, 
        apiSeed, 
        type, 
        [], 
        projectData.visualSpecs || "", 
        `var-${apiSeed}`, 
        projectData
      )
      
      if (result && result.url) {
        if (currentPlan === 'a') {
          setImgSrcB(result.url)
          setCurrentPlan('b')
        } else {
          setImgSrc(result.url)
          setCurrentPlan('a')
        }
        setLoaded(true)
      } else if (result && (result.url === null || result.source === 'Backend Error')) {
        // Fallback to pollinations if backend fails or returns null
        const cleanPrompt = prompt.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
        const shortPrompt = cleanPrompt.length > 200 ? cleanPrompt.slice(0, 200) : cleanPrompt;
        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(shortPrompt)}?width=1280&height=720&nologo=true&enhance=false&seed=${apiSeed}`;
        if (currentPlan === 'a') {
          setImgSrcB(fallbackUrl)
          setCurrentPlan('b')
        } else {
          setImgSrc(fallbackUrl)
          setCurrentPlan('a')
        }
        setLoaded(true)
      }
    } catch (err) {
      console.error('Neural render error:', err)
      // Final fallback on catastrophic error
      const apiSeed = seed + retryNum * 7
      const cleanPrompt = prompt.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
      const shortPrompt = cleanPrompt.length > 200 ? cleanPrompt.slice(0, 200) : cleanPrompt;
      setImgSrc(`https://image.pollinations.ai/prompt/${encodeURIComponent(shortPrompt)}?width=1280&height=720&nologo=true&enhance=false&seed=${apiSeed}`);
      setLoaded(true)
    } finally {
      isFetchingRef.current = false
    }
  }, [prompt, seed, type, projectData, onSourceUpdate, currentPlan])

  useEffect(() => {
    fetchImage(0)
  }, [fetchImage])

  const activeSrc = currentPlan === 'a' ? imgSrc : (imgSrcB || imgSrc)

  return (
    <div className={`relative w-full h-full group bg-[#08100d] overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        {activeSrc ? (
          <motion.img
            key={activeSrc}
            src={activeSrc}
            alt={alt}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`w-full h-full ${type === 'realistic' ? 'object-cover' : 'object-contain p-8 bg-white/5'}`}
          />
        ) : null}
      </AnimatePresence>

      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-10">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-mono">Calibrating Neural Vision...</p>
        </div>
      )}

      {/* Subtle Phase Indicator */}
      <div className="absolute top-6 left-6 flex items-center gap-2 pointer-events-none z-20">
        <div className="px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-[0.2em]">{type}</p>
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const router = useRouter()
  const { project, updateProject } = useProject()
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null)
  const [imageModelSource, setImageModelSource] = useState('Terron Neural Core')

  const projectData = project || DEMO_PROJECT
  const weather = projectData.weather || DEMO_PROJECT.weather!
  
  // High-quality architectural fallbacks for demo projects
  const getCritiqueFallback = () => {
    const projName = projectData.name.toLowerCase()
    if (projName.includes('qusais')) return "The Qusais Villa represents a paradigm shift in desert residential architecture. By integrating passive thermal mass with high-performance solar glass, the design achieves a 40% reduction in cooling loads. The orientation is optimized for the prevailing shamal winds, facilitating natural cross-ventilation through the open-plan family living areas."
    if (projName.includes('bbay')) return "The BBay Cultural Center is a study in flood-resilient, net-zero public infrastructure. Its parametric kinetic shading system responds dynamically to solar intensity, while the greywater-fed vertical gardens create a micro-climatic oasis. The design harmonizes monumental structural arches with high-performance eco-technology."
    return "Synthesizing site-specific environmental data with structural massing constraints. The neural engine is calibrating the optimal resilience parameters for your project based on the local climate stressors and volumetric footprint."
  }

  const critiqueText = projectData.aiAnalysis?.designCritique || projectData.aiAnalysis?.originalDesignFeedback || getCritiqueFallback()
  const environmentalScore = projectData.aiAnalysis?.environmentalScore || (projectData.name.toLowerCase().includes('qusais') ? 'A+' : 'A')
  const thermalRisk = projectData.aiAnalysis?.thermalRisk || (weather.temperature_max > 40 ? 'Critical' : 'High')
  const designProblems = projectData.aiAnalysis?.designProblems || [
    { problem: 'High Solar Heat Gain', dataEvidence: `Peak UV Index of ${weather.uv_index} detected`, fix: 'Apply selective low-E glazing and external shading louvres.', impact: '40% Cooling Load Reduction' },
    { problem: 'Hydrological Scarcity', dataEvidence: `${weather.precipitation_sum}mm annual rainfall`, fix: 'Implement greywater recycling for irrigation.', impact: '35% Water Savings' }
  ]
  const calculatedMetrics = projectData.aiAnalysis?.calculatedMetrics || {
    carbonImpact: projectData.area * 0.45,
    thermalEfficiency: 88,
    biodiversityGain: 72
  }

  const getAiEnhancedDesigns = () => {
    if (!projectData.aiAnalysis) return designOptions
    return designOptions.map(design => {
      if (design.id === 'nature-first') {
        const metrics = projectData.aiAnalysis.calculatedMetrics;
        return {
          ...design,
          bioScore: projectData.aiAnalysis.environmentalScore || design.bioScore,
          co2Reduction: projectData.aiAnalysis.co2ReductionEstimate ? `-${parseInt(String(projectData.aiAnalysis.co2ReductionEstimate).replace(/[^0-9]/g, ''))}%` : design.co2Reduction,
          description: projectData.aiAnalysis.biodiversityImpact || design.description,
          metrics: { ...design.metrics, carbon: metrics?.carbonImpact || design.metrics.carbon, water: metrics?.thermalEfficiency || design.metrics.water }
        }
      }
      return design
    })
  }

  const enhancedDesigns = getAiEnhancedDesigns()
  const handleSelectDesign = (designId: string) => {
    setSelectedDesign(designId)
    updateProject({ selectedDesign: designId as any })
  }

  const handleProceed = () => { if (selectedDesign) router.push('/outcome') }

  const getPrompt = (type: 'realistic' | 'draft' | 'elevation' | 'site') => {
    const buildingType = projectData.buildingType || 'Residential Villa'
    const structuralControl = `STRICT GEOMETRIC CONSISTENCY: Maintain ${projectData.area}m² footprint and specific massing across every view.`;
    const structuralLock = `(Architectural Style Locked: Precision Eco-Tech ${buildingType}, clean geometric volumes, integrated solar glass. ${structuralControl}).`;
    
    switch (type) {
      case 'draft': return `Strict 2D architectural ground floor plan drawing. Simple black lines on white. ${structuralLock}`;
      case 'elevation': return `Strict 2D front facade elevation, front-view orthographic. ${structuralLock}`;
      case 'site': return `Technical 2D architectural site plan, top-down. ${structuralLock}`;
      case 'realistic': return `Final architectural vision of a high-end ${buildingType}. Professional architectural photography. ${structuralLock}`;
    }
  }

  const seedBase = projectData.name.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)

  const ecoDossier = projectData.aiAnalysis?.ecoDossier || [
    {
      trick: 'Passive Thermal Mass',
      location: 'Foundation slab & external walls',
      why: `With a max temperature of ${weather.temperature_max}°C and a UV index of ${weather.uv_index}, uninsulated walls will radiate heat into living spaces through the night.`,
      how: 'Increase wall thickness to 250mm using rammed earth or high-mass concrete blocks. Coat exterior in light lime plaster.',
      benefit: '~3–4°C reduction in indoor peak temperature, reducing HVAC runtime by approx 25%.',
      urgency: 'Critical' as const
    },
    {
      trick: 'Solar Shading System',
      location: 'South & West-facing facades',
      why: `At UV index ${weather.uv_index} and ${weather.temperature_max}°C peak, west-facing glass will experience intense solar gain in the afternoon.`,
      how: 'Install fixed horizontal louvres at 35° pitch on south glazing; motorized vertical fins on west elevation.',
      benefit: 'Reduces peak solar heat gain by ~60%, saving ~1,800 kWh/yr.',
      urgency: 'High' as const
    },
    {
      trick: 'Greywater Recycling Loop',
      location: 'Utility area to landscaping',
      why: `Annual rainfall of ${weather.precipitation_sum}mm is insufficient to sustain natural irrigation.`,
      how: 'Install a compact greywater treatment unit (50L/hr). Run treated water to subsurface drip irrigation.',
      benefit: 'Saves ~55,000L of potable water per year for a household of 4.',
      urgency: 'High' as const
    },
    {
      trick: 'Natural Cross-Ventilation',
      location: 'Ground floor to roof vents',
      why: `Wind speed is ${weather.wind_speed} km/h. Strategic openings will enable passive stack ventilation.`,
      how: 'Position inlet louvres on the windward facade; install solar-powered roof turbines.',
      benefit: 'Achieves thermal neutrality in shoulder seasons; reduces annual energy use by ~15%.',
      urgency: 'Medium' as const
    },
  ]

  return (
    <main className="min-h-screen bg-[#050a08] selection:bg-primary/30">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 py-12 pt-24">
        <div id="report-content" className="space-y-16">
          
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-[3rem] p-12 mb-12 border border-emerald-500/10 relative overflow-hidden shadow-3xl"
          >
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Activity className="w-96 h-96 text-emerald-400" />
            </div>

            <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
              <div className="flex-1 space-y-8">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="px-4 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-[0.3em] border border-primary/20">Analysis Sequence 01</span>
                    <span className="text-white/20 text-xs font-mono tracking-widest uppercase">ID: {projectData.id?.slice(0,8) || 'TERRON-01'}</span>
                  </div>
                  <h1 className="font-serif text-7xl md:text-8xl font-bold mb-6 text-white leading-tight tracking-tighter">
                    {projectData.name}
                  </h1>
                  <p className="text-2xl text-emerald-100/60 font-light max-w-3xl leading-relaxed">
                    {projectData.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-6">
                  <div className="px-8 py-5 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-4 backdrop-blur-xl">
                    <Thermometer className="w-8 h-8 text-rose-400" />
                    <div><p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Peak Climate</p><p className="text-2xl text-white font-mono font-bold">{weather.temperature_max}°C</p></div>
                  </div>
                  <div className="px-8 py-5 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-4 backdrop-blur-xl">
                    <Droplets className="w-8 h-8 text-sky-400" />
                    <div><p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Hydrology</p><p className="text-2xl text-white font-mono font-bold">{weather.precipitation_sum}mm</p></div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-96">
                <div className="glass-card p-10 rounded-[2.5rem] border-white/10 border bg-white/5 shadow-2xl relative overflow-hidden group hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-start mb-10">
                    <div><p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Environmental</p><p className="text-4xl font-serif font-bold text-white tracking-tighter">Bio-Rating</p></div>
                    <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20 shadow-glow"><span className="text-4xl font-serif font-bold text-primary">{environmentalScore}</span></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: '94%' }} className="h-full bg-primary shadow-[0_0_20px_rgba(45,122,79,0.5)]" /></div>
                    <div className="flex justify-between items-center text-[10px] font-mono tracking-[0.3em] text-white/30"><span>STABILITY INDEX</span><span className="text-primary font-bold">94.2%</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-16 border-t border-white/10">
              <div className="flex flex-col lg:flex-row gap-12">
                <div className="lg:w-1/3">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3"><Brain className="w-5 h-5" /> Neural Design Critique</h3>
                  <p className="text-3xl font-serif text-white/90 leading-tight tracking-tight">Synthesizing site-specific environmental data with structural massing constraints.</p>
                </div>
                <div className="lg:w-2/3">
                  <div className="glass-card p-10 rounded-[2rem] border-emerald-500/20 border bg-emerald-500/5 relative overflow-hidden group">
                    <p className="text-lg text-emerald-50/90 leading-relaxed font-medium relative z-10 italic">"{critiqueText}"</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-8">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest"><CheckCircle2 className="w-4 h-4" />Analysis Optimized</div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40"><ImageIcon className="w-4 h-4" />Neural Stream: {imageModelSource}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Grid Section */}
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Thermal Peak', value: `${weather.temperature_max}°C`, icon: Thermometer, color: 'text-rose-400' },
                { label: 'Humidity', value: `${weather.humidity}%`, icon: Droplets, color: 'text-sky-400' },
                { label: 'UV Intensity', value: weather.uv_index, icon: Sun, color: 'text-amber-400' },
                { label: 'Avg Wind', value: `${weather.wind_speed}km/h`, icon: Wind, color: 'text-indigo-400' }
              ].map((stat, i) => (
                <motion.div key={i} whileHover={{ y: -5 }} className="glass-card p-8 rounded-[2rem] border-white/5 space-y-4 shadow-xl">
                  <div className={`flex items-center gap-3 ${stat.color}`}><stat.icon className="w-5 h-5" /><span className="text-xs font-bold uppercase tracking-[0.2em]">{stat.label}</span></div>
                  <div className="text-3xl font-mono font-bold text-white">{stat.value}</div>
                </motion.div>
              ))}
            </div>
            <div className="glass-card rounded-[2.5rem] p-12 border-white/10 flex flex-col justify-center bg-white/5 relative overflow-hidden">
               <div className="absolute -right-20 -bottom-20 opacity-5 pointer-events-none"><Zap className="w-96 h-96 text-white" /></div>
               <h3 className="text-2xl font-serif font-bold text-white mb-6 uppercase tracking-[0.2em]">Resilience Analysis</h3>
               <p className="text-xl text-white/50 leading-relaxed font-light">Systematic calibration of building envelope against local meteorological stressors. The neural engine has identified optimal massing ratios to minimize HVAC dependence while maximizing passive gain.</p>
            </div>
          </div>

          {/* Visualization Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-20">
            <div className="grid grid-cols-2 gap-8">
              {['draft', 'elevation', 'site'].map((type, i) => (
                <motion.div 
                  key={type} 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: i * 0.1 }}
                  className={`glass-card rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/40 shadow-2xl ${i === 2 ? 'col-span-2 aspect-[21/9]' : 'aspect-square'}`}
                >
                  <ArchitecturalImage prompt={getPrompt(type as any)!} seed={seedBase + i * 10} type={type as any} alt={type} projectData={projectData} onSourceUpdate={setImageModelSource} />
                </motion.div>
              ))}
            </div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-[3rem] overflow-hidden border-2 border-primary/30 shadow-[0_0_50px_rgba(45,122,79,0.15)] aspect-square lg:aspect-auto"
            >
              <ArchitecturalImage prompt={getPrompt('realistic')!} seed={seedBase + 40} type="realistic" alt="Final Vision" projectData={projectData} onSourceUpdate={setImageModelSource} className="object-cover" />
            </motion.div>
          </div>

          <TechnicalMeasurements totalArea={projectData.area} buildingType={projectData.buildingType} syntheticLayout={projectData.aiAnalysis?.syntheticLayout} />
          
          <EcoModelViewer projectData={projectData} ecoDossier={ecoDossier} />

          <div className="mt-20 glass-card rounded-[3rem] p-16 border-2 border-primary/20 bg-primary/5 shadow-3xl">
            <SustainabilityDossier dossier={ecoDossier} designProblems={designProblems} thermalRisk={thermalRisk} temp={weather.temperature_max} calculatedMetrics={calculatedMetrics} />
          </div>

          {/* Strategy Selection */}
          <div className="mt-32 mb-20">
            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center shadow-glow"><Settings2 className="w-8 h-8 text-primary" /></div>
              <div><h2 className="font-serif text-5xl font-bold text-white tracking-tight">Final Optimization Strategy</h2><p className="text-white/40 uppercase tracking-[0.4em] text-xs mt-1">Select the final environmental intensity layer</p></div>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {enhancedDesigns.map((design, index) => (
                <DesignCard key={design.id} design={design} isSelected={selectedDesign === design.id} onSelect={() => handleSelectDesign(design.id)} delay={0.1 * index} />
              ))}
            </div>
            <AnimatePresence>
              {selectedDesign && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-16 p-12 glass-card rounded-[2.5rem] border border-primary/30 bg-primary/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Zap className="w-48 h-48 text-primary" /></div>
                  <div className="flex flex-col lg:flex-row gap-12 items-center">
                    <div className="flex-1 text-center lg:text-left"><h3 className="text-4xl font-serif font-bold text-white uppercase tracking-tight mb-4">{designOptions.find(d => d.id === selectedDesign)?.title} Strategy Activated</h3><p className="text-2xl text-emerald-100/60 font-light">The neural engine has calibrated all volumetric and material parameters for peak {selectedDesign} efficiency.</p></div>
                    <div className="flex gap-10"><div className="text-center"><p className="text-xs text-white/40 uppercase tracking-widest mb-2">CO2 Potential</p><p className="text-6xl font-serif font-bold text-primary tracking-tighter">-{enhancedDesigns.find(d => d.id === selectedDesign)?.co2Reduction}%</p></div></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Call to Action */}
          <div className="flex flex-col items-center gap-12 mt-32 pt-20 border-t border-white/5 pb-20 text-center">
            <h3 className="text-6xl font-serif font-bold text-white tracking-tight">Ready for Implementation.</h3>
            <p className="text-2xl text-white/30 max-w-2xl font-light">Download the full technical specification or proceed to the final construction synchronization phase.</p>
            <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl">
              <DownloadReportButton projectData={projectData} />
              <button 
                onClick={handleProceed} 
                disabled={!selectedDesign} 
                className={`flex-1 flex items-center justify-center gap-4 px-12 py-7 rounded-[2rem] font-bold text-2xl transition-all ${selectedDesign ? 'bg-primary text-primary-foreground hover:bg-primary/90 glow-emerald scale-105 active:scale-100' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10'}`}
              >
                Launch Build Phase <ArrowRight className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <AIChatbot project={projectData} />
    </main>
  )
}
