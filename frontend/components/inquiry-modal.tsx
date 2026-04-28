'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, CheckCircle2, Package, MapPin } from 'lucide-react'
import { useState } from 'react'

interface InquiryModalProps {
  isOpen: boolean
  onClose: () => void
  resource: {
    name: string
    price: number
    unit: string
    available: number
  } | null
}

export function InquiryModal({ isOpen, onClose, resource }: InquiryModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      onClose()
    }, 3000)
  }

  if (!resource) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg glass-card rounded-3xl overflow-hidden shimmer-border"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              {!isSubmitted ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold">Material Inquiry</h3>
                      <p className="text-sm text-muted-foreground uppercase tracking-widest">{resource.name}</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Quote</p>
                        <p className="text-xl font-bold text-accent">${resource.price} <span className="text-xs font-normal text-muted-foreground">{resource.unit}</span></p>
                      </div>
                      <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Availability</p>
                        <p className="text-xl font-bold text-white">{resource.available}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quantity Required</label>
                        <input 
                          type="number" 
                          required
                          placeholder="Enter amount..."
                          className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Project Timeline</label>
                        <select className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer">
                          <option>Immediate (within 30 days)</option>
                          <option>Q3 2026</option>
                          <option>Q4 2026</option>
                          <option>Flexible</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all glow-emerald"
                    >
                      <Send className="w-5 h-5" />
                      Send Formal Inquiry
                    </button>
                    <p className="text-[10px] text-center text-muted-foreground">
                      By clicking send, you agree to connect with our verified sustainable material suppliers.
                    </p>
                  </form>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-serif text-3xl font-bold mb-4">Inquiry Sent!</h3>
                  <p className="text-muted-foreground mb-8">
                    Your request for <span className="text-white font-medium">{resource.name}</span> has been forwarded to the supplier. They will contact you within 24 hours.
                  </p>
                  <div className="h-1 w-full bg-secondary rounded-full overflow-hidden max-w-[200px] mx-auto">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2.5 }}
                      className="h-full bg-primary"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
