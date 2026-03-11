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
      { role: "user", content: `Tu es un analyste fonctionnel QA senior. Génère les exigences fonctionnelles en français à partir de la spécification ci-dessous.

FORMAT DE SORTIE — JSON STRICT, aucun texte avant ou après, aucun markdown :
{"requirements":[{"id":"REQ-001","description":"Une phrase courte et atomique."},{"id":"REQ-002","description":"..."}]}

RÈGLE FONDAMENTALE — ATOMICITÉ (OBLIGATOIRE) :
1 règle fonctionnelle = 1 exigence. C'est la règle la plus importante.

- Si une phrase source décrit plusieurs comportements, tu DOIS la diviser en autant d'exigences séparées.
- Chaque exigence doit pouvoir être testée de façon totalement indépendante des autres.
- Une exigence ne doit JAMAIS contenir les mots "et", "ainsi que", "également", "de plus" pour relier deux règles distinctes.

EXEMPLE DE MAUVAISE EXIGENCE (INTERDIT) :
"Le système doit permettre la création d'un compte, valider que l'email est unique et afficher un message de confirmation."

EXEMPLE CORRECT (3 exigences atomiques) :
REQ-001 → "Le système doit permettre à un utilisateur de créer un compte."
REQ-002 → "Le système doit s'assurer que l'adresse email est unique."
REQ-003 → "Le système doit afficher un message de confirmation après la création du compte."

RÈGLES ABSOLUES :
- Le JSON doit contenir UNIQUEMENT la clé "requirements" contenant un tableau d'objets.
- Chaque objet doit avoir EXACTEMENT deux champs : "id" (string, format REQ-001, REQ-002…) et "description" (string, non vide).
- N'utilise JAMAIS d'autres noms de champs (pas "req_code", pas "title", pas "name").
- Chaque "description" est une phrase courte, atomique et testable individuellement.
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
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: `Réponds UNIQUEMENT avec un tableau JSON valide. Aucun texte avant ni après. Aucune explication. Commence directement par "[".

Tu es un analyste QA senior spécialisé dans la revue de spécifications fonctionnelles.

Ta mission est d'identifier toutes les ambiguïtés, imprécisions ou informations manquantes qui empêcheraient un testeur d'écrire des cas de test précis et reproductibles.

IMPORTANT :
Une spécification imparfaite doit produire des clarifications.
Si un requirement contient un terme vague ou subjectif, il doit être signalé.

Considère comme ambigu tout requirement contenant :

1. TERMES SUBJECTIFS OU NON MESURABLES
performant, rapide, simple, facile, intuitif, important, approprié, correct, nécessaire, adéquat, suffisant, acceptable, efficace, ergonomique, convivial, sécurisé

2. PORTÉE NON DÉFINIE
certaines actions, certains utilisateurs, certaines informations, dans certains cas, selon le contexte

3. CONDITIONS MANQUANTES
si nécessaire, lorsqu'un événement se produit, si cela est autorisé, dans les cas habituels

4. RÈGLES MÉTIER NON DÉFINIES
fonctionnalités concernées, accès approprié, permissions adéquates

5. CRITÈRES NON MESURABLES
système performant, accès rapide, chargement fluide, interface simple

RÈGLES :

- Analyse chaque requirement individuellement
- Une requirement peut produire plusieurs ambiguïtés
- Il vaut mieux signaler trop d'ambiguïtés que pas assez
- N'ignore jamais un terme vague
- Explique toujours pourquoi c'est ambigu

Format de sortie :

[
  {
    "reference": "REQ-XXX",
    "type": "ambiguity",
    "ambiguity": "explication précise du problème",
    "recommendation": "information qui doit être précisée"
  }
]

Exigences à analyser :
${requirementsList}`
            }
          ]
        })
      })

      if (clarResponse.ok) {
        const clarRaw = await clarResponse.json()
        const clarText = clarRaw.content?.[0]?.text ?? ''
        console.log("CLAUDE CLARIFICATIONS RAW:")
        console.log(clarText)

        if (clarText) {
          try {
            const parsedClar = await parseAIJson(clarText, clarApiKey)
            console.log("PARSED CLARIFICATIONS:")
            console.log(parsedClar)
            const clarArray = Array.isArray(parsedClar)
              ? parsedClar
              : Array.isArray(parsedClar.clarifications)
                ? parsedClar.clarifications
                : [parsedClar]
            console.log("CLAR ARRAY LENGTH:", clarArray?.length, "IS ARRAY:", Array.isArray(clarArray))
            if (Array.isArray(clarArray) && clarArray.length > 0) {
              const clarificationsToInsert = clarArray.map((c: any) => ({
                project_id: project.id,
                type: c.type ?? 'ambiguity',
                element_reference: c.reference ?? c.element_reference,
                explanation: c.ambiguity ?? c.explanation,
                recommendation: c.recommendation,
              }))
              console.log("INSERTING CLARIFICATIONS:", JSON.stringify(clarificationsToInsert))
              const { error: clarInsertError } = await supabase.from('clarifications').insert(clarificationsToInsert)
              if (clarInsertError) {
                console.error("CLARIFICATIONS INSERT ERROR:", clarInsertError)
              } else {
                console.log("CLARIFICATIONS INSERTED OK")
              }
            }
          } catch (err) {
            console.error("CLARIFICATIONS CATCH ERROR:", err)
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