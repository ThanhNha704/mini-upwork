import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  // Lấy thông tin user hiện tại
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.user_metadata?.role // Lấy role từ metadata đã lưu khi đăng ký

  const url = request.nextUrl.clone()
  const path = url.pathname

  // Nếu chưa đăng nhập (Guest) mà cố vào dashboard
  if (!user && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Nếu đã đăng nhập mà cố vào lại trang login/register
  if (user && path.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Nếu đã đăng nhập mà cố vào lại trang landing page
  const isPublicPage = url.pathname === '/';
  if (user && isPublicPage) {
    return NextResponse.redirect(new URL(`/dashboard/${role.toLowerCase()}`, request.url))
  }

  // Chặn chéo giữa Freelancer và Client
  if (user) {
    if (path.startsWith('/dashboard/client') && role !== 'CLIENT') {
      return NextResponse.redirect(new URL('/dashboard/freelancer', request.url))
    }

    if (path.startsWith('/dashboard/freelancer') && role !== 'FREELANCER') {
      return NextResponse.redirect(new URL('/dashboard/client/', request.url))
    }
  }

  return response
}

// Chỉ chạy middleware cho các route Dashboard và Auth
export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*', '/'],
}