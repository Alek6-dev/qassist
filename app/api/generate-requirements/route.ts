import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export const runtime = 'nodejs'

async function insertRequirements(
  supabase: any,
  projectId: string,
  items: Array<{ req_code: string; description: string }>
) {
  const requirementsToInsert = items.map(item => ({
    project_id: projectId,
    req_code: item.req_code,
    description: item.description,
  }))

  const { data, error } = await supabase
    .from('requirements')
    .insert(requirementsToInsert)
    .select()

  if (error) {
    throw error
  }

  return data
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { specification } = body

    if (!specification || typeof specification !== 'string' || specification.trim() === '') {
      return NextResponse.json(
        { error: 'Specification is required and must be a non-empty string' },
        { status: 400 }
      )
    }

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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

        const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title: 'New Project',
        original_spec: specification,
      })
      .select()
      .single()

        if (error) {
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      )
    }
 // Appel à l'API Anthropic
    let aiRaw: any
    try {

const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim()
console.log("Calling:", "https://api.anthropic.com/v1/messages")
const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01"
  },
  body: JSON.stringify({
    model: "claude-3-haiku-20240307",
    max_tokens: 400,
    messages: [
      { role: "user", content: `Génère des exigences fonctionnelles en français.
      Retourne UNIQUEMENT un JSON valide.
      N'ajoute aucun texte avant ou après le JSON.
      {"requirements":[{"id":"REQ-001","description":"..."}]}
        Specification:
        ${specification}` }
    ]
  })
})

if (!anthropicResponse.ok) {
  const errorText = await anthropicResponse.text()
  console.log("RAW ERROR:", errorText)
  return NextResponse.json(
    { error: 'Failed to call AI API' },
    { status: 500 }
  )
}

aiRaw = await anthropicResponse.json()
console.log("AI Response status:", anthropicResponse.status)
    } catch (error) {
      console.error('Erreur lors de l\'appel à l\'API Anthropic:', error)
      return NextResponse.json(
        { error: 'Failed to call AI API' },
        { status: 500 }
      )
    }

    // Extraction du texte
    const text = aiRaw.content?.[0]?.text ?? ''
    console.log("AI text preview:", text.slice(0, 200))
    
    if (!text) {
      return NextResponse.json(
        { error: 'AI output is empty' },
        { status: 422 }
      )
    }

    // Extraction robuste du JSON    
    function extractJSON(raw: string): string | null {
      // Retirer les fences markdown
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '')
      
      // Trouver le premier { ou [
      const startChar = cleaned.search(/[{\[]/);
      if (startChar === -1) return null
      
      const openChar = cleaned[startChar]
      const closeChar = openChar === '{' ? '}' : ']'
      
      let depth = 0
      let endChar = -1
      
      for (let i = startChar; i < cleaned.length; i++) {
        if (cleaned[i] === openChar) {
          depth++
        } else if (cleaned[i] === closeChar) {
          depth--
          if (depth === 0) {
            endChar = i
            break
          }
        }
      }
      
      if (endChar === -1) return null
      
      return cleaned.slice(startChar, endChar + 1)
    }

    const jsonStr = extractJSON(text)
    if (!jsonStr) {
      return NextResponse.json(
        { error: 'AI output does not contain valid JSON structure' },
        { status: 422 }
      )
    }

    // Parsing JSON
    let parsed: any
    try {
      parsed = JSON.parse(jsonStr)
        } catch {
      return NextResponse.json(
        { error: 'AI output is not valid JSON' },
        { status: 422 }
      )
    }

    // Validation de la structure
    if (!Array.isArray(parsed.requirements)) {
      return NextResponse.json(
        { error: 'AI output is missing requirements array' },
        { status: 422 }
      )
    }

    for (const item of parsed.requirements) {
      if (
        typeof item.id !== 'string' ||
        item.id.trim() === '' ||
        typeof item.description !== 'string' ||
        item.description.trim() === ''
      ) {
        return NextResponse.json(
          { error: 'AI output contains invalid requirement data' },
          { status: 422 }
        )
      }
    }

    // Mapping au format DB
    const mappedItems = parsed.requirements.map((item: any) => ({
      req_code: item.id,
      description: item.description,
    }))

    // Insertion en DB
    let requirements
    try {
      requirements = await insertRequirements(supabase, project.id, mappedItems)
    } catch {
      return NextResponse.json(
        { error: 'Failed to create requirements' },
        { status: 500 }
      )
     }

return NextResponse.json({ project, requirements }, { status: 200 })

  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    )
  }
}