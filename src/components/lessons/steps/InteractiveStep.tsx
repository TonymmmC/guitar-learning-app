'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, ArrowLeft, Target, CheckCircle, Volume2 } from 'lucide-react'
import { guitarRealAudio } from '@/lib/guitar/guitarRealAudio'
import type { LessonStep, InteractiveStepContent } from '@/lib/types/database'

interface InteractiveStepProps {
  step: LessonStep
  onNext: () => void
  onPrevious: () => void
  canGoNext: boolean
  canGoPrevious: boolean
}

const GUITAR_STRINGS = [
  { note: 'E', octave: 4, name: '1ª (Mi agudo)' },
  { note: 'B', octave: 3, name: '2ª (Si)' },
  { note: 'G', octave: 3, name: '3ª (Sol)' },
  { note: 'D', octave: 3, name: '4ª (Re)' },
  { note: 'A', octave: 2, name: '5ª (La)' },
  { note: 'E', octave: 2, name: '6ª (Mi grave)' }
]

export default function InteractiveStep({ 
  step, 
  onNext, 
  onPrevious, 
  canGoNext, 
  canGoPrevious 
}: InteractiveStepProps) {
  const content = step.content as InteractiveStepContent
  const [completedInteractions, setCompletedInteractions] = useState<Set<number>>(new Set())
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [activeString, setActiveString] = useState<number | null>(null)

  const enableAudio = async () => {
    try {
      await guitarRealAudio.initialize()
      setAudioEnabled(true)
    } catch (error) {
      console.error('Error enabling audio:', error)
    }
  }

  const handleStringClick = async (stringIndex: number) => {
    setActiveString(stringIndex)
    
    if (audioEnabled) {
      await guitarRealAudio.playNote(stringIndex, 0) // Cuerda al aire
    }
    
    // Marcar como completada si es una interacción requerida
    const requiredInteraction = content.required_interactions.find(
      interaction => interaction.string === stringIndex
    )
    
    if (requiredInteraction) {
      setCompletedInteractions(prev => new Set(prev).add(stringIndex))
    }
    
    // Limpiar estado activo después de un momento
    setTimeout(() => setActiveString(null), 300)
  }

  const allInteractionsCompleted = content.required_interactions.every(
    interaction => completedInteractions.has(interaction.string)
  )

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#ff8a50]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-[#ff8a50]" />
            </div>
            <h1 className="text-2xl font-medium text-[#e8e8e8] mb-2">
              Práctica interactiva
            </h1>
            <p className="text-[#6b6b6b] text-sm">Haz clic en las cuerdas indicadas</p>
          </div>

          {/* Audio control */}
          {!audioEnabled && (
            <div className="text-center mb-8">
              <button
                onClick={enableAudio}
                className="bg-[#5c9eff] hover:opacity-90 text-white px-6 py-2 rounded-lg transition-opacity flex items-center space-x-2 mx-auto"
              >
                <Volume2 className="w-4 h-4" />
                <span>Activar audio</span>
              </button>
              <p className="text-xs text-[#6b6b6b] mt-2">
                Recomendado para escuchar el sonido de cada cuerda
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-[#e8e8e8] mb-4">Instrucciones</h3>
            <div className="space-y-3">
              {content.required_interactions.map((interaction, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    completedInteractions.has(interaction.string)
                      ? 'bg-[#00d4aa] text-white'
                      : 'bg-[#242424] text-[#6b6b6b]'
                  }`}>
                    {completedInteractions.has(interaction.string) ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`${
                    completedInteractions.has(interaction.string)
                      ? 'text-[#00d4aa] line-through'
                      : 'text-[#a8a8a8]'
                  }`}>
                    {interaction.label}
                  </span>
                </div>
              ))}
            </div>
            
            {allInteractionsCompleted && (
              <div className="mt-4 p-3 bg-[#00d4aa]/10 border border-[#00d4aa]/20 rounded-lg">
                <p className="text-[#00d4aa] text-sm font-medium">
                  ¡Excelente! Has completado todas las interacciones requeridas.
                </p>
              </div>
            )}
          </div>

          {/* Guitarra interactiva simplificada */}
          <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-8">
            <h3 className="text-lg font-medium text-[#e8e8e8] mb-6 text-center">
              Guitarra interactiva
            </h3>
            
            <div className="max-w-4xl mx-auto">
              {/* Cuerdas */}
              {GUITAR_STRINGS.map((string, stringIndex) => {
                const isRequired = content.required_interactions.some(
                  interaction => interaction.string === stringIndex
                )
                const isCompleted = completedInteractions.has(stringIndex)
                const isActive = activeString === stringIndex
                
                return (
                  <div key={stringIndex} className="flex items-center mb-4">
                    {/* Label */}
                    <div className="w-32 text-right pr-4">
                      <div className={`text-sm font-medium ${
                        isRequired ? 'text-[#e8e8e8]' : 'text-[#6b6b6b]'
                      }`}>
                        {string.name}
                      </div>
                      <div className="text-xs text-[#6b6b6b]">
                        {string.note}
                      </div>
                    </div>

                    {/* String visual */}
                    <div className="flex-1 relative">
                      <button
                        onClick={() => handleStringClick(stringIndex)}
                        className={`w-full h-12 relative transition-all duration-200 rounded-lg ${
                          isActive
                            ? 'bg-[#5c9eff]/30 border-2 border-[#5c9eff]'
                            : isCompleted
                            ? 'bg-[#00d4aa]/10 border border-[#00d4aa]/30 hover:bg-[#00d4aa]/20'
                            : isRequired
                            ? 'bg-[#ff8a50]/10 border border-[#ff8a50]/30 hover:bg-[#ff8a50]/20'
                            : 'bg-[#242424] border border-[rgba(255,255,255,0.08)] hover:bg-[#2a2a2a]'
                        }`}
                      >
                        {/* String line */}
                        <div 
                          className={`absolute top-1/2 left-4 right-4 border-t-2 transform -translate-y-1/2 ${
                            isActive
                              ? 'border-[#5c9eff] animate-pulse'
                              : 'border-[#8b7355]'
                          }`}
                          style={{ 
                            borderWidth: `${1 + stringIndex * 0.3}px`
                          }}
                        />
                        
                        {/* Completion indicator */}
                        {isCompleted && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <CheckCircle className="w-5 h-5 text-[#00d4aa]" />
                          </div>
                        )}
                        
                        {/* Required indicator */}
                        {isRequired && !isCompleted && (
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                            <div className="w-3 h-3 bg-[#ff8a50] rounded-full animate-pulse" />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tips */}
            <div className="mt-8 text-center">
              <p className="text-[#6b6b6b] text-sm">
                {audioEnabled 
                  ? "Haz clic en las cuerdas para escuchar su sonido"
                  : "Activa el audio para una mejor experiencia de aprendizaje"
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation footer */}
      <div className="border-t border-[rgba(255,255,255,0.06)] p-6">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="flex items-center space-x-2 px-4 py-2 text-[#a8a8a8] hover:text-[#e8e8e8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="text-center">
            <p className="text-sm text-[#6b6b6b]">
              {completedInteractions.size} / {content.required_interactions.length} completadas
            </p>
            {!allInteractionsCompleted && (
              <p className="text-xs text-[#ff8a50]">Completa todas las interacciones</p>
            )}
          </div>

          <button
            onClick={onNext}
            disabled={!canGoNext || !allInteractionsCompleted}
            className="flex items-center space-x-2 bg-[#5c9eff] hover:opacity-90 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-opacity"
          >
            <span>Continuar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}