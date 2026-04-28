'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface WeatherData {
  temperature_max: number
  temperature_min: number
  precipitation_sum: number
  humidity: number
  wind_speed: number
  wind_direction: number
  uv_index: number
}

interface ProjectData {
  id: string
  name: string
  location: string
  lat: number
  lng: number
  area: number
  buildingType: string
  budget: string
  energyGoal: string
  primaryMaterial: string
  description?: string
  weather?: WeatherData
  elevation?: number
  waterSiteData?: string
  images?: string[]
  analysisComplete: boolean
  selectedDesign?: 'standard' | 'improved' | 'nature-first'
  aiAnalysis?: any
}

interface ProjectContextType {
  project: ProjectData | null
  setProject: (project: ProjectData | null) => void
  updateProject: (updates: Partial<ProjectData>) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

// ── Demo Project 1: Al Qusais Villa (user's real project images) ──
export const DEMO_PROJECT_QUSAIS: ProjectData = {
  id: 'demo-qusais-villa',
  name: 'Qusais Villa',
  location: '42nd Street, Al Twar 4, Dubai, UAE',
  lat: 25.2697,
  lng: 55.3697,
  area: 280,
  buildingType: 'Residential Villa',
  budget: '$500k - $1M',
  energyGoal: 'Net Zero Energy',
  primaryMaterial: 'Sustainable Timber',
  description: 'A contemporary villa in Al Qusais featuring 4 bedrooms, an open-plan family living area, a covered carport, and lush private gardens — designed for passive cooling and thermal comfort in Dubai\'s harsh climate.',
  images: [
    '/qusais_floor_plan.jpg',
    '/qusais_villa_front.jpg',
    '/qusais_villa_3d.jpg',
  ],
  weather: {
    temperature_max: 43,
    temperature_min: 26,
    precipitation_sum: 62,
    humidity: 58,
    wind_speed: 11.2,
    wind_direction: 300,
    uv_index: 9,
  },
  analysisComplete: false,
  aiAnalysis: undefined
}

// ── Demo Project 2: Business Bay Cultural Center (sustainable public building) ──
export const DEMO_PROJECT_CULTURAL: ProjectData = {
  id: 'demo-bbay-center',
  name: 'BBay Cultural Center',
  location: 'Business Bay, Dubai, UAE',
  lat: 25.185,
  lng: 55.275,
  area: 1250,
  buildingType: 'Educational Campus',
  budget: '$5M+',
  energyGoal: 'LEED Gold',
  primaryMaterial: 'Low-Carbon Concrete',
  description: 'A net-zero public auditorium and digital library in Business Bay featuring parametric kinetic shading, greywater-fed vertical gardens, and an open-air public amphitheater integrated into the flood-resilient landscaping.',
  images: [
    '/bbay_cultural_concept.png',
    '/bbay_interior_3d.png',
    '/bbay_structural_drawings.png'
  ],
  weather: {
    temperature_max: 44,
    temperature_min: 25,
    precipitation_sum: 58,
    humidity: 52,
    wind_speed: 13.5,
    wind_direction: 290,
    uv_index: 10,
  },
  analysisComplete: false,
  aiAnalysis: undefined
}

// Backwards-compat alias
export const DEMO_PROJECT = DEMO_PROJECT_QUSAIS
export const DEMO_PROJECT_BARSHA = DEMO_PROJECT_CULTURAL // Keep for stability with existing code

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProjectState] = useState<ProjectData | null>(null)

  const setProject = (newProject: ProjectData | null) => {
    setProjectState(newProject)
  }

  const updateProject = (updates: Partial<ProjectData>) => {
    setProjectState(prev => prev ? { ...prev, ...updates } : null)
  }

  return (
    <ProjectContext.Provider value={{ project, setProject, updateProject }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
