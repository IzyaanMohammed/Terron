'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { createTripoTask, getTripoTask } from '@/lib/api';

export default function EcoModelViewer({ projectData, ecoDossier }: { projectData: any, ecoDossier: any }) {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingStatus, setPollingStatus] = useState<string>('');
  const [logs, setLogs] = useState<any[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [smartPrompt, setSmartPrompt] = useState<string>('');
  const [selectedPart, setSelectedPart] = useState<number>(0); 
  
  const generateModel = async () => {
    try {
      setLoading(true);
      setError(null);
      setPollingStatus('Initializing AI Physics Engine...');
      setLogs([]);
      setSelectedPart(0);

      // 1. Kick off task - letting backend reason the prompt
      const data = await createTripoTask(undefined, projectData, ecoDossier);
      const taskId = data.taskId;
      const finalPrompt = data.prompt?.tripo_prompt || data.prompt;
      const partDescriptions = data.prompt?.descriptions || ["Component 1", "Component 2", "Component 3"];
      
      if (data.executionLog) setLogs(data.executionLog);
      setSmartPrompt(finalPrompt);
      setDescriptions(partDescriptions);

      // 2. Poll status
      setPollingStatus('Generating architectural geometry (this takes ~15s)...');
      
      const poll = async (retryCount = 0) => {
        try {
          const data = await getTripoTask(taskId);

          if (data.data?.status === 'success') {
            const rawUrl = data.data.result?.pbr_model?.url || data.data.output?.pbr_model || data.data.result?.model?.url || data.data.output?.model;
            if (rawUrl && typeof rawUrl === 'string') {
              setModelUrl(`/api/proxy-model?url=${encodeURIComponent(rawUrl)}`);
              setLoading(false);
            } else {
              setError(`Model URL missing. Payload: ${JSON.stringify(data.data)}`);
              setLoading(false);
            }
          } else if (data.data?.status === 'failed' || data.data?.status === 'error') {
            setError('Generation failed via Tripo API: ' + JSON.stringify(data.data));
            setLoading(false);
          } else {
            setPollingStatus(`[${data.data?.status?.toUpperCase() || 'UNKNOWN'}] Processing... ${data.data?.progress || 0}%`);
            setTimeout(() => poll(0), 3000);
          }
        } catch (err: any) {
          if (retryCount < 5) {
            setPollingStatus(`Network sync delayed... retrying (${retryCount + 1}/5)`);
            setTimeout(() => poll(retryCount + 1), 3000);
          } else {
            setError(err.message || 'Server Polling Crash after retries');
            setLoading(false);
          }
        }
      };

      poll(0);

    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  const getCameraTarget = () => {
    if (selectedPart === 1) return "0m 1m 0m";
    if (selectedPart === 2) return "8m 1m 0m";
    if (selectedPart === 3) return "16m 1m 0m";
    return "8m 1m 0m"; // Default View Center
  };

  const getCameraOrbit = () => {
    if (selectedPart === 0) return "45deg 75deg 20m";
    return "45deg 75deg 8m"; // Closer for parts
  };

  useEffect(() => {
    // Inject google model-viewer script if not present
    if (typeof window !== 'undefined' && !document.getElementById('model-viewer-script')) {
      const script = document.createElement('script');
      script.id = 'model-viewer-script';
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full mt-12 mb-8 glass rounded-3xl p-8 border border-white/10 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 z-10 relative">
        <div className="max-w-2xl">
          <h3 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
            <Box className="w-6 h-6 text-primary" />
            Interactive 3D Architectural Kit
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            A modular biophilic structural kit generated for {projectData.name}. Inspect each technical component individually.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
          {!modelUrl ? (
            <button
              onClick={generateModel}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Analyzing Geometry...' : 'Generate 3D Components'}
            </button>
          ) : (
            <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
               {[0, 1, 2, 3].map((num) => (
                 <button
                   key={num}
                   onClick={() => setSelectedPart(num)}
                   className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${selectedPart === num ? 'bg-primary text-primary-foreground' : 'text-white/40 hover:text-white/70'}`}
                 >
                   {num === 0 ? 'Full Set' : `Part ${num}`}
                 </button>
               ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full h-[400px] md:h-[500px] rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center relative overflow-hidden">
        {loading && (
          <div className="flex flex-col items-center gap-4 text-center">
             <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
             <p className="text-primary font-mono text-sm tracking-widest uppercase">{pollingStatus}</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-2 text-red-400">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm font-bold">{error}</p>
            <button onClick={() => { setError(null); generateModel(); }} className="mt-2 text-xs underline text-white/50 hover:text-white transition-colors">Retry Generation</button>
          </div>
        )}

        {!loading && !error && !modelUrl && (
          <div className="flex flex-col items-center gap-4 opacity-50">
            <Box className="w-16 h-16 text-white" />
            <p className="text-sm font-mono text-white tracking-widest">3D ENGINE IDLE</p>
          </div>
        )}

        {/* Diagnostic Overlay */}
        {(loading || (logs?.length > 0 && !modelUrl)) && (
          <div className="absolute top-4 left-4 right-4 z-20 space-y-2 pointer-events-none">
            {logs.map((log, i) => (
               <motion.div 
                 initial={{ opacity: 0, x: -20 }} 
                 animate={{ opacity: 1, x: 0 }}
                 key={i} 
                 className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 backdrop-blur-md w-fit"
               >
                 <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'success' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                 <span className="text-[9px] font-mono text-emerald-400/80 uppercase">{log.model}:</span>
                 <span className="text-[9px] font-mono text-white/90">{log.step}</span>
               </motion.div>
            ))}
          </div>
        )}

        {modelUrl && (
          <div className="absolute inset-0 w-full h-full">
            <div dangerouslySetInnerHTML={{ __html: `
              <model-viewer
                src="${modelUrl}"
                auto-rotate
                camera-controls
                camera-target="${getCameraTarget()}"
                camera-orbit="${getCameraOrbit()}"
                shadow-intensity="1"
                environment-image="neutral"
                exposure="1"
                min-camera-orbit="auto auto 2m"
                max-camera-orbit="auto auto 50m"
                style="width: 100%; height: 100%; background-color: transparent;"
              ></model-viewer>
            `}} className="w-full h-full" />
            
            {/* Interaction Instructions Overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none">
              <div className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-2 text-[10px] text-white/70 font-mono uppercase tracking-tighter">
                <span className="text-primary font-bold">DRAG</span> to Rotate
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-2 text-[10px] text-white/70 font-mono uppercase tracking-tighter">
                <span className="text-primary font-bold">SCROLL</span> to Zoom
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-2 text-[10px] text-white/70 font-mono uppercase tracking-tighter">
                <span className="text-primary font-bold">R-CLICK</span> to Pan
              </div>
            </div>

            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-2 shadow-2xl">
               <div className={`w-2 h-2 rounded-full ${selectedPart === 0 ? 'bg-green-500' : 'bg-primary'} animate-pulse`} />
               <span className="text-[10px] text-white font-mono tracking-widest uppercase">
                 {selectedPart === 0 ? 'Full Set Loaded' : `Inspecting Component ${selectedPart}`}
               </span>
            </div>
          </div>
        )}
      </div>

      {modelUrl && descriptions && descriptions.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <h4 className="text-primary font-bold text-xs uppercase tracking-widest mb-1">
            {selectedPart === 0 ? "Kit Overview" : `Component ${selectedPart}: Specification`}
          </h4>
          <p className="text-white/80 text-sm leading-relaxed">
            {selectedPart === 0 ? descriptions[0] : (descriptions[selectedPart - 1] || descriptions[0])}
          </p>
        </motion.div>
      )}
    </div>
  );
}
