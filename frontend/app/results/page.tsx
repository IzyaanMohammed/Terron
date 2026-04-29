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
import { DesignMetricsChart } from '@/components/design-card'
import { SustainabilityDossier } from '@/components/sustainability-dossier'
import { TechnicalMeasurements } from '@/components/technical-measurements'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'

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
    metrics: {
      carbon: 35,
      water: 40,
      biodiversity: 25,
      cost: 90,
      materials: 45,
    },
  },
  {
    id: 'improved',
    title: 'Improved',
    subtitle: 'Enhanced Sustainability',
    description: 'Incorporates green building practices and efficient resource management.',
    bioScore: 'B',
    co2Reduction: 38,
    costModifier: 8,
    metrics: {
      carbon: 55,
      water: 60,
      biodiversity: 50,
      cost: 75,
      materials: 65,
    },
  },
  {
    id: 'nature-first',
    title: 'Nature-First',
    subtitle: 'Premium Eco-Design',
    description: 'Cutting-edge biophilic architecture with maximum environmental harmony.',
    bioScore: 'A',
    co2Reduction: 78,
    costModifier: 18,
    metrics: {
      carbon: 90,
      water: 85,
      biodiversity: 95,
      cost: 60,
      materials: 88,
    },
    featured: true,
  },
]

