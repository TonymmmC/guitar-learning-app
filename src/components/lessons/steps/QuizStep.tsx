'use client'

import { useState } from 'react'
import { ArrowRight, ArrowLeft, HelpCircle, CheckCircle, XCircle, Award, RotateCcw } from 'lucide-react'
import type { LessonStep, QuizStepContent } from '@/lib/types/database'

interface QuizStepProps {
  step: LessonStep
  onNext: () => void
  onPrevious: () => void
  canGoNext: boolean
  canGoPrevious: boolean
  onComplete: () => void
}

export default function QuizStep({ 
  step, 
  onNext, 
  onPrevious, 
  canGoNext, 
  canGoPrevious,
  onComplete 
}: QuizStepProps) {
  const content = step.content as QuizStepContent
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const currentQuestion = content.questions[currentQuestionIndex]
  const totalQuestions = content.questions.length

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    if (showResults) return
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // Last question - show results
      setShowResults(true)
      calculateResults()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const calculateResults = () => {
    const correctAnswers = content.questions.filter(question => 
      selectedAnswers[question.id] === question.correct
    ).length

    const score = Math.round((correctAnswers / totalQuestions) * 100)
    const passed = score >= content.passing_score

    if (passed) {
      setQuizCompleted(true)
    }
  }

  const getScore = () => {
    const correctAnswers = content.questions.filter(question => 
      selectedAnswers[question.id] === question.correct
    ).length
    return Math.round((correctAnswers / totalQuestions) * 100)
  }

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
    setShowResults(false)
    setQuizCompleted(false)
  }

  const handleQuizComplete = () => {
    if (quizCompleted) {
      if (canGoNext) {
        onNext()
      } else {
        onComplete()
      }
    }
  }

  if (showResults) {
    const score = getScore()
    const correctAnswers = content.questions.filter(question => 
      selectedAnswers[question.id] === question.correct
    ).length
    const passed = score >= content.passing_score

    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl text-center">
            {/* Results header */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              passed ? 'bg-[#00d4aa]/20' : 'bg-red-500/20'
            }`}>
              {passed ? (
                <Award className="w-10 h-10 text-[#00d4aa]" />
              ) : (
                <XCircle className="w-10 h-10 text-red-400" />
              )}
            </div>

            <h1 className={`text-3xl font-medium mb-4 ${
              passed ? 'text-[#00d4aa]' : 'text-red-400'
            }`}>
              {passed ? '¡Excelente!' : 'Necesitas repasar'}
            </h1>

            <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-8 mb-8">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-[#5c9eff] mb-1">{score}%</p>
                  <p className="text-[#6b6b6b] text-sm">Puntuación</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#e8e8e8] mb-1">{correctAnswers}/{totalQuestions}</p>
                  <p className="text-[#6b6b6b] text-sm">Correctas</p>
                </div>
                <div>
                  <p className={`text-3xl font-bold mb-1 ${passed ? 'text-[#00d4aa]' : 'text-red-400'}`}>
                    {passed ? 'APROBADO' : 'REPROBADO'}
                  </p>
                  <p className="text-[#6b6b6b] text-sm">Estado</p>
                </div>
              </div>
            </div>

            {/* Review wrong answers */}
            <div className="text-left bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium text-[#e8e8e8] mb-4">Revisión de respuestas</h3>
              <div className="space-y-4">
                {content.questions.map((question, index) => {
                  const userAnswer = selectedAnswers[question.id]
                  const isCorrect = userAnswer === question.correct
                  
                  return (
                    <div key={question.id} className="border-l-4 border-l-gray-600 pl-4">
                      <div className="flex items-start space-x-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-[#00d4aa] mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-[#e8e8e8] mb-2">{question.question}</p>
                          <p className={`text-sm ${isCorrect ? 'text-[#00d4aa]' : 'text-red-400'}`}>
                            Tu respuesta: {question.options[userAnswer]}
                          </p>
                          {!isCorrect && (
                            <>
                              <p className="text-sm text-[#00d4aa]">
                                Correcta: {question.options[question.correct]}
                              </p>
                              <p className="text-xs text-[#6b6b6b] mt-1">{question.explanation}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              {!passed && (
                <button
                  onClick={resetQuiz}
                  className="flex items-center space-x-2 bg-[#242424] hover:bg-[#2a2a2a] text-[#a8a8a8] px-6 py-3 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Intentar de nuevo</span>
                </button>
              )}
              
              {passed && (
                <button
                  onClick={handleQuizComplete}
                  className="flex items-center space-x-2 bg-[#00d4aa] hover:opacity-90 text-white px-8 py-3 rounded-lg transition-opacity"
                >
                  <Award className="w-5 h-5" />
                  <span>{canGoNext ? 'Continuar' : 'Finalizar lección'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#ff8a50]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6 text-[#ff8a50]" />
            </div>
            <h1 className="text-2xl font-medium text-[#e8e8e8] mb-2">
              Evaluación
            </h1>
            <p className="text-[#6b6b6b] text-sm">
              Pregunta {currentQuestionIndex + 1} de {totalQuestions} • 
              Necesitas {content.passing_score}% para aprobar
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="w-full bg-[#242424] rounded-full h-2">
              <div 
                className="bg-[#5c9eff] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-8 mb-8">
            <h2 className="text-xl font-medium text-[#e8e8e8] mb-6">
              {currentQuestion.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, optionIndex) => {
                const isSelected = selectedAnswers[currentQuestion.id] === optionIndex
                
                return (
                  <button
                    key={optionIndex}
                    onClick={() => handleAnswerSelect(currentQuestion.id, optionIndex)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-[#5c9eff]/20 border-[#5c9eff] text-[#e8e8e8]'
                        : 'bg-[#242424] border-[rgba(255,255,255,0.08)] text-[#a8a8a8] hover:bg-[#2a2a2a] hover:border-[rgba(255,255,255,0.12)]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-[#5c9eff] bg-[#5c9eff]'
                          : 'border-[rgba(255,255,255,0.2)]'
                      }`}>
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation footer */}
      <div className="border-t border-[rgba(255,255,255,0.06)] p-6">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <button
            onClick={currentQuestionIndex === 0 ? onPrevious : handlePreviousQuestion}
            disabled={currentQuestionIndex === 0 && !canGoPrevious}
            className="flex items-center space-x-2 px-4 py-2 text-[#a8a8a8] hover:text-[#e8e8e8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentQuestionIndex === 0 ? 'Anterior' : 'Pregunta anterior'}</span>
          </button>

          <div className="text-center">
            <p className="text-sm text-[#6b6b6b]">
              {selectedAnswers[currentQuestion.id] !== undefined ? 'Respuesta seleccionada' : 'Selecciona una respuesta'}
            </p>
          </div>

          <button
            onClick={handleNextQuestion}
            disabled={selectedAnswers[currentQuestion.id] === undefined}
            className="flex items-center space-x-2 bg-[#5c9eff] hover:opacity-90 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-opacity"
          >
            <span>{currentQuestionIndex === totalQuestions - 1 ? 'Finalizar' : 'Siguiente'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}