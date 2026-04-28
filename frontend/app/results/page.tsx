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
  const [showLogs, setShowLogs] = useState(false)
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

      // DETERMINISTIC ASSET RESOLUTION: Use public folder directly for curated projects to bypass B64 overhead
      const isDubai = projectData?.name?.toLowerCase().includes("qusais") || projectData?.name?.toLowerCase().includes("twar");
      const isBBAY = projectData?.name?.toLowerCase().includes("bbay");
      const isEcoTech = projectData?.name?.toLowerCase().includes("eco") || projectData?.name?.toLowerCase().includes("tech");

      let finalUrl = result.url;
      if (isDubai || isBBAY || isEcoTech) {
        const curatedFolder = isBBAY ? "bbay" : isEcoTech ? "curated" : "qusais";
        const prefix = isEcoTech ? "eco_" : "";
        const idx = (type === 'draft' ? 1 : type === 'elevation' ? 2 : type === 'site' ? 3 : 4);
        // Cache busting version 6 - Plot-level Site Plan
        const v = 6;
        finalUrl = `/${curatedFolder}/${prefix}${idx}.png?v=${v}`;
      }

      if (finalUrl) {
        const source = result.source || "Neural Render"
        const isFallback = source.toLowerCase().includes("flux baseline") || source.toLowerCase().includes("pollinations") || source.toLowerCase().includes("recovery");
        const isCurated = !!(isDubai || isBBAY || isEcoTech) || source.toLowerCase().includes("curated") || source.toLowerCase().includes("archive");
        
        setIsRecovery(isFallback || isCurated);

        // Force a minimum loading time for curated assets to feel "retrieved" and cinematic
        const minDelay = isCurated ? 3000 : 800;
        const elapsed = Date.now() - fetchStartTime;
        const remainingDelay = Math.max(0, minDelay - elapsed);

        setTimeout(() => {
          setImgSrc(finalUrl)
          setLoaded(true) 
          if (isFallback) {
             const cleanPrompt = prompt.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
             const shortPrompt = cleanPrompt.length > 200 ? cleanPrompt.slice(0, 200) : cleanPrompt;
             
             // Plan B: Structural/Technical variation to differentiate from Plan A
             const planBPrompt = `Technical architectural section and structural detail of ${shortPrompt}, showing advanced eco-technology, solar integration, and high-performance materials. Precise drafting style, clean geometric volumes, minimal vegetation.`;
             const seedB = apiSeed + 777;
             setImgSrcB(`https://image.pollinations.ai/prompt/${encodeURIComponent(planBPrompt)}?width=1280&height=720&nologo=true&seed=${seedB}`);
          }

          if (result.executionLog && projectData?.aiAnalysis) {
             setLogs(result.executionLog)
             const existing = projectData.aiAnalysis.executionLog || []
             const newLogs = result.executionLog.filter((newLog: any) => 
                !existing.some((oldLog: any) => oldLog.model === newLog.model && oldLog.timestamp === newLog.timestamp)
             )
             if (newLogs.length > 0) {
               updateProject({
                 aiAnalysis: {
                   ...projectData.aiAnalysis,
                   executionLog: [...existing, ...newLogs]
                 }
               })
             }
          }
          if (onSourceUpdate) onSourceUpdate(isFallback ? "Terron Neural Baseline" : source)
        }, remainingDelay);
      } else {
        throw new Error("EMPTY_RENDER")
      }
    } catch (err) {
      console.warn(`Render attempt ${retryNum + 1} failed, retrying...`, err)
      if (retryNum < 1) { 
        setTimeout(() => fetchImage(retryNum + 1), 1000)
      } else {
        setIsRecovery(true)
        const cleanPrompt = prompt.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
        const shortPrompt = cleanPrompt.length > 200 ? cleanPrompt.slice(0, 200) : cleanPrompt;
        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(shortPrompt)}?width=1280&height=720&nologo=true&enhance=false&seed=${seed}`;
        const fallbackUrlB = `https://image.pollinations.ai/prompt/${encodeURIComponent(shortPrompt)}?width=1280&height=720&nologo=true&enhance=false&seed=${seed + 888}`;
        setImgSrc(fallbackUrl)
        setImgSrcB(fallbackUrlB)
        if (onSourceUpdate) onSourceUpdate("Terron Neural Baseline")
        setLoaded(true)
      }
    } finally {
      isFetchingRef.current = false
    }
  }, [prompt, seed, type, images, projectData?.visualSpecs, onSourceUpdate, projectData?.id, projectData?.name, loaded])

  useEffect(() => {
    if (!imgSrc && !loaded && attempt === 0) {
      // AUTHORITY OVERRIDE: Instant resolution for flagship projects (bypass backend overhead)
      const isCurated = projectData?.name?.toLowerCase().includes("qusais") || projectData?.name?.toLowerCase().includes("bbay") || projectData?.name?.toLowerCase().includes("eco");
      if (isCurated) {
        const isDubai = projectData?.name?.toLowerCase().includes("qusais") || projectData?.name?.toLowerCase().includes("twar");
        const isBBAY = projectData?.name?.toLowerCase().includes("bbay");
        const isEcoTech = projectData?.name?.toLowerCase().includes("eco") || projectData?.name?.toLowerCase().includes("tech");
        const curatedFolder = isBBAY ? "bbay" : isEcoTech ? "curated" : "qusais";
        const prefix = isEcoTech ? "eco_" : "";
        const idx = (type === 'draft' ? 1 : type === 'elevation' ? 2 : type === 'site' ? 3 : 4);
        const v = 6;
        
        const curatedUrl = `/${curatedFolder}/${prefix}${idx}.png?v=${v}`;
        setImgSrc(curatedUrl);
        setLoaded(true);
        if (onSourceUpdate) onSourceUpdate("Terron Curated Portfolio");
        return;
      }

      // IMMEDIATE GENERATION: Parallel start with minimal staggering for cinematic effect
      const staggerDelay = type === 'draft' ? 100 : type === 'elevation' ? 800 : type === 'site' ? 1500 : 2200;
      const t = setTimeout(() => fetchImage(0), staggerDelay);

      // SELF-HEALING: If stuck in "Initializing" for > 15s, force fallback
      const selfHeal = setTimeout(() => {
        if (!imgSrc && !loaded) {
          console.warn(`Force-healing stuck render for ${type}`);
          const cleanPrompt = prompt.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
          const shortPrompt = cleanPrompt.length > 200 ? cleanPrompt.slice(0, 200) : cleanPrompt;
          setImgSrc(`https://image.pollinations.ai/prompt/${encodeURIComponent(shortPrompt)}?width=1280&height=720&nologo=true&enhance=false&seed=${seed + 777}`);
          setLoaded(true);
        }
      }, 15000);

      return () => {
        clearTimeout(t);
        clearTimeout(selfHeal);
      };
    }
  }, [fetchImage, imgSrc, loaded, attempt, projectData?.name, type, onSourceUpdate])

  const activeSrc = currentPlan === 'a' ? imgSrc : (imgSrcB || imgSrc);

  return (
    <div className="relative w-full h-full bg-background/40 flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {!loaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/20 backdrop-blur-sm z-10"
          >
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
            <div className="text-xs font-mono text-emerald-400/70 tracking-widest uppercase text-center px-6">
              {(projectData?.name?.toLowerCase().includes("qusais") || projectData?.name?.toLowerCase().includes("bbay"))
                ? "Retrieving Curated Portfolio Assets..." 
                : logs.length > 0 ? `Processing: ${logs[logs.length-1].model}` : "Initializing Intelligence Pipeline..."}
            </div>
            {logs.length > 0 && (
              <div className="mt-4 max-w-[80%] space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className="text-[10px] font-mono flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'success' ? 'bg-emerald-400' : log.status === 'failed' ? 'bg-rose-400' : 'bg-amber-400 animate-pulse'}`} />
                    <span className="text-emerald-300/80">{log.model}:</span>
                    <span className={log.status === 'failed' ? 'text-rose-300' : 'text-emerald-100'}>{log.step}</span>
                    {log.error && <span className="text-rose-400/60 truncate max-w-[100px] text-[8px]">({log.error})</span>}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {projectData?.aiAnalysis?.syntheticLayoutSpecs && loaded && (
         <div className="absolute top-0 inset-x-0 p-3 bg-black/60 backdrop-blur-md z-40 border-b border-emerald-400/10 opacity-0 hover:opacity-100 transition-opacity">
            <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-2">
              <Cpu className="w-3 h-3" /> Neural Layout Logic
            </div>
            <div className="text-[10px] text-white/80 font-mono leading-tight">{projectData.aiAnalysis.syntheticLayoutSpecs}</div>
         </div>
      )}

      {activeSrc && (
        <div className="group relative w-full h-full">
          <img
            src={activeSrc}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={(e) => {
               if (errorCount >= 4) return; // Absolute hard stop
               
               if (errorCount === 2) {
                 setErrorCount(3);
                 console.error(`Critical Render Failure: Neural fallbacks exhausted for ${type}. Switching to Master Asset.`);
                 const idx = (type === 'draft' ? 1 : type === 'elevation' ? 2 : type === 'site' ? 3 : 4);
                 setImgSrc(`/curated/eco_${idx}.png?v=6`); 
                 setLoaded(true);
                 return;
               }

               if (errorCount === 3) {
                 setErrorCount(4);
                 console.error("Fatal Render Failure: All assets inaccessible. Using system placeholder.");
                 setImgSrc('/placeholder.jpg'); 
                 setLoaded(true);
                 return;
               }
               
               console.warn(`Image Load Failed (Attempt ${errorCount + 1}), switching to recovery stream`);
               setErrorCount(prev => prev + 1);
               
               const cleanPrompt = prompt.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
               const shortPrompt = cleanPrompt.length > 200 ? cleanPrompt.slice(0, 200) : cleanPrompt;
               const recoveryUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(shortPrompt)}?width=1280&height=720&nologo=true&enhance=false&seed=${seed + 999 + errorCount}`;
               setImgSrc(recoveryUrl);
               setLoaded(true); 
            }}
            className={`w-full h-full transition-all duration-700 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} ${className}`}
            onLoad={() => setLoaded(true)}
          />

          {/* Plan A/B Toggles for Recovery Mode */}
          {errorCount > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-2 z-30 animate-pulse">
              <div className="px-2 py-1 rounded bg-rose-500/80 text-[8px] font-bold text-white uppercase tracking-widest border border-white/20 shadow-lg">
                Recovery Stream Active
              </div>
            </div>
          )}
          {isRecovery && imgSrcB && (
            <div className="absolute top-2 left-2 flex gap-1 z-30">
              <button 
                onClick={() => setCurrentPlan('a')}
                className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-wider transition-all border ${currentPlan === 'a' ? 'bg-emerald-400 text-black border-emerald-400' : 'bg-black/60 text-emerald-400/50 border-emerald-400/20 hover:bg-black/80'}`}
              >
                Plan A
              </button>
              <button 
                onClick={() => setCurrentPlan('b')}
                className={`px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-wider transition-all border ${currentPlan === 'b' ? 'bg-emerald-400 text-black border-emerald-400' : 'bg-black/60 text-emerald-400/50 border-emerald-400/20 hover:bg-black/80'}`}
              >
                Plan B
              </button>
            </div>
          )}

          {/* Diagnostic & Regeneration Overlay */}
          <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => fetchImage(0, true)}
              disabled={!loaded}
              className="p-1.5 bg-black/60 backdrop-blur-md rounded-full text-emerald-400 border border-emerald-400/30 hover:bg-emerald-400/20 transition-colors disabled:opacity-50"
              title="Regenerate"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${!loaded && 'animate-spin'}`} />
            </button>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="p-1.5 bg-black/60 backdrop-blur-md rounded-full text-emerald-400 border border-emerald-400/30 hover:bg-emerald-400/20 transition-colors"
              title="Diagnostics"
            >
              <Box className="w-3.5 h-3.5" />
            </button>
          </div>

          {showLogs && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl p-4 z-20 flex flex-col justify-center border border-emerald-400/20"
            >
              <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2 border-b border-emerald-400/10 pb-2">
                <Box className="w-3 h-3" /> System Diagnostics
              </h4>
              <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                {logs.map((log, i) => (
                  <div key={i} className="text-[10px] font-mono border-l-2 border-emerald-500/20 pl-2 py-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-emerald-400 font-bold uppercase">{log.model}</span>
                      <span className={`px-1.5 rounded-sm text-[8px] font-bold ${log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-emerald-100/90 leading-tight">{log.step}</div>
                    {log.output && <div className="text-emerald-400/80 mt-1 italic text-[9px] break-words border-t border-emerald-400/10 pt-1">RESULT: {log.output}</div>}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowLogs(false)}
                className="mt-4 px-4 py-2 border border-emerald-400/30 text-emerald-400 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400/10 transition-colors"
              >
                Close Trace
              </button>
            </motion.div>
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
  const [imageModelSource, setImageModelSource] = useState('Google Imagen 3')

  // Use demo data if no project
  const projectData = project || DEMO_PROJECT
  const weather = projectData.weather || DEMO_PROJECT.weather!
  const hasTraceLogs = (projectData.aiAnalysis?.executionLog?.length || 0) > 0
  const isAnalysisPending = !projectData.aiAnalysis || (projectData.aiAnalysis.executionLog?.length < 3 && !projectData.aiAnalysis.designCritique);
  const hasAnalysisError = Boolean(projectData.aiAnalysis?.error)
  const critiqueText = projectData.aiAnalysis?.designCritique
    || projectData.aiAnalysis?.originalDesignFeedback
    || (isAnalysisPending 
      ? "Synthesizing multimodal architectural data... Please wait for the neural core to finalize its critique." 
      : hasAnalysisError 
        ? (projectData.aiAnalysis?.error || 'Analysis failed. Re-run analysis to generate critique output.')
        : 'Analysis output not available yet. Run project analysis to populate critique details.')

  // Calculate recommendation based on weather and AI analysis
  const getRecommendation = () => {
    if (projectData.aiAnalysis?.keyRecommendations?.length > 0) {
      return projectData.aiAnalysis.keyRecommendations[0]
    }
    if (weather.temperature_max > 35) {
      return 'passive cooling systems and thermal mass design'
    }
    if (weather.precipitation_sum > 500) {
      return 'rainwater harvesting and permeable surfaces'
    }
    return 'natural ventilation and solar orientation'
  }

  // Update design options based on AI scores
  const getAiEnhancedDesigns = () => {
    if (!projectData.aiAnalysis) return designOptions

    return designOptions.map(design => {
      if (design.id === 'nature-first') {
        const metrics = projectData.aiAnalysis.calculatedMetrics;
        // The costModifier mathematically breaks if we try to extract ints from range strings like "Medium ($1M - $5M)" -> 15.
        // We will default to the standard premium integration cost or dynamic AI estimation without string math.
        let costMod = design.costModifier; 

        return {
          ...design,
          bioScore: projectData.aiAnalysis.environmentalScore || design.bioScore,
          co2Reduction: projectData.aiAnalysis.co2ReductionEstimate 
            ? `-${parseInt(String(projectData.aiAnalysis.co2ReductionEstimate).replace(/[^0-9]/g, ''))}%` 
            : design.co2Reduction,
          description: projectData.aiAnalysis.biodiversityImpact || design.description,
          costModifier: costMod,
          metrics: {
            ...design.metrics,
            carbon: metrics?.carbonImpact || design.metrics.carbon,
            water: metrics?.thermalEfficiency || design.metrics.water, // approximation
          }
        }
      }
      return design
    })
  }

  const enhancedDesigns = getAiEnhancedDesigns()

  const handleSelectDesign = (designId: string) => {
    setSelectedDesign(designId)
    updateProject({ selectedDesign: designId as 'standard' | 'improved' | 'nature-first' })
  }

  const handleProceed = () => {
    if (selectedDesign) {
      router.push('/outcome')
    }
  }

  // Architectural Phase Prompts — strict professional specifications per phase
  const getPrompt = (type: 'realistic' | 'draft' | 'elevation' | 'site') => {
    const buildingType = projectData.buildingType || 'Residential Villa'
    const desc = projectData.description ? `(${projectData.description})` : ''
    const specificFeatures = projectData.aiAnalysis?.keyRecommendations?.join(', ') || 'modern biophilic architecture, sustainable materials'
    const isResidential = buildingType.toLowerCase().includes('villa') || buildingType.toLowerCase().includes('residential') || buildingType.toLowerCase().includes('house');
    
    // ECO-TECH REFINEMENT: Professional, structural, not "too planty" or "AI-fake"
    const baseStyle = "Professional architectural photography, high-end construction visualization, precise geometric volumes, clean lines, advanced sustainable technology integration. Integrated solar glass, recycled steel and high-performance concrete. Realistic natural lighting, overcast soft shadows, 8k resolution, sharp structural details, no generic AI artifacts.";

    // Core geometric DNA to ensure consistency across all 4 images
    const structuralControl = `STRICT GEOMETRIC CONSISTENCY: The building must maintain a consistent ${projectData.area}m² footprint, specific massing shape, and volumetric dimensions across every view.`;

    const structuralLock = isResidential 
      ? `(Architectural Style Locked: Precision Eco-Tech villa, clean geometric volumes, integrated solar glass, high-performance concrete and steel, minimalist structure. ${structuralControl}).`
      : `(Architectural Style Locked: Monumental sustainable pavilions, sweeping high-tech arches, integrated smart-facade technology, floating geometric masses. ${structuralControl}).`;

    switch (type) {
      case 'draft':
        return `Strict 2D architectural ground floor plan drawing. Simple black straight lines on a white background. No 3D, no depth, no shading, no vegetation. CAD technical drafting style with room labels and door swing icons. Professional blueprint aesthetic. ${structuralLock}`;

      case 'elevation':
        return `Strict 2D architectural elevation, front-view orthographic projection. Simple black and white linework, no 3D perspective, no shading. Professional technical drawing showing facade proportions and window placements. Clean drafting. ${structuralLock}`;

      case 'site':
        return `Technical 2D architectural site plan, top-down view. Showing building footprint, property lines, and drainage symbols on a flat plot. Minimalist professional site planning aesthetic, no 3D depth, no large trees. ${structuralLock}`;

      case 'realistic':
        return `Final architectural vision of a high-end ${buildingType} ${desc}. Cinematic perspective, showing integrated Eco-Tech systems, sustainable luxury materials, large clear geometric glass volumes, metallic solar accents. High-fidelity construction quality, professional architectural photography. ${baseStyle}. ${structuralLock} ${specificFeatures}`;
    }
  }

  // A unique project seed hash for consistent generation per project
  const seedBase = projectData.name.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)

  const ecoDossier = projectData.aiAnalysis?.ecoDossier || [
    {
      trick: 'Passive Thermal Mass',
      location: 'Foundation slab & external walls',
      why: `With a max temperature of ${weather.temperature_max}°C and a UV index of ${weather.uv_index}, uninsulated walls will radiate heat into living spaces through the night, increasing cooling loads significantly.`,
      how: 'Increase wall thickness to 250mm using rammed earth or high-mass concrete blocks. Coat exterior in light lime plaster to reflect solar radiation.',
      benefit: '~3–4°C reduction in indoor peak temperature, reducing HVAC runtime by approx 20–30%.',
      urgency: 'Critical' as const
    },
    {
      trick: 'Solar Shading System',
      location: 'South & West-facing facades and windows',
      why: `At UV index ${weather.uv_index} and ${weather.temperature_max}°C peak, west-facing glass will experience intense solar gain in the afternoon, the worst possible time for cooling efficiency.`,
      how: 'Install fixed horizontal louvres at 35° pitch on south glazing; motorized vertical fins on west elevation responding to sun altitude sensor.',
      benefit: 'Reduces peak solar heat gain through glazing by ~60%, saving an estimated 1,800 kWh/yr in cooling.',
      urgency: 'High' as const
    },
    {
      trick: 'Greywater Recycling Loop',
      location: 'Utility/laundry area connecting to landscaping',
      why: `Annual rainfall of ${weather.precipitation_sum}mm is insufficient to sustain natural irrigation. Without recycling, potable water will be wasted on landscaping year-round.`,
      how: 'Install a compact greywater treatment unit (50L/hr capacity) under the utility sink. Run treated water to a subsurface drip irrigation network in the planting beds.',
      benefit: 'Saves ~55,000L of potable water per year for a household of 4. Reduces municipal water bill by ~35%.',
      urgency: 'High' as const
    },
    {
      trick: 'Natural Cross-Ventilation Channels',
      location: 'Ground floor open-plan to roof vents above',
      why: `Wind speed is ${weather.wind_speed} km/h from ${weather.wind_direction}°. Strategic openings aligned with this direction will enable passive stack ventilation, eliminating dependence on mechanical cooling for 6+ months of the year.`,
      how: 'Position inlet louvres on the windward facade at 0.8m height; install solar-powered roof turbines on the leeward parapet to extract hot air by convection.',
      benefit: 'Achieves thermal neutrality in shoulder seasons without mechanical cooling; reduces annual energy use by ~15%.',
      urgency: 'Medium' as const
    },
  ]

  return (
    <main className="min-h-screen bg-[#050a08]">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 py-12 pt-24">
        <div id="report-content">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl p-8 mb-8 border border-emerald-500/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Activity className="w-64 h-64 text-emerald-400" />
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
                    Analysis Sequence 01
                  </span>
                  <span className="text-white/30 text-xs font-mono">
                    ID: {projectData.id || 'NVR-882'}
                  </span>
                </div>
                <h1 className="font-serif text-5xl font-bold mb-4 text-white">
                  {projectData.name}
                </h1>
                <p className="text-xl text-emerald-100/60 font-medium mb-8 max-w-2xl">
                  {projectData.description}
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 group hover:border-primary/30 transition-colors">
                    <Thermometer className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">Peak Climate</p>
                      <p className="text-white font-mono font-bold">{weather.temperature_max}°C</p>
                    </div>
                  </div>
                  <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 group hover:border-chart-3/30 transition-colors">
                    <Droplets className="w-5 h-5 text-chart-3 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">Hydrology</p>
                      <p className="text-white font-mono font-bold">{weather.precipitation_sum}mm</p>
                    </div>
                  </div>
                  <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 group hover:border-emerald-400/30 transition-colors">
                    <Sparkles className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">Eco Potential</p>
                      <p className="text-white font-mono font-bold">ALPHA-7</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-80 space-y-4">
                <div className="glass-card p-6 rounded-2xl border-white/10 border bg-white/5 relative group hover:border-primary/20 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Environmental</p>
                      <p className="text-3xl font-serif font-bold text-white tracking-tighter">Bio-Rating</p>
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform">
                      <span className="text-3xl font-serif font-bold text-primary">{projectData.aiAnalysis?.environmentalScore || 'A+'}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '94%' }}
                        className="h-full bg-primary"
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-white/40">
                      <span>STABILITY INDEX</span>
                      <span className="text-primary font-bold">94.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {critiqueText && (
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/3">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Brain className="w-4 h-4" /> Neural Design Critique
                    </h3>
                    <p className="text-2xl font-serif text-white/90 leading-tight">
                      Synthesizing environmental data with structural massing constraints.
                    </p>
                  </div>
                  <div className="lg:w-2/3">
                    <div className="glass-card p-6 rounded-2xl border-emerald-500/20 border bg-emerald-500/5 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-400/5 to-transparent h-20 -translate-y-full group-hover:translate-y-[200%] transition-transform duration-[3s] pointer-events-none" />
                      {isAnalysisPending ? (
                        <div className="space-y-3">
                          <div className="h-4 w-full bg-emerald-400/10 rounded animate-pulse" />
                          <div className="h-4 w-5/6 bg-emerald-400/10 rounded animate-pulse" />
                          <div className="h-4 w-4/6 bg-emerald-400/10 rounded animate-pulse" />
                        </div>
                      ) : (
                        <p className="text-sm text-emerald-50/90 leading-relaxed font-medium relative z-10">
                          {critiqueText}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3" />
                        Analysis Optimized
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-[10px] font-bold uppercase tracking-widest text-blue-400">
                        <ImageIcon className="w-3 h-3" />
                        Rendering: {imageModelSource}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* New Section: Environmental Intelligence Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Sun className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="font-serif text-3xl font-bold text-white">Climate Intelligence Dashboard</h2>
                <p className="text-muted-foreground uppercase tracking-widest text-xs">Live API Feed: Open-Meteo & Regional Hydrology</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Detailed Metrics Grid */}
              <div className="lg:col-span-1 grid grid-cols-2 gap-4">
                <div className="glass-card p-5 rounded-2xl border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400">
                    <Thermometer className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Thermal Peak</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">{weather.temperature_max}°C</div>
                  <div className="text-[10px] text-white/40 leading-tight">Low: {weather.temperature_min}°C</div>
                </div>
                
                <div className="glass-card p-5 rounded-2xl border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-sky-400">
                    <Droplets className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Humidity</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">{weather.humidity}%</div>
                  <div className="text-[10px] text-white/40 leading-tight">Saturation Index: High</div>
                </div>

                <div className="glass-card p-5 rounded-2xl border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Sun className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">UV Intensity</span>
                  </div>
                  <div className="text-3xl font-mono font-bold text-white">{weather.uv_index}</div>
                  <div className="text-[10px] text-white/40 leading-tight">Scale: {weather.uv_index > 7 ? 'Extreme' : 'Moderate'}</div>
                </div>

                <div className="glass-card p-5 rounded-2xl border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Wind className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Avg Wind</span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">{weather.wind_speed} km/h</div>
                  <div className="text-[10px] text-white/40 leading-tight">Dir: {weather.wind_direction}°</div>
                </div>

                <div className="glass-card p-5 rounded-2xl border-white/5 col-span-2 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Droplets className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest leading-none mb-1">Regional Hydrology</p>
                      <p className="text-xs font-medium text-white italic">{projectData.waterSiteData || 'Syncing Local Aquifers...'}</p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-white/5 flex flex-wrap gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-white/30" />
                      <span className="text-[10px] text-white/60 font-mono">{projectData.lat.toFixed(4)}°N, {projectData.lng.toFixed(4)}°E</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-white/30" />
                      <span className="text-[10px] text-white/60 font-mono">Elev: {projectData.elevation || 12}m ASL</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AreaChart (Diurnal Temp Curve) - Easier to understand than Radar */}
              <div className="lg:col-span-2 glass-card rounded-3xl p-8 border-white/10 flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white">Atmospheric Thermal Analysis</h3>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">24-Hour Projected Resilience Cycle</p>
                  </div>
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
