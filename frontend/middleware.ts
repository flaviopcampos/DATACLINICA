import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas que requerem autenticação
const protectedRoutes = [
  '/dashboard',
  '/patients',
  '/appointments',
  '/profile',
  '/settings'
]

// Rotas de autenticação (redirecionam se já autenticado)
const authRoutes = [
  '/auth/login',
  '/auth/forgot-password'
]

// Rotas públicas que não precisam de verificação
const publicRoutes = [
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Verificar se é uma rota de autenticação
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.includes(pathname) || 
                       pathname.startsWith('/api/') ||
                       pathname.startsWith('/_next/') ||
                       pathname.startsWith('/favicon.ico')

  // Se não tem token e está tentando acessar rota protegida
  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Se tem token e está tentando acessar rota de auth
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Para rotas protegidas com token, verificar se o token é válido
  if (token && isProtectedRoute) {
    // Aqui você pode adicionar validação adicional do token se necessário
    // Por exemplo, verificar se não expirou
    try {
      // Decodificar JWT para verificar expiração (opcional)
      // const payload = JSON.parse(atob(token.split('.')[1]))
      // const isExpired = payload.exp * 1000 < Date.now()
      // if (isExpired) {
      //   const response = NextResponse.redirect(new URL('/auth/login', request.url))
      //   response.cookies.delete('token')
      //   return response
      // }
    } catch (error) {
      // Token inválido, redirecionar para login
      const response = NextResponse.redirect(new URL('/auth/login', request.url))
      response.cookies.delete('token')
      return response
    }
  }

  // Permitir acesso para rotas públicas e outras não especificadas
  return NextResponse.next()
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}