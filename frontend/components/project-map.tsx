'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface ProjectMapProps {
  coordinates: { lat: number; lng: number } | null
}

// Custom emerald marker icon
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #2d7a4f, #1a5c3a);
        border: 3px solid #c8952a;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(45, 122, 79, 0.4);
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: #c8952a;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  })
}

// Custom dark emerald tile layer
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

export function ProjectMap({ coordinates }: ProjectMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    
    // Initialize map if not already done
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([25.2048, 55.2708], 10) // Default to Dubai
      
      // Add custom styled tile layer
      L.tileLayer(TILE_URL, {
        maxZoom: 19,
      }).addTo(mapRef.current)
      
      // Add zoom control to bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current)
      
      // Add custom CSS for emerald tint
      const style = document.createElement('style')
      style.textContent = `
        .leaflet-tile-pane {
          filter: sepia(20%) hue-rotate(70deg) saturate(80%);
        }
        .leaflet-control-zoom a {
          background: rgba(13, 43, 26, 0.8) !important;
          color: #e8f0ea !important;
          border-color: rgba(45, 122, 79, 0.3) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(45, 122, 79, 0.8) !important;
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
      `
      document.head.appendChild(style)
    }
    
    return () => {
      // Cleanup on unmount
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    
    if (coordinates) {
      // Smooth fly to new coordinates
      mapRef.current.flyTo([coordinates.lat, coordinates.lng], 14, {
        duration: 1.5,
        easeLinearity: 0.25,
      })
      
      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setLatLng([coordinates.lat, coordinates.lng])
      } else {
        markerRef.current = L.marker([coordinates.lat, coordinates.lng], {
          icon: createCustomIcon(),
        }).addTo(mapRef.current)
        
        // Add popup
        markerRef.current.bindPopup(`
          <div style="
            background: rgba(13, 43, 26, 0.95);
            color: #e8f0ea;
            padding: 12px 16px;
            border-radius: 12px;
            font-family: 'DM Sans', sans-serif;
            border: 1px solid rgba(45, 122, 79, 0.3);
            backdrop-filter: blur(8px);
          ">
            <div style="font-weight: 600; margin-bottom: 4px;">Project Location</div>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d7a4f;">
              ${coordinates.lat.toFixed(4)}°N, ${coordinates.lng.toFixed(4)}°E
            </div>
          </div>
        `, {
          className: 'custom-popup',
          closeButton: false,
        }).openPopup()
      }
    }
  }, [coordinates])

  return (
    <div 
      ref={containerRef}
      className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden"
      style={{ background: '#0d2b1a' }}
    />
  )
}
