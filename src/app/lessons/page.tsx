'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/context'
import { lessonService } from '@/lib/lessons/service'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, 
  Clock, 
  Play, 
  CheckCircle,
  Circle,
  Lock,
  Star,
  ArrowLeft 
} from 'lucide-react'
import type { Lesson, UserLessonProgress } from '@/lib/types/database'

interface LessonWithProgress extends Lesson {
  progress?: UserLessonProgress
}

export default function LessonsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [lessons, setLessons] = useState<LessonWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadLessons = async () => {
      if (!user) return

      setLoading(true)
      try {
        const { data, error: lessonsError } = await lessonService.getUserLessonsList(user.id)
        
        if (lessonsError) {
          setError(lessonsError)
        } else if (data) {
          setLessons(data)
        }
      } catch (error) {
        setError('Error cargando lecciones')
      } finally {
        setLoading(false)
      }
    }

    loadLessons()
  }, [user])

  const handleStartLesson = (lesson: LessonWithProgress) => {
    if (lesson.is_premium && user?.subscription_status !== 'premium') {
      return // TODO: Modal de upgrade
    }
    
    router.push(`/lessons/${lesson.slug}`)
  }

  const getProgressIcon = (progress?: UserLessonProgress) => {
    switch (progress?.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-[#00d4aa]" />
      case 'mastered':
        return <Star className="w-5 h-5 text-[#ff8a50]" />
      case 'in_progress':
        return <Circle className="w-5 h-5 text-[#5c9eff] fill-current" />
      default:
        return <Circle className="w-5 h-5 text-[#6b6b6b]" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5c9eff]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e8e8e8]">
      {/* Header */}
      <header className="bg-[#111111] border-b border-[rgba(255,255,255,0.06)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="text-[#a8a8a8] hover:text-[#e8e8e8] p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">Lecciones</h1>
              <p className="text-sm text-[#6b6b6b]">
                {lessons.length} lección{lessons.length !== 1 ? 'es' : ''} disponible{lessons.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {lessons.length === 0 && !loading ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-[#6b6b6b] mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay lecciones disponibles</h3>
            <p className="text-[#a8a8a8]">Las lecciones aparecerán aquí cuando estén listas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onStart={() => handleStartLesson(lesson)}
                canAccess={!lesson.is_premium || user?.subscription_status === 'premium'}
                progressIcon={getProgressIcon(lesson.progress)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

interface LessonCardProps {
  lesson: LessonWithProgress
  onStart: () => void
  canAccess: boolean
  progressIcon: React.ReactNode
}

function LessonCard({ lesson, onStart, canAccess, progressIcon }: LessonCardProps) {
  const getButtonText = () => {
    if (!canAccess) return 'Premium'
    
    switch (lesson.progress?.status) {
      case 'completed':
        return 'Revisar'
      case 'mastered':
        return 'Repasar'
      case 'in_progress':
        return 'Continuar'
      default:
        return 'Comenzar'
    }
  }

  const getButtonIcon = () => {
    if (!canAccess) return <Lock className="w-4 h-4" />
    
    switch (lesson.progress?.status) {
      case 'in_progress':
        return <Play className="w-4 h-4" />
      default:
        return <Play className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6 hover:bg-[#1f1f1f] transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {progressIcon}
          <div>
            <h3 className="text-lg font-medium text-[#e8e8e8]">{lesson.title}</h3>
            <div className="flex items-center space-x-3 text-sm text-[#6b6b6b] mt-1">
              <span>Lección {lesson.lesson_number}</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{lesson.duration_minutes} min</span>
              </div>
            </div>
          </div>
        </div>
        
        {lesson.is_premium && (
          <span className="bg-[#ff8a50]/20 text-[#ff8a50] px-2 py-1 rounded text-xs font-medium">
            Premium
          </span>
        )}
      </div>

      {/* Description */}
      {lesson.description && (
        <p className="text-[#a8a8a8] text-sm mb-4 line-clamp-2">
          {lesson.description}
        </p>
      )}

      {/* Objectives */}
      {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-[#a8a8a8] mb-2">Objetivos:</p>
          <ul className="space-y-1">
            {lesson.learning_objectives.slice(0, 3).map((objective, index) => (
              <li key={index} className="text-xs text-[#6b6b6b] flex items-center space-x-2">
                <div className="w-1 h-1 bg-[#5c9eff] rounded-full"></div>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress bar */}
      {lesson.progress && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#a8a8a8]">Progreso</span>
            <span className="text-[#a8a8a8]">{lesson.progress.progress_percentage}%</span>
          </div>
          <div className="w-full bg-[#242424] rounded-full h-1.5">
            <div 
              className="bg-[#5c9eff] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${lesson.progress.progress_percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Tags */}
      {lesson.tags && lesson.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {lesson.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="bg-[#242424] text-[#a8a8a8] px-2 py-1 rounded text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action button */}
      <button
        onClick={onStart}
        disabled={!canAccess}
        className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
          canAccess
            ? 'bg-[#5c9eff] hover:opacity-90 text-white'
            : 'bg-[#242424] text-[#6b6b6b] cursor-not-allowed'
        }`}
      >
        {getButtonIcon()}
        <span>{getButtonText()}</span>
      </button>
    </div>
  )
}