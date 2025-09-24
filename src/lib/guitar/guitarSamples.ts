// src/lib/guitar/guitarSamples.ts
import * as Tone from 'tone'

class GuitarSamples {
  private sampler: Tone.Sampler | null = null
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return

    try {
      await Tone.start()
      
      // Usar samples de guitarra clásica (necesitas estos archivos)
      this.sampler = new Tone.Sampler({
        urls: {
          "E2": "/audio/guitar/E2.mp3",
          "A2": "/audio/guitar/A2.mp3", 
          "D3": "/audio/guitar/D3.mp3",
          "G3": "/audio/guitar/G3.mp3",
          "B3": "/audio/guitar/B3.mp3",
          "E4": "/audio/guitar/E4.mp3",
        },
        release: 1,
        onload: () => {
          console.log('🎸 Samples de guitarra cargados')
        }
      }).toDestination()

      this.isInitialized = true
    } catch (error) {
      console.error('Error cargando samples:', error)
      // Fallback a síntesis mejorada
      await this.initializeSynthesis()
    }
  }

  private async initializeSynthesis() {
    // Síntesis mejorada si no hay samples
    this.sampler = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3.01,
      modulationIndex: 14,
      oscillator: {
        type: "sawtooth"
      },
      envelope: {
        attack: 0.005,
        decay: 0.3,
        sustain: 0.1,
        release: 2.5
      },
      modulation: {
        type: "triangle"
      },
      modulationEnvelope: {
        attack: 0.01,
        decay: 0.5,
        sustain: 0.2,
        release: 0.5
      }
    }).toDestination()

    // Efectos para simular cuerpo de guitarra
    const chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination()
    const reverb = new Tone.Reverb(1.5).toDestination()
    
    this.sampler.connect(chorus)
    this.sampler.connect(reverb)
  }

  private getNoteFromFret(stringIndex: number, fret: number): string {
    const strings = ["E4", "B3", "G3", "D3", "A2", "E2"]
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    const baseNote = strings[stringIndex]
    const baseNoteIndex = notes.indexOf(baseNote.slice(0, -1))
    const baseOctave = parseInt(baseNote.slice(-1))
    
    const noteIndex = (baseNoteIndex + fret) % 12
    const octave = baseOctave + Math.floor((baseNoteIndex + fret) / 12)
    
    return notes[noteIndex] + octave
  }

  async playNote(stringIndex: number, fret: number) {
    if (!this.isInitialized) await this.initialize()
    if (!this.sampler) return

    const note = this.getNoteFromFret(stringIndex, fret)
    this.sampler.triggerAttackRelease(note, "2n")
  }

  dispose() {
    if (this.sampler) {
      this.sampler.dispose()
      this.sampler = null
    }
    this.isInitialized = false
  }
}

export const guitarSamples = new GuitarSamples()