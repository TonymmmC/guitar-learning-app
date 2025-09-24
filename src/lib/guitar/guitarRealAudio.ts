// src/lib/guitar/guitarRealAudio.ts
import * as Tone from 'tone'

class GuitarRealAudio {
  private synth: Tone.PluckSynth | null = null
  private isInitialized = false

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      await Tone.start()
      
      // 🎸 Guitarra clásica con cuerdas de nylon - sonido suave
      this.synth = new Tone.PluckSynth({
        attackNoise: 0.5,     // Menos ruido de púa (dedos vs púa)
        dampening: 3000,      // Menos metálico, más orgánico
        resonance: 0.95       // Resonancia cálida de caja clásica
      })

      // Filtro suave para nylon strings
      const filter = new Tone.Filter({
        frequency: 3000,      // Frecuencias más cálidas
        type: "lowpass",
        rolloff: -24
      })

      // Reverb tipo sala de conciertos
      const reverb = new Tone.Reverb({
        decay: 2.5,           // Decay largo como sala
        wet: 0.3              // Más reverb para calidez
      })
      
      await reverb.generate()
      
      // Cadena de efectos para sonido clásico suave
      this.synth.connect(filter)
      filter.connect(reverb) 
      reverb.toDestination()

      this.isInitialized = true
    } catch (error) {
      console.error('Error initializing guitar audio:', error)
      throw error
    }
  }

  async playNote(stringIndex: number, fret: number): Promise<void> {
    if (!this.synth) {
      await this.initialize()
    }

    try {
      const { note, octave } = this.getStringNote(stringIndex, fret)
      const noteWithOctave = `${note}${octave}`
      
      // Tocar la nota con duración limitada (como guitarra real)
      this.synth?.triggerAttackRelease(noteWithOctave, "2n")
    } catch (error) {
      console.error('Error playing note:', error)
    }
  }

  private getStringNote(stringIndex: number, fret: number) {
    // Cuerdas correctas: 6ª a 1ª (grave a agudo)
    const strings = [
      { note: 'E', octave: 2 }, // 6ª cuerda (más grave)
      { note: 'A', octave: 2 }, // 5ª cuerda
      { note: 'D', octave: 3 }, // 4ª cuerda
      { note: 'G', octave: 3 }, // 3ª cuerda
      { note: 'B', octave: 3 }, // 2ª cuerda
      { note: 'E', octave: 4 }  // 1ª cuerda (más aguda)
    ]

    const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const baseString = strings[stringIndex]
    const baseNoteIndex = chromatic.indexOf(baseString.note)
    
    const totalSemitones = baseNoteIndex + fret
    const finalNoteIndex = totalSemitones % 12
    const octaveShift = Math.floor(totalSemitones / 12)
    
    return {
      note: chromatic[finalNoteIndex],
      octave: baseString.octave + octaveShift
    }
  }

  dispose(): void {
    if (this.synth) {
      this.synth.dispose()
      this.synth = null
    }
    this.isInitialized = false
  }
}

export const guitarRealAudio = new GuitarRealAudio()