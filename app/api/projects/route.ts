import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: () => {},
          remove: () => {},
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title: body.name,
        description: body.description
      })
      .select()

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ data }, { status: 200 })

  } catch (err) {
    console.error('[projects] Unexpected error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
