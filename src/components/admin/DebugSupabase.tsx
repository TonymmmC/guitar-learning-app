// src/components/admin/DebugSupabase.tsx - Componente temporal para debugging
'use client'

import { useState } from 'react'
import { userService } from '@/lib/admin/userService'
import { supabase } from '@/lib/supabase/client'
import { Bug, Database, User } from 'lucide-react'

interface DebugInfo {
  connection?: boolean
  sampleStructure?: string[]
  canRead?: boolean
  canInsert?: boolean
  canUpdate?: boolean
  canDelete?: boolean
  currentUser?: string
  errors?: {
    read?: string
    insert?: string
  }
  error?: string
}

export default function DebugSupabase() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const runDebug = async () => {
    setLoading(true)
    console.clear()
    console.log('🔧 === INICIANDO DEBUG DE SUPABASE ===')
    
    try {
      // 1. Verificar conexión
      console.log('1️⃣ Verificando conexión a Supabase...')
      const { data: connectionTest } = await supabase.from('profiles').select('count').limit(1)
      console.log('Conexión:', connectionTest ? '✅ OK' : '❌ FALLO')
      
      // 2. Obtener estructura de tabla
      console.log('2️⃣ Obteniendo estructura de tabla...')
      const { data: sampleUser } = await supabase.from('profiles').select('*').limit(1).single()
      console.log('Estructura detectada:', Object.keys(sampleUser || {}))
      
      // 3. Verificar RLS policies
      console.log('3️⃣ Verificando políticas RLS...')
      const { data: users, error: usersError } = await supabase.from('profiles').select('*').limit(5)
      console.log('Puede leer usuarios:', !usersError ? '✅ SÍ' : '❌ NO')
      console.log('Error RLS:', usersError?.message)
      
      // 4. Probar inserción
      console.log('4️⃣ Probando inserción...')
      const testUser = {
        id: `test_${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        full_name: 'Usuario Test',
        role: 'student',
        subscription_status: 'free',
        language: 'es',
        notation_preference: 'spanish',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data: insertResult, error: insertError } = await supabase
        .from('profiles')
        .insert(testUser)
        .select()
        .single()
      
      console.log('Inserción:', !insertError ? '✅ OK' : '❌ FALLO')
      console.log('Error inserción:', insertError?.message)
      
      // Si la inserción funcionó, probar actualización y eliminación
      if (insertResult) {
        console.log('5️⃣ Probando actualización...')
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ full_name: 'Usuario Test Actualizado' })
          .eq('id', testUser.id)
        
        console.log('Actualización:', !updateError ? '✅ OK' : '❌ FALLO')
        console.log('Error actualización:', updateError?.message)
        
        console.log('6️⃣ Probando eliminación...')
        const { error: deleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', testUser.id)
        
        console.log('Eliminación:', !deleteError ? '✅ OK' : '❌ FALLO')
        console.log('Error eliminación:', deleteError?.message)
      }
      
      // 7. Verificar usuario actual
      console.log('7️⃣ Verificando usuario autenticado...')
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Usuario autenticado:', user?.email || 'No hay usuario')
      console.log('Role del usuario:', user?.user_metadata?.role || 'No definido')
      
      setDebugInfo({
        connection: !!connectionTest,
        sampleStructure: Object.keys(sampleUser || {}),
        canRead: !usersError,
        canInsert: !insertError,
        canUpdate: insertResult && !insertError,
        canDelete: insertResult && !insertError,
        currentUser: user?.email,
        errors: {
          read: usersError?.message,
          insert: insertError?.message,
        }
      })
      
      console.log('✅ DEBUG COMPLETADO - Revisa la consola para detalles')
      
    } catch (error) {
      console.error('💥 Error durante debug:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setDebugInfo({ error: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <Bug className="w-5 h-5 text-[#ff8a50]" />
        <h3 className="text-lg font-semibold text-[#e8e8e8]">Debug Supabase</h3>
      </div>
      
      <p className="text-[#a8a8a8] text-sm mb-4">
        Este componente verifica la conexión y permisos de Supabase. Revisa la consola del navegador para detalles.
      </p>
      
      <button
        onClick={runDebug}
        disabled={loading}
        className="bg-[#ff8a50] hover:opacity-90 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-opacity flex items-center space-x-2"
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        )}
        <Database className="w-4 h-4" />
        <span>{loading ? 'Diagnosticando...' : 'Ejecutar Diagnóstico'}</span>
      </button>
      
      {debugInfo && (
        <div className="mt-6 bg-[#242424] rounded-lg p-4">
          <h4 className="font-medium text-[#e8e8e8] mb-2">Resultados:</h4>
          <pre className="text-xs text-[#a8a8a8] overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-4 text-xs text-[#6b6b6b]">
        <p>⚠️ Este componente es solo para debugging. Elimínalo en producción.</p>
      </div>
    </div>
  )
}