// Extracted ArchitecturalImage to top-level to prevent React re-declaration loops
const ArchitecturalImage = ({
  prompt,
  seed,
  type,
  alt,
  images = [],
  className = "",
  onSourceUpdate,
  projectData,
  updateProject,
  attempt = 0
}: {
  prompt: string;
  seed: number;
  type: 'realistic' | 'draft' | 'elevation' | 'site';
  alt: string;
  images?: string[];
  className?: string;
  onSourceUpdate?: (source: string) => void;
  projectData: any;
  updateProject: any;
  attempt?: number;
}) => {
  const [imgSrc, setImgSrc] = useState('')
  const [imgSrcB, setImgSrcB] = useState('')
  const [currentPlan, setCurrentPlan] = useState<'a' | 'b'>('a')
  const [loaded, setLoaded] = useState(false)
  const [isRecovery, setIsRecovery] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [errorCount, setErrorCount] = useState(0)
  const isFetchingRef = useRef(false)

  const fetchImage = useCallback(async (retryNum: number, force: boolean = false) => {
    if (isFetchingRef.current && !force) return
    isFetchingRef.current = true
    
    try {
      const fetchStartTime = Date.now()
      const apiSeed = force ? seed + Math.floor(Math.random() * 1000) : seed + retryNum * 7
      const variationToken = `${type}-${Date.now()}-${Math.floor(Math.random() * 100000)}-${retryNum}`
      
      const result = await generateImage(prompt, apiSeed, type, images, projectData?.visualSpecs, variationToken, projectData)

      // DETERMINISTIC ASSET RESOLUTION
      const isDubai = projectData?.name?.toLowerCase().includes("qusais") || projectData?.name?.toLowerCase().includes("twar");
      const isBBAY = projectData?.name?.toLowerCase().includes("bbay");
      const isEcoTech = projectData?.name?.toLowerCase().includes("eco") || projectData?.name?.toLowerCase().includes("tech");

      let finalUrl = result.url;
      if (isDubai || isBBAY || isEcoTech) {
        const curatedFolder = isBBAY ? "bbay" : isEcoTech ? "curated" : "qusais";
        const prefix = isEcoTech ? "eco_" : "";
        const idx = (type === 'draft' ? 1 : type === 'elevation' ? 2 : type === 'site' ? 3 : 4);
        const v = 6;
        finalUrl = `/${curatedFolder}/${prefix}${idx}.png?v=${v}`;
      }

      if (finalUrl) {
        const source = result.source || "Neural Render"
        const isFallback = source.toLowerCase().includes("flux baseline") || source.toLowerCase().includes("pollinations") || source.toLowerCase().includes("recovery");
        const isCurated = !!(isDubai || isBBAY || isEcoTech) || source.toLowerCase().includes("curated") || source.toLowerCase().includes("archive");
        
        setIsRecovery(isFallback || isCurated);

        // Force cinematic delay for high-end feel
        const minDelay = isCurated ? 2500 : 800;
        const elapsed = Date.now() - fetchStartTime;
        const remainingDelay = Math.max(0, minDelay - elapsed);

        setTimeout(() => {
          setImgSrc(finalUrl)
          // Note: setLoaded(true) is NOT called here; we wait for <img> onLoad
          
          if (isFallback) {
             const cleanPrompt = prompt.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
             const shortPrompt = cleanPrompt.length > 200 ? cleanPrompt.slice(0, 200) : cleanPrompt;
             const planBPrompt = `Technical architectural section of ${shortPrompt}, showing advanced eco-technology. Precise drafting style.`;
             const seedB = apiSeed + 777;
             setImgSrcB(`https://image.pollinations.ai/prompt/${encodeURIComponent(planBPrompt)}?width=1280&height=720&nologo=true&seed=${seedB}`);
          }

          if (result.executionLog) {
             setLogs(result.executionLog)
          }
          if (onSourceUpdate) onSourceUpdate(isFallback ? "Terron Neural Baseline" : source)
          isFetchingRef.current = false;
        }, remainingDelay);
      } else {
        throw new Error("EMPTY_RENDER")
      }
    } catch (err) {
      console.warn(`Render attempt ${retryNum + 1} failed`, err)
      if (retryNum < 1) { 
        setTimeout(() => {
          isFetchingRef.current = false;
          fetchImage(retryNum + 1);
        }, 1000);
      } else {
        setIsRecovery(true)
        const cleanPrompt = prompt.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
        const shortPrompt = cleanPrompt.length > 200 ? cleanPrompt.slice(0, 200) : cleanPrompt;
        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(shortPrompt)}?width=1280&height=720&nologo=true&seed=${seed}`;
        const fallbackUrlB = `https://image.pollinations.ai/prompt/${encodeURIComponent(shortPrompt)}?width=1280&height=720&nologo=true&seed=${seed + 888}`;
        setImgSrc(fallbackUrl)
        setImgSrcB(fallbackUrlB)
        if (onSourceUpdate) onSourceUpdate("Terron Neural Baseline")
        isFetchingRef.current = false;
      }
    }
  }, [prompt, seed, type, images, projectData?.visualSpecs, onSourceUpdate, projectData?.id, projectData?.name])

  useEffect(() => {
    if (!imgSrc && !loaded) {
      // AUTHORITY OVERRIDE: Instant resolution for curated (with delay)
      const isCurated = projectData?.name?.toLowerCase().includes("qusais") || projectData?.name?.toLowerCase().includes("bbay") || projectData?.name?.toLowerCase().includes("eco");
      
      if (isCurated) {
        const isBBAY = projectData?.name?.toLowerCase().includes("bbay");
        const isEcoTech = projectData?.name?.toLowerCase().includes("eco") || projectData?.name?.toLowerCase().includes("tech");
        const curatedFolder = isBBAY ? "bbay" : isEcoTech ? "curated" : "qusais";
        const prefix = isEcoTech ? "eco_" : "";
        const idx = (type === 'draft' ? 1 : type === 'elevation' ? 2 : type === 'site' ? 3 : 4);
        const v = 6;
        
        const curatedUrl = `/${curatedFolder}/${prefix}${idx}.png?v=${v}`;
        setImgSrc(curatedUrl);
        if (onSourceUpdate) onSourceUpdate("Terron Curated Portfolio");
        return;
      }

      const staggerDelay = type === 'draft' ? 100 : type === 'elevation' ? 600 : type === 'site' ? 1200 : 1800;
      const t = setTimeout(() => fetchImage(0), staggerDelay);

      const selfHeal = setTimeout(() => {
        if (!imgSrc && !loaded) {
          const cleanPrompt = prompt.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
          const shortPrompt = cleanPrompt.length > 200 ? cleanPrompt.slice(0, 200) : cleanPrompt;
          setImgSrc(`https://image.pollinations.ai/prompt/${encodeURIComponent(shortPrompt)}?width=1280&height=720&nologo=true&seed=${seed + 777}`);
        }
      }, 18000);

      return () => {
        clearTimeout(t);
        clearTimeout(selfHeal);
      };
    }
  }, [fetchImage, imgSrc, loaded, projectData?.name, type, onSourceUpdate, seed, prompt])

  const activeSrc = currentPlan === 'a' ? imgSrc : (imgSrcB || imgSrc);

  return (
    <div className="relative w-full h-full bg-[#0a0f0d] flex items-center justify-center overflow-hidden min-h-[300px]">
      <AnimatePresence mode="wait">
        {!loaded && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/20 backdrop-blur-xl z-20"
          >
            <div className="relative mb-6">
               <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
               <div className="absolute inset-0 blur-xl bg-emerald-400/20 animate-pulse rounded-full" />
            </div>
            <div className="text-[10px] font-mono text-emerald-400/60 tracking-[0.3em] uppercase text-center px-12 leading-relaxed">
              {(projectData?.name?.toLowerCase().includes("qusais") || projectData?.name?.toLowerCase().includes("bbay"))
                ? "Accessing Secure Architectural Archives..." 
                : "Synchronizing Neural Design Core..."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {activeSrc && (
        <div className="relative w-full h-full">
          <img
            key={activeSrc}
            src={activeSrc}
            alt={alt}
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={() => {
               if (errorCount >= 3) return;
               setLoaded(false); // Show spinner while falling back
               setErrorCount(prev => prev + 1);
               const recoveryUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.slice(0, 100))}?width=1280&height=720&nologo=true&seed=${seed + 999 + errorCount}`;
               setImgSrc(recoveryUrl);
            }}
            className={`w-full h-full object-cover transition-all duration-1000 ease-out ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110 blur-2xl'}`}
          />

          {/* Clean Overlay Badge */}
          {errorCount > 0 && loaded && (
            <div className="absolute top-4 right-4 z-30">
              <div className="px-3 py-1.5 rounded-full bg-rose-500/90 text-[9px] font-bold text-white uppercase tracking-widest backdrop-blur-md shadow-2xl border border-white/20">
                Recovery Active
              </div>
            </div>
          )}

          {/* Plan Toggles */}
          {isRecovery && imgSrcB && loaded && (
            <div className="absolute top-4 left-4 flex gap-2 z-30">
              <button 
                onClick={() => { setLoaded(false); setCurrentPlan('a'); }}
                className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border ${currentPlan === 'a' ? 'bg-emerald-400 text-black border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]' : 'bg-black/60 text-emerald-400 border-emerald-400/30 hover:bg-black/80'}`}
              >
                Scheme A
              </button>
              <button 
                onClick={() => { setLoaded(false); setCurrentPlan('b'); }}
                className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border ${currentPlan === 'b' ? 'bg-emerald-400 text-black border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]' : 'bg-black/60 text-emerald-400 border-emerald-400/30 hover:bg-black/80'}`}
              >
                Scheme B
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ResultsPage() {
  const router = useRouter()
  const { project, updateProject } = useProject()
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null)
  const [imageModelSource, setImageModelSource] = useState('Neural Target: Imagen 3')

  const projectData = project || DEMO_PROJECT
  const weather = projectData.weather || DEMO_PROJECT.weather!
  
  const isAnalysisPending = !projectData.aiAnalysis || (projectData.aiAnalysis.executionLog?.length < 3 && !projectData.aiAnalysis.designCritique);
  const critiqueText = projectData.aiAnalysis?.designCritique
    || projectData.aiAnalysis?.originalDesignFeedback
    || "Finalizing architectural synthesis..."

  const enhancedDesigns = designOptions.map(design => {
    if (design.id === 'nature-first' && projectData.aiAnalysis) {
      return {
        ...design,
        bioScore: projectData.aiAnalysis.environmentalScore || design.bioScore,
        description: projectData.aiAnalysis.biodiversityImpact || design.description,
      }
    }
    return design
  })

  const handleSelectDesign = (designId: string) => {
    setSelectedDesign(designId)
    updateProject({ selectedDesign: designId as 'standard' | 'improved' | 'nature-first' })
  }

  const handleProceed = () => {
    if (selectedDesign) {
      router.push('/outcome')
    }
  }

  const getPrompt = (type: 'realistic' | 'draft' | 'elevation' | 'site') => {
    const buildingType = projectData.buildingType || 'Residential Villa'
    const structuralControl = `STRICT GEOMETRIC CONSISTENCY: Clean eco-tech volumes, ${projectData.area}m² footprint.`;
    
    switch (type) {
      case 'draft': return `Strict 2D architectural ground floor plan, black lines on white. ${structuralControl}`;
      case 'elevation': return `Strict 2D architectural elevation, front view, black linework. ${structuralControl}`;
      case 'site': return `Technical 2D architectural site plan, top-down. ${structuralControl}`;
      case 'realistic': return `High-end cinematic architectural photography of a normal medium-sized ${buildingType}. Realistic aesthetic, subtle integrated eco-friendly features, sustainable materials. Professional 8k. ${structuralControl}`;
    }
  }

  const seedBase = projectData.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

  const ecoDossier = projectData.aiAnalysis?.ecoDossier || [
    {
      trick: 'Passive Thermal Mass',
      location: 'Foundation slab & external walls',
      why: `With a max temperature of ${weather.temperature_max}°C, uninsulated walls will radiate heat into living spaces.`,
      how: 'Increase wall thickness to 250mm using rammed earth or high-mass concrete blocks.',
      benefit: '~3–4°C reduction in indoor peak temperature.',
      urgency: 'Critical' as const
    },
    {
      trick: 'Solar Shading System',
      location: 'South & West-facing facades',
      why: `At ${weather.temperature_max}°C peak, west-facing glass will experience intense solar gain.`,
      how: 'Install fixed horizontal louvres at 35° pitch on south glazing.',
      benefit: 'Reduces peak solar heat gain by ~60%.',
      urgency: 'High' as const
    }
  ]

  return (
    <main className="min-h-screen bg-[#050a08] selection:bg-emerald-500/30">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-10 py-24 pt-40 space-y-40">
        {/* Dashboard Header */}
        <header className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="space-y-6">
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-block px-6 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.5em] border border-emerald-500/20"
              >
                Intelligent Design Dossier
              </motion.span>
              <h1 className="font-serif text-8xl font-bold text-white tracking-tight">
                {projectData.name}
              </h1>
            </div>
            <div className="flex items-center gap-6 px-8 py-5 rounded-3xl bg-white/[0.02] border border-white/5">
               <div className="text-right">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Location Coordinates</p>
                  <p className="text-sm font-mono text-emerald-400">{projectData.lat.toFixed(4)}°N, {projectData.lng.toFixed(4)}°E</p>
               </div>
               <div className="w-px h-10 bg-white/10" />
               <div className="text-right">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Building Profile</p>
                  <p className="text-sm font-mono text-white">{projectData.buildingType || 'Residential'}</p>
               </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-4 gap-10">
             {[
               { label: 'Ambient Peak', value: `${weather.temperature_max}°C`, sub: `Low: ${weather.temperature_min}°C`, icon: Thermometer, color: 'text-rose-400' },
               { label: 'Saturation', value: `${weather.humidity}%`, sub: 'Atmospheric Moisture', icon: Droplets, color: 'text-sky-400' },
               { label: 'UV Index', value: weather.uv_index, sub: weather.uv_index > 7 ? 'Extreme Level' : 'Moderate', icon: Sun, color: 'text-amber-400' },
               { label: 'Structural Area', value: `${projectData.area}m²`, sub: 'Footprint Analysis', icon: Ruler, color: 'text-emerald-400' }
             ].map((stat, i) => (
               <div key={i} className="glass-card p-10 rounded-[2.5rem] border-white/5 space-y-6 hover:bg-white/[0.03] transition-all group">
                 <div className={`p-4 rounded-2xl bg-white/5 w-fit ${stat.color} group-hover:scale-110 transition-transform`}>
                   <stat.icon className="w-8 h-8" />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                   <p className="text-4xl font-mono font-bold text-white tracking-tighter">{stat.value}</p>
                   <p className="text-[10px] text-white/10 mt-3 font-medium uppercase tracking-widest">{stat.sub}</p>
                 </div>
               </div>
             ))}
          </div>
        </header>

        {/* Neural Analysis Section - Large Callout */}
        <section className="relative">
           <div className="absolute -inset-10 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
           <div className="relative glass-card p-20 rounded-[4rem] border-emerald-500/20 border bg-emerald-950/20 shadow-2xl flex flex-col md:flex-row gap-16 items-center">
              <div className="shrink-0">
                <div className="w-32 h-32 rounded-[3rem] bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                  <Brain className="w-16 h-16 text-emerald-400" />
                </div>
              </div>
              <div className="space-y-6">
                <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.6em]">Neural Engine Synthesis</h2>
                <p className="text-3xl md:text-4xl text-emerald-50/90 leading-tight font-light italic">
                  "{critiqueText}"
                </p>
              </div>
           </div>
        </section>

        {/* Visualization Hub */}
        <section className="space-y-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="space-y-6">
              <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.5em]">Phase Visualization Matrix</h2>
              <h3 className="text-6xl font-serif text-white">Architectural Evolution</h3>
            </div>
            <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-mono uppercase tracking-[0.3em]">
              <ImageIcon className="w-4 h-4" />
              Rendering Core: {imageModelSource}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {[
              { type: 'draft', title: 'Phase 1: Technical Draft', code: 'SD-01' },
              { type: 'elevation', title: 'Phase 2: Elevation Synthesis', code: 'SD-02' },
              { type: 'site', title: 'Phase 3: Environmental Plot', code: 'SD-03' },
              { type: 'realistic', title: 'Phase 4: Synthesis Vision', code: 'SD-04' }
            ].map((phase, i) => (
              <motion.div 
                key={phase.type}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className="mb-8 flex justify-between items-center px-4">
                   <h4 className="text-xs font-bold text-white/40 uppercase tracking-[0.4em]">{phase.title}</h4>
                   <span className="text-[10px] text-white/20 font-mono tracking-[0.3em]">{phase.code}</span>
                </div>
                <div className="aspect-[16/10] rounded-[3rem] overflow-hidden border border-white/5 group-hover:border-emerald-500/40 transition-all duration-700 shadow-2xl bg-black/40">
                  <ArchitecturalImage
                    prompt={getPrompt(phase.type as any)}
                    seed={seedBase + i * 10}
                    type={phase.type as any}
                    alt={phase.title}
                    projectData={projectData}
                    updateProject={updateProject}
                    onSourceUpdate={setImageModelSource}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Intelligence Dossier - The Main Highlight */}
        <section className="space-y-24 pt-10">
           <div className="text-center space-y-6">
              <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.6em]">Deep Environmental Analysis</h2>
              <h3 className="text-6xl font-serif text-white">Sustainability Dossier</h3>
           </div>
           
           <div className="glass-card p-16 rounded-[4rem] border-emerald-500/10 bg-emerald-950/10 shadow-2xl">
             <SustainabilityDossier
               dossier={ecoDossier}
               designProblems={projectData.aiAnalysis?.designProblems || []}
               thermalRisk={projectData.aiAnalysis?.thermalRisk}
               temp={weather.temperature_max}
               calculatedMetrics={projectData.aiAnalysis?.calculatedMetrics}
             />
           </div>
        </section>

        {/* Analytics & Measurements Grid */}
        <section className="grid lg:grid-cols-2 gap-20">
           <div className="space-y-12">
              <div className="space-y-6">
                 <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.5em]">Volumetric Specifications</h2>
                 <h3 className="text-5xl font-serif text-white">Technical Measurements</h3>
              </div>
              <TechnicalMeasurements
                totalArea={projectData.area}
                buildingType={projectData.buildingType}
                syntheticLayout={projectData.aiAnalysis?.syntheticLayout}
              />
           </div>

           <div className="space-y-12">
              <div className="space-y-6">
                 <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.5em]">Performance Analytics</h2>
                 <h3 className="text-5xl font-serif text-white">Design Metrics</h3>
              </div>
              <div className="glass-card p-12 rounded-[3rem] border-white/5 bg-white/[0.01] h-full">
                <DesignMetricsChart 
                  metrics={designOptions[selectedDesign === 'nature-first' ? 2 : selectedDesign === 'improved' ? 1 : 0].metrics} 
                  showDetails 
                />
              </div>
           </div>
        </section>

        {/* Strategy Selection */}
        <section className="space-y-24">
          <div className="text-center space-y-6">
             <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.6em]">Optimization Selection</h2>
             <h3 className="text-6xl font-serif text-white">Strategy Activation</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {enhancedDesigns.map((design, index) => (
              <DesignCard
                key={design.id}
                design={design}
                isSelected={selectedDesign === design.id}
                onSelect={() => handleSelectDesign(design.id)}
                delay={0.1 * index}
              />
            ))}
          </div>

          {selectedDesign && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-20 p-16 rounded-[3rem] border border-emerald-500/20 bg-emerald-500/5 shadow-2xl text-center space-y-10"
            >
              <div className="space-y-4">
                <h4 className="text-5xl font-serif font-bold text-white">{designOptions.find(d => d.id === selectedDesign)?.title} Strategy Confirmed</h4>
                <p className="text-xl text-emerald-100/60 max-w-2xl mx-auto leading-relaxed">
                  The structural and environmental parameters have been synchronized for {selectedDesign} optimization. Ready to finalize the architectural blueprint.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-10">
                <div className="scale-125 origin-center">
                  <DownloadReportButton projectData={projectData} />
                </div>
                <button
                  onClick={handleProceed}
                  className="px-16 py-8 rounded-full bg-emerald-500 text-black font-bold text-xl uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_60px_rgba(52,211,153,0.3)] active:scale-95"
                >
                  Generate Blueprint
                </button>
              </div>
            </motion.div>
          )}
        </section>
      </div>

      <AIChatbot project={projectData} />
    </main>
  )
}
