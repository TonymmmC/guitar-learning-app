// src/components/guitar/InteractiveGuitar.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/context'

// Standard tuning from 1st to 6th string
const STANDARD_TUNING = ['E', 'B', 'G', 'D', 'A', 'E']

// Chromatic notes
const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Spanish notation mapping
const SPANISH_NOTATION = {
  'C': 'Do', 'C#': 'Do#', 'D': 'Re', 'D#': 'Re#', 'E': 'Mi', 'F': 'Fa',
  'F#': 'Fa#', 'G': 'Sol', 'G#': 'Sol#', 'A': 'La', 'A#': 'La#', 'B': 'Si'
}

interface FretPosition {
  string: number
  fret: number
  note: string
}

export default function InteractiveGuitar() {
  const { user } = useAuth()
  const [activePosition, setActivePosition] = useState<FretPosition | null>(null)
  const [useSpanishNotation, setUseSpanishNotation] = useState(
    user?.notation_preference === 'spanish'
  )

  // Calculate note at specific fret
  const getNoteAtFret = (stringIndex: number, fret: number): string => {
    const openNote = STANDARD_TUNING[stringIndex]
    const openNoteIndex = CHROMATIC_NOTES.indexOf(openNote)
    const noteIndex = (openNoteIndex + fret) % 12
    return CHROMATIC_NOTES[noteIndex]
  }

  // Convert note to display format
  const formatNote = (note: string): string => {
    return useSpanishNotation ? SPANISH_NOTATION[note as keyof typeof SPANISH_NOTATION] : note
  }

  // Handle fret click
  const handleFretClick = (stringIndex: number, fret: number) => {
    const note = getNoteAtFret(stringIndex, fret)
    setActivePosition({ string: stringIndex, fret, note })
  }

  return (
    <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#e8e8e8]">Guitarra Interactiva</h2>
        <button
          onClick={() => setUseSpanishNotation(!useSpanishNotation)}
          className="bg-[#5c9eff] hover:opacity-90 text-white px-4 py-2 rounded-lg transition-opacity text-sm"
        >
          {useSpanishNotation ? 'Do-Re-Mi' : 'C-D-E'}
        </button>
      </div>

      {/* Note Display */}
      {activePosition && (
        <div className="bg-[#242424] rounded-lg p-4 mb-6 text-center">
          <p className="text-[#a8a8a8] text-sm mb-1">
            Cuerda {activePosition.string + 1} • Traste {activePosition.fret}
          </p>
          <p className="text-3xl font-bold text-[#5c9eff]">
            {formatNote(activePosition.note)}
          </p>
        </div>
      )}

      {/* Guitar Neck */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Fret numbers */}
          <div className="flex mb-2">
            <div className="w-12"></div>
            {Array.from({ length: 13 }, (_, fret) => (
              <div key={fret} className="flex-1 text-center text-xs text-[#6b6b6b]">
                {fret}
              </div>
            ))}
          </div>

          {/* Strings */}
          {STANDARD_TUNING.map((openNote, stringIndex) => (
            <div key={stringIndex} className="flex items-center mb-1">
              {/* String label */}
              <div className="w-12 text-center text-sm font-medium text-[#a8a8a8]">
                {formatNote(openNote)}
              </div>

              {/* String line with frets */}
              <div className="flex-1 relative">
                {/* String line */}
                <div 
                  className="absolute top-1/2 left-0 right-0 border-t-2 border-[#8b7355]"
                  style={{ 
                    borderWidth: `${2 + (5 - stringIndex) * 0.5}px`,
                    transform: 'translateY(-50%)'
                  }}
                />

                {/* Frets */}
                <div className="flex relative z-10">
                  {Array.from({ length: 13 }, (_, fret) => (
                    <button
                      key={fret}
                      onClick={() => handleFretClick(stringIndex, fret)}
                      className={`flex-1 h-8 relative group transition-colors ${
                        activePosition?.string === stringIndex && activePosition?.fret === fret
                          ? 'bg-[#5c9eff]/20'
                          : 'hover:bg-[rgba(255,255,255,0.05)]'
                      }`}
                    >
                      {/* Fret wire */}
                      {fret > 0 && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#c0c0c0]" />
                      )}

                      {/* Fret markers */}
                      {[3, 5, 7, 9, 15, 17, 19, 21].includes(fret) && stringIndex === 2 && (
                        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#8b7355] rounded-full transform -translate-x-1/2 -translate-y-1/2" />
                      )}

                      {/* Double dots for 12th fret */}
                      {fret === 12 && (stringIndex === 1 || stringIndex === 4) && (
                        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-[#8b7355] rounded-full transform -translate-x-1/2 -translate-y-1/2" />
                      )}

                      {/* Hover note preview */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#242424] text-[#e8e8e8] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        {formatNote(getNoteAtFret(stringIndex, fret))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center text-[#6b6b6b] text-sm">
        <p>Haz click en cualquier traste para ver la nota</p>
        <p className="mt-1">
          Las cuerdas están afinadas en: {STANDARD_TUNING.map(formatNote).join(' - ')}
        </p>
      </div>
    </div>
  )
}