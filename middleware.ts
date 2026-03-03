import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  }
)

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  // DEBUG (dans le terminal)
  const cookieNames = request.cookies.getAll().map((c) => c.name)
  console.log("---- MIDDLEWARE DEBUG ----")
  console.log("PATH:", request.nextUrl.pathname)
  console.log("HAS SESSION:", !!session)
  console.log("SESSION ERROR:", error?.message ?? null)
  console.log(
    "COOKIES:",
    cookieNames.filter(
      (n) => n.includes("sb-") || n.includes("supabase") || n.includes("auth")
    )
  )
  console.log("--------------------------")

  const isProtected =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/project")

  if (isProtected && !session) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/project/:path*"],
}