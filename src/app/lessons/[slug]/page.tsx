'use client'

import { use, useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/context'
import { lessonService } from '@/lib/lessons/service'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle,
  Clock,
  BookOpen,
  Target,
  ChevronRight,
  Play
} from 'lucide-react'
import type { Lesson, UserLessonProgress, LessonStep } from '@/lib/types/database'

// Importar componentes de steps
import IntroStep from '../../../components/lessons/steps/IntroStep'
import TheoryStep from '../../../components/lessons/steps/TheoryStep'
import InteractiveStep from '../../../components/lessons/steps/InteractiveStep'
import PracticeStep from '../../../components/lessons/steps/PracticeStep'
import QuizStep from '../../../components/lessons/steps/QuizStep'

export default function LessonPlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { user } = useAuth()
  const router = useRouter()
  const resolvedParams = use(params) // Unwrap params promise
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [progress, setProgress] = useState<UserLessonProgress | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const loadLesson = async () => {
      if (!user) return

      setLoading(true)
      try {
        // Cargar lección
        const { data: lessonData, error: lessonError } = await lessonService.getLessonBySlug(resolvedParams.slug)
        
        if (lessonError || !lessonData) {
          setError('Lección no encontrada')
          return
        }

        // Verificar acceso premium
        if (lessonData.is_premium && user.subscription_status !== 'premium') {
          setError('Esta lección requiere suscripción premium')
          return
        }

        setLesson(lessonData)

        // Cargar progreso
        const { data: progressData } = await lessonService.getUserProgress(user.id, lessonData.id)
        
        if (progressData) {
          setProgress(progressData)
          // Si hay progreso, ir al step correspondiente
          const stepFromProgress = progressData.current_step || 0
          setCurrentStepIndex(Math.min(stepFromProgress, (lessonData.steps?.length || 1) - 1))
        } else {
          // Inicializar progreso
          const { data: newProgress } = await lessonService.initializeProgress(user.id, lessonData.id)
          setProgress(newProgress)
        }
      } catch (error) {
        setError('Error cargando lección')
      } finally {
        setLoading(false)
      }
    }

    loadLesson()
  }, [user, resolvedParams.slug])

  const updateProgress = async (updates: { 
    current_step?: number
    progress_percentage?: number 
    status?: 'in_progress' | 'completed' | 'mastered'
  }) => {
    if (!user || !lesson) return

    const { data: updatedProgress } = await lessonService.updateProgress(
      user.id, 
      lesson.id, 
      updates
    )
    
    if (updatedProgress) {
      setProgress(updatedProgress)
    }
  }

  const handleStepComplete = async () => {
    const nextStepIndex = currentStepIndex + 1
    const totalSteps = lesson?.steps?.length || 0
    
    if (nextStepIndex >= totalSteps) {
      // Lección completada
      await updateProgress({
        current_step: totalSteps,
        progress_percentage: 100,
        status: 'completed'
      })
      
      // Mostrar mensaje de completado o redirigir
      router.push('/lessons?completed=true')
    } else {
      // Siguiente paso
      setCurrentStepIndex(nextStepIndex)
      await updateProgress({
        current_step: nextStepIndex,
        progress_percentage: Math.round(((nextStepIndex + 1) / totalSteps) * 100)
      })
    }
  }

  const handleStepNavigation = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < (lesson?.steps?.length || 0)) {
      setCurrentStepIndex(stepIndex)
      updateProgress({ current_step: stepIndex })
    }
  }

  const renderStep = (step: LessonStep) => {
    const commonProps = {
      step,
      onComplete: handleStepComplete,
      onNext: () => handleStepNavigation(currentStepIndex + 1),
      onPrevious: () => handleStepNavigation(currentStepIndex - 1),
      canGoNext: currentStepIndex < (lesson?.steps?.length || 0) - 1,
      canGoPrevious: currentStepIndex > 0
    }

    switch (step.step_type) {
      case 'intro':
        return <IntroStep {...commonProps} />
      case 'theory':
        return <TheoryStep {...commonProps} />
      case 'interactive':
        return <InteractiveStep {...commonProps} />
      case 'practice':
        return <PracticeStep {...commonProps} />
      case 'quiz':
        return <QuizStep {...commonProps} />
      default:
        return <div className="p-6 text-center text-[#6b6b6b]">Tipo de paso no soportado</div>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5c9eff]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-[#6b6b6b] mx-auto mb-4" />
          <h2 className="text-xl font-medium text-[#e8e8e8] mb-2">Error</h2>
          <p className="text-[#a8a8a8] mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/lessons'}
            className="bg-[#5c9eff] hover:opacity-90 text-white px-6 py-2 rounded-lg transition-opacity"
          >
            Volver a Lecciones
          </button>
        </div>
      </div>
    )
  }

  if (!lesson) return null

  const currentStep = lesson.steps?.[currentStepIndex]
  const progressPercentage = progress?.progress_percentage || 0

  return (
    <div className="h-screen bg-[#0f0f0f] text-[#e8e8e8] flex">
      {/* Sidebar de navegación */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 w-80 bg-[#111111] border-r border-[rgba(255,255,255,0.06)] transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Header del sidebar */}
        <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
          <button
            onClick={() => router.push('/lessons')}
            className="flex items-center space-x-2 text-[#a8a8a8] hover:text-[#e8e8e8] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Volver a lecciones</span>
          </button>
          
          <h1 className="text-lg font-medium mb-2">{lesson.title}</h1>
          
          <div className="flex items-center space-x-4 text-sm text-[#6b6b6b] mb-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{lesson.duration_minutes} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="w-3 h-3" />
              <span>{lesson.steps?.length || 0} pasos</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#a8a8a8]">Progreso</span>
              <span className="text-[#a8a8a8]">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-[#242424] rounded-full h-2">
              <div 
                className="bg-[#5c9eff] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lista de pasos */}
        <div className="flex-1 overflow-y-auto p-4">
          {lesson.steps?.map((step, index) => (
            <button
              key={step.id}
              onClick={() => handleStepNavigation(index)}
              className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                index === currentStepIndex
                  ? 'bg-[#5c9eff]/20 border border-[#5c9eff]/50'
                  : 'hover:bg-[#1a1a1a]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    index < currentStepIndex
                      ? 'bg-[#00d4aa] text-white'
                      : index === currentStepIndex
                      ? 'bg-[#5c9eff] text-white'
                      : 'bg-[#242424] text-[#6b6b6b]'
                  }`}>
                    {index < currentStepIndex ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#e8e8e8]">{step.title}</p>
                    <p className="text-xs text-[#6b6b6b] capitalize">{step.step_type}</p>
                  </div>
                </div>
                {index === currentStepIndex && (
                  <Play className="w-3 h-3 text-[#5c9eff]" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header móvil */}
        <header className="lg:hidden bg-[#111111] border-b border-[rgba(255,255,255,0.06)] p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[#a8a8a8] hover:text-[#e8e8e8]"
            >
              <BookOpen className="w-5 h-5" />
            </button>
            <div className="text-center">
              <p className="text-sm font-medium">{currentStep?.title}</p>
              <p className="text-xs text-[#6b6b6b]">
                Paso {currentStepIndex + 1} de {lesson.steps?.length || 0}
              </p>
            </div>
            <div className="w-5 h-5"></div>
          </div>
        </header>

        {/* Área de contenido del paso */}
        <main className="flex-1 overflow-auto">
          {currentStep ? (
            renderStep(currentStep)
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-12 h-12 text-[#6b6b6b] mx-auto mb-4" />
                <p className="text-[#a8a8a8]">No hay pasos disponibles</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}