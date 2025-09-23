// app/api/admin/users/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Cliente admin con service_role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⚠️ Esta key la tienes en Supabase Dashboard
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    // Verificar que quien llama es admin
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Extraer token del header
    const token = authHeader.replace('Bearer ', '')
    
    // Verificar token con Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Verificar que el usuario es admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['superadmin', 'content_admin', 'support_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    // Obtener datos del body
    const userData = await request.json()

    // 🎯 CREAR usuario con Admin API (SIN afectar sesión del admin)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        full_name: userData.full_name || ''
      }
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    if (!newUser.user) {
      return NextResponse.json({ error: 'No se pudo crear usuario' }, { status: 400 })
    }

    // Crear perfil en profiles
    const profileData = {
      id: newUser.user.id,
      email: userData.email,
      full_name: userData.full_name || null,
      role: userData.role || 'student',
      subscription_status: 'free',
      language: userData.language || 'es',
      notation_preference: userData.notation_preference || 'spanish',
      deleted_at: null
    }

    const { data: profile_result, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData)
      .select()
      .single()

    if (profileError) {
      // Si falla el perfil, eliminar el usuario auth
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json({ error: 'Error creando perfil' }, { status: 400 })
    }

    return NextResponse.json({ 
      data: profile_result,
      message: 'Usuario creado exitosamente' 
    })

  } catch (error) {
    console.error('Error en API de creación:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}