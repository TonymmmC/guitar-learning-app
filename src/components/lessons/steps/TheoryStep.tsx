'use client'

import { ArrowRight, ArrowLeft, BookOpen, Music } from 'lucide-react'
import type { LessonStep, TheoryStepContent } from '@/lib/types/database'

interface TheoryStepProps {
  step: LessonStep
  onNext: () => void
  onPrevious: () => void
  canGoNext: boolean
  canGoPrevious: boolean
}

export default function TheoryStep({ 
  step, 
  onNext, 
  onPrevious, 
  canGoNext, 
  canGoPrevious 
}: TheoryStepProps) {
  const content = step.content as TheoryStepContent

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#00d4aa]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-[#00d4aa]" />
            </div>
            <h1 className="text-2xl font-medium text-[#e8e8e8] mb-2">
              {content.title}
            </h1>
            <p className="text-[#6b6b6b] text-sm">Conocimiento teórico</p>
          </div>

          {/* Contenido principal */}
          <div className="space-y-8">
            {/* Key facts */}
            {content.key_facts && content.key_facts.length > 0 && (
              <div className="grid gap-6">
                {content.key_facts.map((fact, index) => (
                  <div key={index} className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6">
                    <h3 className="text-lg font-medium text-[#e8e8e8] mb-3 flex items-center space-x-2">
                      <div className="w-6 h-6 bg-[#5c9eff] rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {index + 1}
                      </div>
                      <span>{fact.title}</span>
                    </h3>
                    <div className="text-[#a8a8a8] leading-relaxed space-y-2">
                      {fact.content.split('\n').map((paragraph, pIndex) => (
                        <p key={pIndex}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* String names - específico para lecciones de cuerdas */}
            {content.string_names && content.string_names.length > 0 && (
              <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6">
                <h3 className="text-lg font-medium text-[#e8e8e8] mb-6 flex items-center space-x-2">
                  <Music className="w-5 h-5 text-[#5c9eff]" />
                  <span>Nombres de las cuerdas</span>
                </h3>
                
                <div className="grid gap-4">
                  {content.string_names.map((string, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-[#242424] rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-[#5c9eff] rounded-full flex items-center justify-center text-white font-medium">
                          {string.number}ª
                        </div>
                        <div>
                          <p className="text-[#e8e8e8] font-medium">{string.name}</p>
                          <p className="text-[#6b6b6b] text-sm">{string.name_english}</p>
                        </div>
                      </div>
                      
                      {/* Representación visual de la cuerda */}
                      <div className="flex items-center space-x-2">
                        <div 
                          className="bg-[#8b7355] rounded-full"
                          style={{ 
                            width: '60px',
                            height: `${2 + index * 0.5}px`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Consejos adicionales */}
            <div className="bg-gradient-to-r from-[#5c9eff]/10 to-[#00d4aa]/10 border border-[#5c9eff]/20 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-[#5c9eff] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">💡</span>
                </div>
                <div>
                  <h4 className="text-[#e8e8e8] font-medium mb-2">Consejo</h4>
                  <p className="text-[#a8a8a8] text-sm">
                    Tómate tu tiempo para memorizar esta información. 
                    Es fundamental para todo lo que aprenderás después.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation footer */}
      <div className="border-t border-[rgba(255,255,255,0.06)] p-6">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="flex items-center space-x-2 px-4 py-2 text-[#a8a8a8] hover:text-[#e8e8e8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="text-center">
            <p className="text-sm text-[#6b6b6b]">Paso teórico</p>
            <p className="text-xs text-[#6b6b6b]">Lee con atención</p>
          </div>

          <button
            onClick={onNext}
            disabled={!canGoNext}
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