// src/lib/supabase/client.ts - MEJORADO
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // ✅ Verificar variables antes de crear cliente
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) {
    throw new Error('❌ NEXT_PUBLIC_SUPABASE_URL no está definida')
  }

  if (!key) {
    throw new Error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida')
  }

  console.log('🔍 Creando cliente Supabase...')
  console.log('📍 URL:', url)
  console.log('🔑 Key (últimos 4):', key.slice(-4))

  return createBrowserClient(url, key, {
    auth: {
      // ✅ Configuraciones para mejorar compatibilidad
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  })
}

export const supabase = createClient()