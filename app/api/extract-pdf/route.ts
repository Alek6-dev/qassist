import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { PDFParse } from 'pdf-parse'

export const runtime = 'nodejs'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    // ── Auth ─────────────────────────────────────────────────────────────────
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

    // ── Parse file ───────────────────────────────────────────────────────────
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Le fichier doit être un PDF.' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Le fichier dépasse la limite de 5MB.' }, { status: 400 })
    }

    // ── Extract text ─────────────────────────────────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer())
    const parser = new PDFParse({ data: buffer })
    const result = await parser.getText()
    await parser.destroy()
    const text = result.text.trim()

    if (!text) {
      return NextResponse.json(
        { error: 'Aucun texte lisible n\'a été trouvé dans ce PDF.' },
        { status: 422 }
      )
    }

    return NextResponse.json({ text })
  } catch (error) {
    console.error('[extract-pdf] Error:', error)
    return NextResponse.json({ error: 'Échec de l\'extraction du PDF.' }, { status: 500 })
  }
}
