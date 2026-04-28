'use client'

import { motion } from 'framer-motion'
import { ThermometerSun, Activity, ShieldAlert } from 'lucide-react'

interface ThermalVisualizerProps {
  temp: number
  efficiency: number
}

export function ThermalVisualizer({ temp, efficiency }: ThermalVisualizerProps) {
  return (
    <div className="flex flex-col md:flex-row gap-8 items-center bg-black/40 p-8 rounded-3xl border border-orange-500/20 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      {/* Visual Scan Area */}
      <div className="w-full md:w-1/2 aspect-video rounded-2xl border border-white/10 bg-[#0a0a0f] relative flex items-center justify-center overflow-hidden group shadow-2xl">
        {/* Heat Map Background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-purple-600/10 to-red-600/20 opacity-60" />
        
        {/* House Silhouette */}
        <div className="relative w-48 h-40 bg-white/5 border-2 border-white/20 rounded-t-xl overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.05)]">
          {/* Thermal Zones */}
          <motion.div 
             animate={{ 
               backgroundColor: ['rgba(59, 130, 246, 0.2)', 'rgba(239, 68, 68, 0.2)', 'rgba(59, 130, 246, 0.2)']
             }}
             transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
             className="absolute bottom-0 left-0 right-0 h-1/2" 
          />
          <motion.div 
             animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1]
             }}
             transition={{ duration: 4, repeat: Infinity }}
             className="absolute top-4 left-4 w-16 h-16 rounded-full bg-orange-500/30 blur-2xl" 
          />
          
          {/* Wireframe lines */}
          <div className="absolute inset-0 border-b border-white/10 mt-10" />
          <div className="absolute inset-0 border-r border-white/10 ml-24" />
        </div>

        {/* Scan Animation */}
        <motion.div 
          animate={{ top: ['-10%', '110%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-0.5 bg-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.8)] z-20"
        />

        {/* Dynamic Sensor Tags */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
           <div className="flex items-center gap-2 px-2 py-1 rounded bg-black/60 border border-white/10 backdrop-blur-md">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-mono text-white/80">NODE_01: {temp}°C</span>
           </div>
           <div className="flex items-center gap-2 px-2 py-1 rounded bg-black/60 border border-white/10 backdrop-blur-md">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[10px] font-mono text-white/80">NODE_02: 22.4°C</span>
           </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 items-end">
           <div className="flex items-center gap-2">
              <span className="text-[8px] font-bold text-white/40 uppercase">Heat Source</span>
              <div className="w-8 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full" />
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[8px] font-bold text-white/40 uppercase">Heat Sink</span>
              <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full" />
           </div>
        </div>
      </div>

      {/* Analysis Content */}
      <div className="flex-1 space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ThermometerSun className="w-6 h-6 text-orange-500" />
            <h4 className="font-serif text-xl font-bold text-white uppercase tracking-wider">Thermal Digital Twin</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Volumetric infrared mapping complete. The proposed building massing effectively creates a <span className="text-white font-bold">Stable Microclimate</span>. 
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-orange-500/40 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-orange-400" />
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Efficiency</span>
            </div>
            <div className="text-2xl font-mono text-white">{efficiency}%</div>
            <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${efficiency}%` }}
                 transition={{ duration: 1.5, delay: 0.5 }}
                 className="h-full bg-orange-500"
               />
            </div>
          </div>
          
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-blue-500/40 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Flux Rate</span>
            </div>
            <div className="text-2xl font-mono text-white">-0.4%</div>
            <div className="text-[9px] text-blue-400/70 font-bold uppercase mt-2">Critical Minimum Loss</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
           <h5 className="text-[10px] font-bold text-primary uppercase mb-1 tracking-widest">AI Strategy</h5>
           <p className="text-xs italic text-muted-foreground">&quot;Utilizing high-albedo roof surfaces and staggered cross-ventilation nodes to mitigate 84% of peak thermal absorption.&quot;</p>
        </div>
      </div>
    </div>
  )
}
