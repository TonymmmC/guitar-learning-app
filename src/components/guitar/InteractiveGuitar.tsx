// src/components/guitar/InteractiveGuitar.tsx - CORREGIDO BUCLE
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/context'
import { guitarRealAudio } from '@/lib/guitar/guitarRealAudio'
import { Volume2, Mic, ToggleLeft, ToggleRight } from 'lucide-react'

const GUITAR_STRINGS = [
  { note: 'E', octave: 2, name: '6ª (Mi grave)' },
  { note: 'A', octave: 2, name: '5ª (La)' },
  { note: 'D', octave: 3, name: '4ª (Re)' },
  { note: 'G', octave: 3, name: '3ª (Sol)' },
  { note: 'B', octave: 3, name: '2ª (Si)' },
  { note: 'E', octave: 4, name: '1ª (Mi agudo)' }
]

const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

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
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [micEnabled, setMicEnabled] = useState(false)
  const [useSpanishNotation, setUseSpanishNotation] = useState(true)

  // FIX: useEffect para evitar bucle
  useEffect(() => {
    if (user?.notation_preference) {
      setUseSpanishNotation(user.notation_preference === 'spanish')
    }
  }, [user?.notation_preference])

  const enableAudio = async () => {
    try {
      await guitarRealAudio.initialize()
      setAudioEnabled(true)
    } catch (error) {
      console.error('Error enabling audio:', error)
    }
  }

  const enableMicrophone = async () => {
    console.log('Detección de micrófono deshabilitada temporalmente')
  }

  const getNoteAtFret = (stringIndex: number, fret: number): string => {
    const openNote = GUITAR_STRINGS[stringIndex].note
    const openNoteIndex = CHROMATIC_NOTES.indexOf(openNote)
    const noteIndex = (openNoteIndex + fret) % 12
    return CHROMATIC_NOTES[noteIndex]
  }

  const formatNote = (note: string): string => {
    return useSpanishNotation ? SPANISH_NOTATION[note as keyof typeof SPANISH_NOTATION] : note
  }

  const handleFretClick = async (stringIndex: number, fret: number) => {
    const note = getNoteAtFret(stringIndex, fret)
    setActivePosition({ string: stringIndex, fret, note })
    
    if (audioEnabled) {
      await guitarRealAudio.playNote(stringIndex, fret)
    }
  }

  return (
    <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-medium text-[#e8e8e8]">Guitarra Interactiva</h2>
        <div className="flex items-center space-x-4">
          {!audioEnabled && (
            <button
              onClick={enableAudio}
              className="flex items-center space-x-2 bg-[#5c9eff] hover:opacity-90 text-white px-4 py-2 rounded-lg transition-opacity"
            >
              <Volume2 className="w-4 h-4" />
              <span>Activar Audio</span>
            </button>
          )}
          
          {audioEnabled && !micEnabled && (
            <button
              onClick={enableMicrophone}
              className="flex items-center space-x-2 bg-[#242424] border border-[rgba(255,255,255,0.08)] text-[#a8a8a8] px-4 py-2 rounded-lg opacity-60 cursor-not-allowed"
            >
              <Mic className="w-4 h-4" />
              <span>Próximamente</span>
            </button>
          )}
          
          {micEnabled && (
            <div className="flex items-center space-x-2 text-[#00d4aa]">
              <div className="w-2 h-2 bg-[#00d4aa] rounded-full animate-pulse"></div>
              <span className="text-sm">Detectando</span>
            </div>
          )}
          
          <button
            onClick={() => setUseSpanishNotation(!useSpanishNotation)}
            className="flex items-center space-x-2 bg-[#242424] border border-[rgba(255,255,255,0.08)] text-[#a8a8a8] hover:text-[#e8e8e8] px-4 py-2 rounded-lg transition-colors"
          >
            {useSpanishNotation ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            <span>{useSpanishNotation ? 'Do-Re-Mi' : 'C-D-E'}</span>
          </button>
        </div>
      </div>

      {/* Display de nota activa */}
      {activePosition && (
        <div className="bg-[#242424] border border-[rgba(255,255,255,0.08)] rounded-lg p-6 mb-8 text-center">
          <p className="text-[#6b6b6b] text-sm mb-2">
            {GUITAR_STRINGS[activePosition.string].name} • Traste {activePosition.fret}
          </p>
          <p className="text-4xl font-light text-[#5c9eff] mb-2">
            {formatNote(activePosition.note)}
          </p>
          {micEnabled && (
            <p className="text-sm text-[#00d4aa]">
              Toca tu guitarra para detectar notas automáticamente
            </p>
          )}
        </div>
      )}

      {/* Diapasón - FIX: contenedor estable */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[800px] will-change-auto">
          {/* Números de trastes */}
          <div className="flex mb-4">
            <div className="w-20 flex-shrink-0"></div>
            {Array.from({ length: 13 }, (_, fret) => (
              <div key={fret} className="flex-1 text-center text-xs text-[#6b6b6b] font-medium">
                {fret}
              </div>
            ))}
          </div>

          {/* Cuerdas - FIX: keys estables */}
          {GUITAR_STRINGS.map((string, stringIndex) => (
            <div key={`string-${stringIndex}`} className="flex items-center mb-3">
              {/* Etiqueta */}
              <div className="w-20 flex-shrink-0 text-center">
                <div className="text-sm font-medium text-[#a8a8a8]">
                  {formatNote(string.note)}
                </div>
                <div className="text-xs text-[#6b6b6b]">
                  {stringIndex + 1}ª
                </div>
              </div>

              {/* Trastes */}
              <div className="flex-1 relative h-12">
                <div 
                  className="absolute top-1/2 left-0 right-0 border-t border-[#8b7355]"
                  style={{ 
                    borderWidth: `${1 + stringIndex * 0.3}px`,
                    transform: 'translateY(-50%)'
                  }}
                />

                <div className="flex relative z-10 h-full">
                  {Array.from({ length: 13 }, (_, fret) => (
                    <button
                      key={`${stringIndex}-${fret}`}
                      onClick={() => handleFretClick(stringIndex, fret)}
                      className={`flex-1 h-full relative group transition-all duration-150 ${
                        activePosition?.string === stringIndex && activePosition?.fret === fret
                          ? 'bg-[#5c9eff]/20 border border-[#5c9eff]/50'
                          : 'hover:bg-[rgba(255,255,255,0.02)]'
                      } rounded-sm`}
                    >
                      {/* Barra de traste */}
                      {fret > 0 && (
                        <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#c0c0c0] rounded" />
                      )}

                      {/* Marcadores - FIX: posición absoluta estable */}
                      {[3, 5, 7, 9, 15, 17, 19, 21].includes(fret) && stringIndex === 2 && (
                        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-[#d4af37] rounded-full -translate-x-1/2 -translate-y-1/2" />
                      )}

                      {fret === 12 && (stringIndex === 1 || stringIndex === 4) && (
                        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-[#d4af37] rounded-full -translate-x-1/2 -translate-y-1/2" />
                      )}

                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#242424] text-[#e8e8e8] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 border border-[rgba(255,255,255,0.08)]">
                        {formatNote(getNoteAtFret(stringIndex, fret))}
                      </div>

                      {/* Indicador activo */}
                      {activePosition?.string === stringIndex && activePosition?.fret === fret && (
                        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-[#5c9eff] rounded-full -translate-x-1/2 -translate-y-1/2 border border-white shadow-sm" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instrucciones */}
      <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.06)] text-center">
        <p className="text-[#6b6b6b] text-sm">
          {micEnabled 
            ? "Toca tu guitarra o haz clic en los trastes para identificar notas"
            : "Haz clic en cualquier traste para ver y escuchar la nota"
          }
        </p>
        <p className="text-[#6b6b6b] text-xs mt-2">
          Afinación: {GUITAR_STRINGS.map(s => formatNote(s.note)).join(' • ')}
        </p>
      </div>
    </div>
  )
}