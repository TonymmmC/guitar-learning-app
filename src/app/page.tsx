'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { testWebAudio, testToneJS } from '@/lib/audio/test'

export default function Home() {
  const [connected, setConnected] = useState<boolean | null>(null)
  const [audioSupport, setAudioSupport] = useState(false)

  useEffect(() => {
    // Probar Supabase
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1)
        setConnected(!error)
      } catch (error) {
        setConnected(false)
      }
    }

    // Probar Web Audio
    const testAudio = () => {
      try {
        testWebAudio()
        testToneJS()
        setAudioSupport(true)
      } catch (error) {
        console.error('Audio error:', error)
        setAudioSupport(false)
      }
    }

    testConnection()
    testAudio()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Guitar Learning App</h1>
      <div className="space-y-2">
        <div>
          Supabase: {connected === null ? (
            <span className="text-yellow-600">Conectando...</span>
          ) : connected ? (
            <span className="text-green-600">✅ Conectado</span>
          ) : (
            <span className="text-red-600">❌ Error</span>
          )}
        </div>
        <div>
          Audio Support: {audioSupport ? (
            <span className="text-green-600">✅ Web Audio Ready</span>
          ) : (
            <span className="text-red-600">❌ Audio Error</span>
          )}
        </div>
      </div>
    </div>
  )
}