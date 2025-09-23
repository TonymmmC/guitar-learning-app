// middleware.ts - CORREGIDO con roles múltiples
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Tipos de roles que pueden acceder al admin
type AdminRole = 'superadmin' | 'content_admin' | 'support_admin'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isAuthPage = url.pathname.startsWith('/auth')
  const isProtectedPage = url.pathname.startsWith('/dashboard') || 
                          url.pathname.startsWith('/admin')
  const isAdminPage = url.pathname.startsWith('/admin')

  // Si está autenticado y va a auth, redirect a dashboard
  if (user && isAuthPage) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Si NO está autenticado y va a página protegida, redirect a login
  if (!user && isProtectedPage) {
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // 🎯 AQUÍ ESTÁ LA CORRECCIÓN PRINCIPAL
  if (user && isAdminPage) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // Lista de roles que pueden acceder al admin
      const adminRoles: AdminRole[] = ['superadmin', 'content_admin', 'support_admin']
      
      // Verificar si el rol del usuario está en la lista de roles admin
      if (!profile || !adminRoles.includes(profile.role as AdminRole)) {
        console.log(`Access denied for role: ${profile?.role}`)
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
      
      console.log(`Admin access granted for role: ${profile.role}`)
    } catch (error) {
      console.error('Error checking admin role:', error)
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}