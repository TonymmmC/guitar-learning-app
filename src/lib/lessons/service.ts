// src/lib/lessons/service.ts
import { supabase } from '@/lib/supabase/client'
import type { Lesson, LessonStep, UserLessonProgress } from '@/lib/types/database'

class LessonService {
  async getLessons(filters?: {
    published?: boolean
    premium?: boolean
    limit?: number
  }): Promise<{ data: Lesson[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('lessons')
        .select(`
          id,
          title,
          slug,
          description,
          lesson_number,
          duration_minutes,
          is_premium,
          is_published,
          tags,
          learning_objectives,
          created_at
        `)
        .order('lesson_number', { ascending: true })

      if (filters?.published !== undefined) {
        query = query.eq('is_published', filters.published)
      }

      if (filters?.premium !== undefined) {
        query = query.eq('is_premium', filters.premium)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) {
        return { data: null, error: 'Error cargando lecciones' }
      }

      return { data: data as Lesson[], error: null }
    } catch (error) {
      return { data: null, error: 'Error inesperado' }
    }
  }

  async getLesson(id: string): Promise<{ data: Lesson | null; error: string | null }> {
    try {
      // Lesson básica
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single()

      if (lessonError || !lessonData) {
        return { data: null, error: 'Lección no encontrada' }
      }

      // Steps de la lección
      const { data: stepsData, error: stepsError } = await supabase
        .from('lesson_steps')
        .select('*')
        .eq('lesson_id', id)
        .order('step_order', { ascending: true })

      if (stepsError) {
        return { data: null, error: 'Error cargando pasos de la lección' }
      }

      const lesson: Lesson = {
        ...lessonData,
        steps: stepsData as LessonStep[]
      }

      return { data: lesson, error: null }
    } catch (error) {
      return { data: null, error: 'Error inesperado' }
    }
  }

  async getLessonBySlug(slug: string): Promise<{ data: Lesson | null; error: string | null }> {
    try {
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      if (lessonError || !lessonData) {
        return { data: null, error: 'Lección no encontrada' }
      }

      return this.getLesson(lessonData.id)
    } catch (error) {
      return { data: null, error: 'Error inesperado' }
    }
  }

  async getUserProgress(
    userId: string, 
    lessonId: string
  ): Promise<{ data: UserLessonProgress | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        return { data: null, error: 'Error cargando progreso' }
      }

      return { data: data as UserLessonProgress | null, error: null }
    } catch (error) {
      return { data: null, error: 'Error inesperado' }
    }
  }

  async initializeProgress(
    userId: string, 
    lessonId: string
  ): Promise<{ data: UserLessonProgress | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          status: 'in_progress',
          progress_percentage: 0,
          time_spent_minutes: 0,
          attempts_count: 1,
          last_accessed_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        return { data: null, error: 'Error inicializando progreso' }
      }

      return { data: data as UserLessonProgress, error: null }
    } catch (error) {
      return { data: null, error: 'Error inesperado' }
    }
  }

  async updateProgress(
    userId: string,
    lessonId: string,
    updates: {
      status?: 'in_progress' | 'completed' | 'mastered'
      progress_percentage?: number
      current_step?: number
      time_spent_minutes?: number
      best_score?: number
    }
  ): Promise<{ data: UserLessonProgress | null; error: string | null }> {
    try {
      const updateData: any = {
        ...updates,
        last_accessed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (updates.status === 'completed') {
        updateData.completed_at = new Date().toISOString()
        updateData.progress_percentage = 100
      }

      const { data, error } = await supabase
        .from('user_lesson_progress')
        .update(updateData)
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .select()
        .single()

      if (error) {
        return { data: null, error: 'Error actualizando progreso' }
      }

      return { data: data as UserLessonProgress, error: null }
    } catch (error) {
      return { data: null, error: 'Error inesperado' }
    }
  }

  async getUserLessonsList(
    userId: string
  ): Promise<{ 
    data: Array<Lesson & { progress?: UserLessonProgress }> | null; 
    error: string | null 
  }> {
    try {
      // Obtener lecciones publicadas
      const { data: lessons, error: lessonsError } = await this.getLessons({ 
        published: true 
      })

      if (lessonsError || !lessons) {
        return { data: null, error: lessonsError }
      }

      // Obtener progreso del usuario para todas las lecciones
      const { data: progressData, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId)

      if (progressError) {
        return { data: null, error: 'Error cargando progreso del usuario' }
      }

      // Combinar lecciones con progreso
      const lessonsWithProgress = lessons.map(lesson => {
        const progress = progressData?.find(p => p.lesson_id === lesson.id)
        return {
          ...lesson,
          progress: progress as UserLessonProgress | undefined
        }
      })

      return { data: lessonsWithProgress, error: null }
    } catch (error) {
      return { data: null, error: 'Error inesperado' }
    }
  }

  // Métodos de utilidad
  getProgressColor(status?: string) {
    switch (status) {
      case 'completed': return '#00d4aa'
      case 'mastered': return '#ff8a50'
      case 'in_progress': return '#5c9eff'
      default: return '#6b6b6b'
    }
  }

  getProgressLabel(status?: string) {
    switch (status) {
      case 'completed': return 'Completada'
      case 'mastered': return 'Dominada'
      case 'in_progress': return 'En progreso'
      default: return 'No iniciada'
    }
  }

  calculateStepProgress(currentStep: number, totalSteps: number): number {
    return Math.round((currentStep / totalSteps) * 100)
  }
}

export const lessonService = new LessonService()