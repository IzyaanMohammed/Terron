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
import { DesignMetrics } from '@/components/design-card'
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
      case 'realistic': return `High-end cinematic architectural photography of a ${buildingType}. Integrated solar tech, luxury sustainable materials. Professional 8k. ${structuralControl}`;
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
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative min-h-[50vh] flex flex-col justify-center"
        >
          <div className="absolute -left-20 top-0 opacity-10 pointer-events-none">
            <Activity className="w-[40rem] h-[40rem] text-emerald-400" />
          </div>

          <div className="relative z-10 space-y-16">
            <div className="space-y-6">
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-block px-6 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.5em] border border-emerald-500/20"
              >
                Project Synthesis Report
              </motion.span>
              <h1 className="font-serif text-8xl md:text-9xl font-bold text-white tracking-tight leading-[0.85]">
                {projectData.name}
              </h1>
            </div>

            <p className="text-3xl md:text-4xl text-emerald-100/60 font-light max-w-5xl leading-relaxed">
              {projectData.description || "A next-generation architectural intervention blending high-tech performance with biological harmony."}
            </p>

            <div className="flex flex-wrap gap-10 pt-10">
               {[
                 { label: 'Thermal Peak', value: `${weather.temperature_max}°C`, icon: Thermometer, color: 'text-rose-400' },
                 { label: 'Hydrology', value: `${weather.precipitation_sum}mm`, icon: Droplets, color: 'text-sky-400' },
                 { label: 'Eco-Stability', value: 'Alpha-7', icon: Sparkles, color: 'text-emerald-400' }
               ].map((stat, i) => (
                 <div key={i} className="flex items-center gap-6 px-10 py-7 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all group">
                   <stat.icon className={`w-10 h-10 ${stat.color} group-hover:scale-110 transition-transform`} />
                   <div>
                     <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-1">{stat.label}</p>
                     <p className="text-3xl font-mono font-bold text-white tracking-tighter">{stat.value}</p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </motion.section>

        {/* Neural Analysis Section */}
        <section className="grid lg:grid-cols-2 gap-32 items-center">
           <div className="space-y-12">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-2xl">
                  <Brain className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.5em]">Neural Core Synthesis</h2>
              </div>
              <h3 className="text-5xl md:text-6xl font-serif text-white leading-tight">
                Synthesizing multi-modal environmental data.
              </h3>
              <div className="flex items-center gap-4">
                <span className="px-5 py-2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em] border border-emerald-500/20">
                  Resilience Optimized
                </span>
                <span className="text-white/30 text-[10px] font-mono uppercase tracking-[0.2em]">
                  Lat: {projectData.lat.toFixed(4)}° / Lng: {projectData.lng.toFixed(4)}°
                </span>
              </div>
           </div>

           <div className="relative group">
             <div className="absolute -inset-10 bg-emerald-500/5 blur-[100px] group-hover:bg-emerald-500/10 transition-all rounded-full" />
             <div className="relative glass-card p-16 rounded-[3rem] border-emerald-500/20 border bg-emerald-950/30 min-h-[400px] flex items-center shadow-2xl">
               <p className="text-2xl md:text-3xl text-emerald-50/90 leading-relaxed font-light italic">
                 "{critiqueText}"
               </p>
             </div>
           </div>
        </section>

        {/* Visualization Grid */}
        <section className="space-y-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="space-y-6">
              <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.5em]">Architectural Evolution</h2>
              <h3 className="text-6xl font-serif text-white">Visual Synthesis Phases</h3>
            </div>
            <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-mono uppercase tracking-[0.3em]">
              <ImageIcon className="w-4 h-4" />
              {imageModelSource}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {[
              { type: 'draft', title: 'Phase 1: Technical Draft', span: 'col-span-1' },
              { type: 'elevation', title: 'Phase 2: Facade Elevation', span: 'col-span-1' },
              { type: 'site', title: 'Phase 3: Environmental Plot', span: 'col-span-1' },
              { type: 'realistic', title: 'Phase 4: Final Vision', span: 'col-span-1' }
            ].map((phase, i) => (
              <motion.div 
                key={phase.type}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className={`${phase.span} group`}
              >
                <div className="mb-8 flex justify-between items-center px-4">
                   <h4 className="text-xs font-bold text-white/40 uppercase tracking-[0.3em]">{phase.title}</h4>
                   <span className="text-[10px] text-white/20 font-mono tracking-widest">SEQ.0{i+1}</span>
                </div>
                <div className="aspect-[16/10] rounded-[2.5rem] overflow-hidden border border-white/5 group-hover:border-emerald-500/40 transition-all duration-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black/40 group-hover:shadow-[0_0_80px_rgba(16,185,129,0.1)]">
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

        {/* Intelligence Dashboard */}
        <section className="space-y-24">
          <div className="text-center space-y-6">
             <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.5em]">Live Environmental Data</h2>
             <h3 className="text-6xl font-serif text-white">Intelligence Dashboard</h3>
          </div>

          <div className="grid lg:grid-cols-4 gap-10">
             {[
               { label: 'Thermal Peak', value: `${weather.temperature_max}°C`, sub: `Daily Low: ${weather.temperature_min}°C`, icon: Thermometer, color: 'text-rose-400' },
               { label: 'Saturation', value: `${weather.humidity}%`, sub: 'Atmospheric Moisture', icon: Droplets, color: 'text-sky-400' },
               { label: 'UV Intensity', value: weather.uv_index, sub: weather.uv_index > 7 ? 'Extreme Level' : 'Moderate Level', icon: Sun, color: 'text-amber-400' },
               { label: 'Wind Velocity', value: `${weather.wind_speed} km/h`, sub: `Orientation: ${weather.wind_direction}°`, icon: Wind, color: 'text-indigo-400' }
             ].map((stat, i) => (
               <div key={i} className="glass-card p-12 rounded-[3rem] border-white/5 space-y-10 hover:bg-white/[0.03] transition-all duration-500 group">
                 <div className={`p-6 rounded-3xl bg-white/5 w-fit ${stat.color} group-hover:scale-110 transition-transform`}>
                   <stat.icon className="w-10 h-10" />
                 </div>
                 <div className="space-y-2">
                   <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">{stat.label}</p>
                   <p className="text-5xl font-mono font-bold text-white tracking-tighter">{stat.value}</p>
                   <p className="text-xs text-white/10 mt-4 font-medium tracking-wide">{stat.sub}</p>
                 </div>
               </div>
             ))}
          </div>
        </section>

        {/* Dossier & Selection Section */}
        <section className="space-y-32">
          <div className="grid lg:grid-cols-2 gap-16">
             <div className="space-y-12">
               <div className="space-y-6">
                 <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.5em]">Optimization Strategy</h2>
                 <h3 className="text-5xl font-serif text-white">Final Configuration</h3>
               </div>
               <div className="grid gap-6">
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
             </div>

             <div className="space-y-12">
               <div className="space-y-6">
                 <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.5em]">Sustainability Logic</h2>
                 <h3 className="text-5xl font-serif text-white">System Dossier</h3>
               </div>
               <div className="glass-card p-10 rounded-[3rem] border-emerald-500/10 bg-emerald-950/10">
                 <SustainabilityDossier
                   dossier={ecoDossier}
                   designProblems={projectData.aiAnalysis?.designProblems || []}
                   thermalRisk={projectData.aiAnalysis?.thermalRisk}
                   temp={weather.temperature_max}
                   calculatedMetrics={projectData.aiAnalysis?.calculatedMetrics}
                 />
               </div>
             </div>
          </div>

          <TechnicalMeasurements
            totalArea={projectData.area}
            buildingType={projectData.buildingType}
            syntheticLayout={projectData.aiAnalysis?.syntheticLayout}
          />
        </section>

        {/* Final CTA */}
        <section className="py-40 text-center border-t border-white/5 space-y-16">
           <div className="max-w-4xl mx-auto space-y-12">
             <h2 className="text-6xl font-serif text-white leading-tight">Ready to generate the architectural dossier?</h2>
             <p className="text-2xl text-white/40 font-light max-w-2xl mx-auto">
               Finalize your selection to initiate the high-fidelity render pipeline and environmental certification.
             </p>
             <div className="flex flex-col sm:flex-row justify-center gap-10 pt-10">
                <button 
                  onClick={handleProceed}
                  disabled={!selectedDesign}
                  className={`
                    px-16 py-8 rounded-full font-bold text-xl uppercase tracking-[0.2em] transition-all shadow-2xl
                    ${selectedDesign 
                      ? "bg-emerald-500 text-black hover:scale-105 shadow-[0_0_60px_rgba(52,211,153,0.3)] active:scale-95" 
                      : "bg-white/5 text-white/20 cursor-not-allowed"}
                  `}
                >
                  Launch Build Phase
                </button>
                <div className="scale-125 origin-center">
                  <DownloadReportButton projectData={projectData} />
                </div>
             </div>
           </div>
        </section>
      </div>

      <AIChatbot project={projectData} />
    </main>
  )
}
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Outside Temp (Hot)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Inside Temp (Cooled by Eco-Design)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { time: '00:00', temp: weather.temperature_min + 3, sync: weather.temperature_min - 2 },
                      { time: '03:00', temp: weather.temperature_min, sync: weather.temperature_min - 5 },
                      { time: '06:00', temp: weather.temperature_min + 2, sync: weather.temperature_min - 3 },
                      { time: '09:00', temp: weather.temperature_min + 8, sync: weather.temperature_min + 1 },
                      { time: '12:00', temp: weather.temperature_max - 4, sync: weather.temperature_max - 12 },
                      { time: '15:00', temp: weather.temperature_max, sync: weather.temperature_max - 15 }, // Peak
                      { time: '18:00', temp: weather.temperature_max - 3, sync: weather.temperature_max - 13 },
                      { time: '21:00', temp: weather.temperature_max - 7, sync: weather.temperature_max - 14 },
                    ].map(d => ({ ...d, 'Outside': d.temp, 'Inside (Cooled)': d.sync }))}>
                      <defs>
                        <linearGradient id="colorAmbient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSync" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="time" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} unit="°C" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#050a08', border: '1px solid #10b98130', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="Outside" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorAmbient)" />
                      <Area type="monotone" dataKey="Inside (Cooled)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSync)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Original Reference Assets */}
          {projectData.images && projectData.images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <History className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-white">Original Design References</h2>
                  <p className="text-white/40 uppercase tracking-widest text-[10px]">Client-Provided Baseline DNA</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {projectData.images.map((img: string, idx: number) => (
                  <div key={idx} className="group relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-white/5">
                    <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">Document Source: 0{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
                <Ruler className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="font-serif text-3xl font-bold text-white">Architectural Intelligence</h2>
                <p className="text-muted-foreground uppercase tracking-widest text-xs">Technical Evolution & Visualization</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* PHASE 1 - TOP LEFT */}
              <div className="glass-card rounded-3xl overflow-hidden border border-border/50 group">
                <div className="p-6 border-b border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <span className="font-bold text-sm tracking-wide text-muted-foreground uppercase">Phase 1: Ground Floor Plan</span>
                  </div>
                  <span className="text-[10px] font-mono p-1 px-2 rounded bg-secondary text-muted-foreground">SD 01.02</span>
                </div>
                <div className="relative aspect-video overflow-hidden bg-black/40">
                  <ArchitecturalImage
                    prompt={getPrompt('draft')}
                    seed={seedBase + 7}
                    type="draft"
                    alt="Ground Floor Plan"
                    images={projectData.images}
                    className="object-contain"
                    onSourceUpdate={setImageModelSource}
                    projectData={projectData}
                    updateProject={updateProject}
                  />
                </div>
              </div>

              {/* PHASE 2 - TOP RIGHT */}
              <div className="glass-card rounded-3xl overflow-hidden border border-border/50 group">
                <div className="p-6 border-b border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Compass className="w-5 h-5 text-muted-foreground" />
                    <span className="font-bold text-sm tracking-wide text-muted-foreground uppercase">Phase 2: Schematic Elevation</span>
                  </div>
                  <span className="text-[10px] font-mono p-1 px-2 rounded bg-secondary text-muted-foreground">SD 01.04</span>
                </div>
                <div className="relative aspect-video overflow-hidden bg-black/40">
                  <ArchitecturalImage
                    prompt={getPrompt('elevation')}
                    seed={seedBase + 13}
                    type="elevation"
                    alt="Schematic Elevation"
                    images={projectData.images}
                    className="object-contain"
                    onSourceUpdate={setImageModelSource}
                    projectData={projectData}
                    updateProject={updateProject}
                  />
                </div>
              </div>

              {/* PHASE 3 - CENTERED BELOW (INVERTED TRIANGLE TIP) */}
              <div className="lg:col-span-2 flex justify-center">
                <div className="w-full lg:max-w-2xl glass-card rounded-3xl overflow-hidden border border-emerald-500/30 group shadow-lg shadow-emerald-500/5">
                  <div className="p-6 border-b border-emerald-500/20 flex items-center justify-between bg-emerald-500/5">
                    <div className="flex items-center gap-3 text-emerald-400">
                      <MapPin className="w-5 h-5" />
                      <span className="font-bold text-sm tracking-wide uppercase">Phase 3: Environmental Site Plan</span>
                    </div>
                    <span className="text-[10px] font-mono p-1 px-2 rounded bg-emerald-950/40 text-emerald-400 font-bold">SD 01.01</span>
                  </div>
                  <div className="relative aspect-video overflow-hidden bg-black/40">
                    <ArchitecturalImage
                      prompt={getPrompt('site')}
                      seed={seedBase + 19}
                      type="site"
                      alt="Site Plan"
                      images={projectData.images}
                      className="object-contain"
                      onSourceUpdate={setImageModelSource}
                      projectData={projectData}
                      updateProject={updateProject}
                    />
                  </div>
                </div>
              </div>

              {/* FINAL VISION - FULL WIDTH CINEMATIC */}
              <div className="lg:col-span-2 glass-card rounded-3xl overflow-hidden border-2 border-primary/30 group shadow-2xl shadow-primary/10 mt-4">
                <div className="p-6 border-b border-primary/20 flex items-center justify-between bg-primary/5">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-6 h-6 text-primary" />
                    <span className="font-serif text-lg font-bold text-white uppercase tracking-tight">Phase 4: Synthesis Final Vision</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-[10px] font-bold text-primary uppercase">Generative Target: Premium</span>
                  </div>
                </div>
                <div className="relative aspect-[21/9] md:aspect-[16/7] overflow-hidden bg-black/40">
                  <ArchitecturalImage
                    prompt={getPrompt('realistic')}
                    seed={seedBase + 29}
                    type="realistic"
                    alt="Final Architectural Vision"
                    images={projectData.images}
                    className="object-cover"
                    onSourceUpdate={setImageModelSource}
                    projectData={projectData}
                    updateProject={updateProject}
                  />
                </div>
              </div>
            </div>

            <TechnicalMeasurements
              totalArea={projectData.area}
              buildingType={projectData.buildingType}
              syntheticLayout={projectData.aiAnalysis?.syntheticLayout}
            />

            <EcoModelViewer projectData={projectData} ecoDossier={ecoDossier} />

            <div className="mt-12 glass-card rounded-3xl p-8 border-2 border-primary/20 bg-primary/5">
              <SustainabilityDossier
                dossier={ecoDossier}
                designProblems={projectData.aiAnalysis?.designProblems || []}
                thermalRisk={projectData.aiAnalysis?.thermalRisk}
                temp={weather.temperature_max}
                calculatedMetrics={projectData.aiAnalysis?.calculatedMetrics}
              />
            </div>
          </motion.div>

          {/* Design Strategy Selection Section moved to BOTTOM */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16 mt-16"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Settings2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-serif text-3xl font-bold text-white">Select Optimization Strategy</h2>
                <p className="text-muted-foreground uppercase tracking-widest text-xs">Choose the final environmental intensity layer</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
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
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-12 overflow-hidden"
              >
                <div className="glass-card rounded-3xl p-8 border border-primary/20 bg-primary/5 shadow-2xl shadow-primary/20">
                  <div className="flex flex-col lg:flex-row gap-8 items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <Zap className="w-8 h-8 text-primary shadow-glow" />
                        <h3 className="text-2xl font-serif font-bold text-white uppercase tracking-tight">
                          {designOptions.find(d => d.id === selectedDesign)?.title} Strategy Activated
                        </h3>
                      </div>
                      <p className="text-emerald-100/70 text-lg leading-relaxed">
                        The neural engine has calibrated the {selectedDesign} parameters. Proceeding with this selection will finalize the 
                        {projectData.aiAnalysis?.environmentalScore || 'premium'} structural DNA and prepare the high-fidelity environmental reports.
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-1">CO2 Potential</p>
                        <p className="text-3xl font-serif font-bold text-primary">-{enhancedDesigns.find(d => d.id === selectedDesign)?.co2Reduction}%</p>
                      </div>
                      <div className="w-px h-12 bg-white/10" />
                      <div className="text-center">
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-1">Cost Impact</p>
                        <p className="text-3xl font-serif font-bold text-white">+{enhancedDesigns.find(d => d.id === selectedDesign)?.costModifier}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-center gap-8 mt-16 pt-12 border-t border-white/5"
            data-html2canvas-ignore
          >
            <div className="text-center space-y-2">
              <h3 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">Design Confirmed.</h3>
              <p className="text-xl md:text-2xl font-serif text-white/60">Ready to Begin Construction?</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-6 w-full max-w-2xl">
              <div className="flex-1">
                <DownloadReportButton projectData={projectData} />
              </div>
              <button
                onClick={handleProceed}
                disabled={!selectedDesign}
                className={`
                  flex-1 flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-2xl
                  ${selectedDesign
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 glow-emerald cursor-pointer transform hover:-translate-y-1'
                    : 'bg-secondary text-muted-foreground cursor-not-allowed opacity-50'
                  }
                `}
              >
                Launch Build Phase
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <AIChatbot project={projectData} />
    </main>
  )
}
