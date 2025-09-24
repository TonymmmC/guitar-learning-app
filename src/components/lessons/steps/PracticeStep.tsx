'use client'

import { ArrowRight, ArrowLeft, Zap, Clock } from 'lucide-react'
import type { LessonStep, PracticeStepContent } from '@/lib/types/database'

interface PracticeStepProps {
  step: LessonStep
  onNext: () => void
  onPrevious: () => void
  canGoNext: boolean
  canGoPrevious: boolean
}

export default function PracticeStep({ 
  step, 
  onNext, 
  onPrevious, 
  canGoNext, 
  canGoPrevious 
}: PracticeStepProps) {
  const content = step.content as PracticeStepContent

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#00d4aa]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-[#00d4aa]" />
            </div>
            <h1 className="text-2xl font-medium text-[#e8e8e8] mb-2">
              Momento de práctica
            </h1>
            <p className="text-[#6b6b6b] text-sm">Aplica lo que has aprendido</p>
          </div>

          {/* Practice instruction */}
          <div className="bg-gradient-to-r from-[#00d4aa]/10 to-[#5c9eff]/10 border border-[#00d4aa]/20 rounded-lg p-8 mb-8 text-center">
            <div className="mb-6">
              <Clock className="w-8 h-8 text-[#00d4aa] mx-auto mb-3" />
              <h2 className="text-xl font-medium text-[#e8e8e8] mb-2">
                Practica con tu guitarra
              </h2>
              <p className="text-[#a8a8a8] leading-relaxed">
                Ahora es tu turno de aplicar lo aprendido. Toma tu guitarra y practica 
                identificando las cuerdas que hemos visto.
              </p>
            </div>

            {/* Exercise visual */}
            <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-[#e8e8e8] mb-4">Ejercicio práctico</h3>
              <div className="text-left space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-[#5c9eff] rounded-full flex items-center justify-center text-white text-sm font-medium">1</div>
                  <span className="text-[#a8a8a8]">Toca cada cuerda desde la 6ª hasta la 1ª</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-[#5c9eff] rounded-full flex items-center justify-center text-white text-sm font-medium">2</div>
                  <span className="text-[#a8a8a8]">Di en voz alta el nombre de cada cuerda</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-[#5c9eff] rounded-full flex items-center justify-center text-white text-sm font-medium">3</div>
                  <span className="text-[#a8a8a8]">Repite el ejercicio 3 veces</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          {content.tips && content.tips.length > 0 && (
            <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6">
              <h3 className="text-lg font-medium text-[#e8e8e8] mb-4 flex items-center space-x-2">
                <span>💡</span>
                <span>Consejos para la práctica</span>
              </h3>
              <ul className="space-y-3">
                {content.tips.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#00d4aa] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#a8a8a8]">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
            <p className="text-sm text-[#6b6b6b]">Tómate tu tiempo</p>
            <p className="text-xs text-[#6b6b6b]">La práctica hace al maestro</p>
          </div>

          <button
            onClick={onNext}
            disabled={!canGoNext}
            className="flex items-center space-x-2 bg-[#00d4aa] hover:opacity-90 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-opacity"
          >
            <span>He practicado</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}