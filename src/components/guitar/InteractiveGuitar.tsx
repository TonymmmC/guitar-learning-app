// src/components/guitar/InteractiveGuitar.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/context'
import { guitarRealAudio } from '@/lib/guitar/guitarRealAudio'

// Cuerdas de guitarra CORRECTAS (6ª a 1ª = grave a aguda)
const GUITAR_STRINGS = [
  { note: 'E', octave: 2, name: '6ª (Mi grave)' },  // Cuerda más grave
  { note: 'A', octave: 2, name: '5ª (La)' },
  { note: 'D', octave: 3, name: '4ª (Re)' },
  { note: 'G', octave: 3, name: '3ª (Sol)' },
  { note: 'B', octave: 3, name: '2ª (Si)' },
  { note: 'E', octave: 4, name: '1ª (Mi agudo)' }   // Cuerda más aguda
]

// Notas cromáticas
const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Notación española
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
  const [detectedNote, setDetectedNote] = useState<string | null>(null)
  const [useSpanishNotation, setUseSpanishNotation] = useState(
    user?.notation_preference === 'spanish'
  )

  // Activar audio
  const enableAudio = async () => {
    try {
      await guitarRealAudio.initialize()
      setAudioEnabled(true)
    } catch (error) {
      console.error('Error enabling audio:', error)
    }
  }

  // TODO: Activar micrófono más tarde
  const enableMicrophone = async () => {
    console.log('Detección de micrófono deshabilitada temporalmente')
  }

  // Calcular nota en traste específico
  const getNoteAtFret = (stringIndex: number, fret: number): string => {
    const openNote = GUITAR_STRINGS[stringIndex].note
    const openNoteIndex = CHROMATIC_NOTES.indexOf(openNote)
    const noteIndex = (openNoteIndex + fret) % 12
    return CHROMATIC_NOTES[noteIndex]
  }

  // Formatear nota según preferencia
  const formatNote = (note: string): string => {
    return useSpanishNotation ? SPANISH_NOTATION[note as keyof typeof SPANISH_NOTATION] : note
  }

  // Manejar click en traste
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#e8e8e8]">Guitarra Interactiva</h2>
        <div className="flex items-center space-x-3">
          {!audioEnabled && (
            <button
              onClick={enableAudio}
              className="bg-[#00d4aa] hover:opacity-90 text-white px-3 py-2 rounded-lg transition-opacity text-sm"
            >
              🔊 Activar Audio
            </button>
          )}
          {!micEnabled && audioEnabled && (
            <button
              onClick={enableMicrophone}
              className="bg-[#ff8a50] hover:opacity-90 text-white px-3 py-2 rounded-lg transition-opacity text-sm"
            >
              🎤 Detectar Guitarra
            </button>
          )}
          {micEnabled && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 text-sm">Escuchando</span>
            </div>
          )}
          <button
            onClick={() => setUseSpanishNotation(!useSpanishNotation)}
            className="bg-[#5c9eff] hover:opacity-90 text-white px-4 py-2 rounded-lg transition-opacity text-sm"
          >
            {useSpanishNotation ? 'Do-Re-Mi' : 'C-D-E'}
          </button>
        </div>
      </div>

      {/* Display de nota activa */}
      {activePosition && (
        <div className="bg-[#242424] rounded-lg p-4 mb-6 text-center">
          <p className="text-[#a8a8a8] text-sm mb-1">
            {GUITAR_STRINGS[activePosition.string].name} • Traste {activePosition.fret}
          </p>
          <p className="text-3xl font-bold text-[#5c9eff]">
            {formatNote(activePosition.note)}
          </p>
          {micEnabled && (
            <p className="text-sm text-[#00d4aa] mt-2">
              ¡Toca tu guitarra y verás las notas aquí!
            </p>
          )}
        </div>
      )}

      {/* Diapasón de guitarra */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Números de trastes */}
          <div className="flex mb-2">
            <div className="w-16"></div>
            {Array.from({ length: 13 }, (_, fret) => (
              <div key={fret} className="flex-1 text-center text-xs text-[#6b6b6b]">
                {fret}
              </div>
            ))}
          </div>

          {/* Cuerdas (de grave a aguda visualmente) */}
          {GUITAR_STRINGS.map((string, stringIndex) => (
            <div key={stringIndex} className="flex items-center mb-2">
              {/* Etiqueta de cuerda */}
              <div className="w-16 text-center text-sm">
                <div className="font-medium text-[#a8a8a8]">
                  {formatNote(string.note)}
                </div>
                <div className="text-xs text-[#6b6b6b]">
                  {stringIndex + 1}ª
                </div>
              </div>

              {/* Línea de cuerda con trastes */}
              <div className="flex-1 relative">
                {/* Línea de la cuerda */}
                <div 
                  className="absolute top-1/2 left-0 right-0 border-t border-[#8b7355]"
                  style={{ 
                    borderWidth: `${1 + stringIndex * 0.5}px`, // Más gruesa = más grave
                    transform: 'translateY(-50%)'
                  }}
                />

                {/* Trastes */}
                <div className="flex relative z-10">
                  {Array.from({ length: 13 }, (_, fret) => (
                    <button
                      key={fret}
                      onClick={() => handleFretClick(stringIndex, fret)}
                      className={`flex-1 h-10 relative group transition-colors ${
                        activePosition?.string === stringIndex && activePosition?.fret === fret
                          ? 'bg-[#5c9eff]/30 border-2 border-[#5c9eff]'
                          : 'hover:bg-[rgba(255,255,255,0.05)]'
                      } rounded-sm`}
                    >
                      {/* Barra de traste */}
                      {fret > 0 && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#c0c0c0] rounded" />
                      )}

                      {/* Marcadores de posición */}
                      {[3, 5, 7, 9, 15, 17, 19, 21].includes(fret) && stringIndex === 2 && (
                        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#d4af37] rounded-full transform -translate-x-1/2 -translate-y-1/2" />
                      )}

                      {/* Doble punto para traste 12 */}
                      {fret === 12 && (stringIndex === 1 || stringIndex === 4) && (
                        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-[#d4af37] rounded-full transform -translate-x-1/2 -translate-y-1/2" />
                      )}

                      {/* Preview de nota al hover */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#242424] text-[#e8e8e8] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                        {formatNote(getNoteAtFret(stringIndex, fret))}
                      </div>

                      {/* Círculo indicador en posición activa */}
                      {activePosition?.string === stringIndex && activePosition?.fret === fret && (
                        <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-[#5c9eff] rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-lg" />
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
      <div className="mt-6 text-center text-[#6b6b6b] text-sm">
        {micEnabled ? (
          <div>
            <p className="text-[#e8e8e8] mb-2">🎸 ¡Toca tu guitarra!</p>
            <p>Las notas detectadas se marcarán automáticamente en el diapasón</p>
            <p className="mt-1">También puedes hacer click en los trastes para escuchar las notas</p>
          </div>
        ) : (
          <div>
            <p>Haz click en cualquier traste para ver y escuchar la nota</p>
            <p className="mt-1">Activa el micrófono para detectar tu guitarra automáticamente</p>
          </div>
        )}
        <p className="mt-2 text-[#a8a8a8]">
          Afinación estándar: {GUITAR_STRINGS.map(s => formatNote(s.note)).join(' - ')} (grave → aguda)
        </p>
      </div>
    </div>
  )
}