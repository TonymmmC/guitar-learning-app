'use client'

import { ArrowRight, BookOpen } from 'lucide-react'
import type { LessonStep, IntroStepContent } from '@/lib/types/database'

interface IntroStepProps {
  step: LessonStep
  onComplete: () => void
  onNext: () => void
  canGoNext: boolean
}

export default function IntroStep({ step, onNext, canGoNext }: IntroStepProps) {
  const content = step.content as IntroStepContent

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl text-center">
          {/* Icono */}
          <div className="w-16 h-16 bg-[#5c9eff]/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <BookOpen className="w-8 h-8 text-[#5c9eff]" />
          </div>

          {/* Título */}
          <h1 className="text-3xl font-medium text-[#e8e8e8] mb-6">
            {content.title}
          </h1>

          {/* Contenido principal */}
          <div className="text-[#a8a8a8] text-lg leading-relaxed mb-8 space-y-4">
            {content.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Puntos clave */}
          {content.key_points && content.key_points.length > 0 && (
            <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium text-[#e8e8e8] mb-4">
                En esta lección aprenderás:
              </h3>
              <ul className="space-y-3 text-left">
                {content.key_points.map((point, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#5c9eff] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#a8a8a8]">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Botón de continuar */}
          {canGoNext && (
            <button
              onClick={onNext}
              className="bg-[#5c9eff] hover:opacity-90 text-white px-8 py-3 rounded-lg font-medium transition-opacity flex items-center space-x-2 mx-auto"
            >
              <span>Comenzar lección</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}