import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import crypto from 'crypto'
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
    try {

const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim()
console.log("ENV RAW:", process.env.ANTHROPIC_API_KEY)
console.log('[DEBUG] key hash:', crypto.createHash('sha256').update(apiKey).digest('hex').slice(0, 12))
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
    max_tokens: 10,
    messages: [
      { role: "user", content: "Say hello" }
    ]
  })
})

if (!anthropicResponse.ok) {
  const errorText = await anthropicResponse.text()
  console.log("RAW ERROR:", errorText)
  throw new Error(`Anthropic API error: ${anthropicResponse.status}`)
}

const aiRaw = await anthropicResponse.json()
console.log("SUCCESS RAW:", aiRaw)
    } catch (error) {
      console.error('Erreur lors de l\'appel à l\'API Anthropic:', error)
    }

    let requirements
    try {
      requirements = await insertRequirements(supabase, project.id, [
        {
          req_code: 'REQ-001',
          description: 'User can create an account',
        },
        {
          req_code: 'REQ-002',
          description: 'User can login',
        },
      ])
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