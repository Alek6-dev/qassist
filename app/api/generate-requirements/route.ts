import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { parseAIJson } from '@/lib/ai/parseAIJson'
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
    max_tokens: 2000,
    messages: [
      { role: "user", content: `Tu es un analyste fonctionnel. Génère les exigences fonctionnelles en français à partir de la spécification ci-dessous.

FORMAT DE SORTIE — JSON STRICT, aucun texte avant ou après, aucun markdown :
{"requirements":[{"id":"REQ-001","description":"Une phrase claire décrivant l'exigence."},{"id":"REQ-002","description":"..."}]}

RÈGLES ABSOLUES :
- Le JSON doit contenir UNIQUEMENT la clé "requirements" contenant un tableau d'objets.
- Chaque objet doit avoir EXACTEMENT deux champs : "id" (string, format REQ-001, REQ-002…) et "description" (string, non vide).
- N'utilise JAMAIS d'autres noms de champs (pas "req_code", pas "title", pas "name").
- Chaque "description" est une phrase unique, claire et testable.
- Aucune clé supplémentaire, aucun commentaire, aucun texte hors du JSON.

Spécification :
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

    // Parse AI output (tolerant: cleans + retries via AI repair if needed)
    let parsed: any
    try {
      parsed = await parseAIJson(text, (process.env.ANTHROPIC_API_KEY || '').trim())
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 422 })
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

    // Génération des clarifications
    try {
      const clarApiKey = (process.env.ANTHROPIC_API_KEY || '').trim()
      const requirementsList = requirements
        .map((r: any) => `- ${r.req_code}: ${r.description}`)
        .join('\n')

      const clarResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": clarApiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 900,
          messages: [
            {
              role: "user",
              content: `Tu es un analyste QA senior. Analyse les exigences suivantes et identifie uniquement les ambiguïtés réelles qui empêcheraient un testeur d'écrire des cas de test.

RÈGLES STRICTES :
- N'inclus une clarification QUE si l'exigence contient : une information manquante, un comportement non défini, une règle métier floue, une valeur ou condition non spécifiée.
- Formule chaque clarification comme une question sur l'information manquante, ou comme un constat d'ambiguïté précis.
- NE JAMAIS reformuler ou paraphraser l'exigence. Ce n'est pas une clarification.
- Si une exigence est claire et testable telle quelle, ne génère PAS de clarification pour elle.
- Le tableau "clarifications" peut être vide si toutes les exigences sont claires.

Exemples de BONNES clarifications :
- "Quel indicateur visuel doit signaler la présence d'une nouvelle notification (badge, couleur, animation) ?"
- "Quels types de notifications doivent rediriger l'utilisateur vers une autre page ?"
- "Combien de temps les notifications doivent-elles être conservées dans le système ?"

Exemples de MAUVAISES clarifications (à ne pas produire) :
- "Cette exigence indique que l'utilisateur doit pouvoir cliquer sur l'icône de notification." ← simple reformulation

Retourne UNIQUEMENT un JSON valide, sans texte avant ni après.
Format strict :
{"clarifications":[{"type":"ambiguity","element_reference":"REQ-001","explanation":"...","recommendation":"..."}]}

Exigences :
${requirementsList}`
            }
          ]
        })
      })

      if (clarResponse.ok) {
        const clarRaw = await clarResponse.json()
        const clarText = clarRaw.content?.[0]?.text ?? ''

        if (clarText) {
          try {
            const parsedClar = await parseAIJson(clarText, clarApiKey)
            if (Array.isArray(parsedClar.clarifications)) {
              const clarificationsToInsert = parsedClar.clarifications.map((c: any) => ({
                project_id: project.id,
                type: c.type,
                element_reference: c.element_reference,
                explanation: c.explanation,
                recommendation: c.recommendation,
              }))
              await supabase.from('clarifications').insert(clarificationsToInsert)
            }
          } catch {
            // non-fatal: clarifications are best-effort
          }
        }
      }
    } catch (err) {
      console.error('Erreur lors de la génération des clarifications:', err)
    }

return NextResponse.json({ project, requirements }, { status: 200 })

  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    )
  }
}