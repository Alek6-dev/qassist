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
      { role: "user", content: `Tu es un analyste fonctionnel QA senior. Analyse la spécification ci-dessous puis génère les exigences fonctionnelles en français.

FORMAT DE SORTIE — JSON STRICT, aucun texte avant ou après, aucun markdown :
{"spec_quality":"GOOD","requirements":[{"id":"REQ-001","description":"Une phrase courte et atomique."},{"id":"REQ-002","description":"..."}]}

ÉTAPE 1 — ÉVALUER LA QUALITÉ DE LA SPÉCIFICATION :
Classe la spécification selon exactement l'un de ces 3 niveaux et place la valeur dans "spec_quality" :

- "GOOD" : le texte décrit clairement une ou plusieurs fonctionnalités, comportements système ou modules logiciels.
  Exemples : "L'application permet aux utilisateurs de créer et partager des documents.", "Le système doit envoyer un email de confirmation après inscription."

- "MEDIUM" : le texte évoque une fonctionnalité mais reste vague ou partiel.
  Exemples : "Gestion des utilisateurs.", "Système de paiement.", "Tableau de bord statistiques."

- "BAD" : le texte n'est pas une spécification fonctionnelle exploitable (texte aléatoire, hors sujet, salutation, test…).
  Exemples : "bonjour", "ceci n'est pas une spec", "test test test".

ÉTAPE 2 — GÉNÉRER LES REQUIREMENTS :
- Si spec_quality = "BAD" : le tableau "requirements" doit être vide [].
- Si spec_quality = "GOOD" ou "MEDIUM" : génère les exigences selon les règles ci-dessous.

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
- Le JSON doit contenir EXACTEMENT deux clés : "spec_quality" (string) et "requirements" (tableau d'objets).
- Chaque objet requirements doit avoir EXACTEMENT deux champs : "id" (string, format REQ-001, REQ-002…) et "description" (string, non vide).
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

    // Qualité de la spec
    const specQuality: string = parsed.spec_quality ?? "GOOD"
    if (specQuality === "BAD") {
      await supabase.from('projects').delete().eq('id', project.id)
      return NextResponse.json({ spec_quality: "BAD" }, { status: 200 })
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

Tu es un analyste QA senior chargé d'identifier les problèmes qui auraient un impact réel sur l'implémentation, la compréhension fonctionnelle ou l'écriture de tests.

PRINCIPE FONDAMENTAL :
Un requirement clair et bien formulé ne doit produire AUCUN point à clarifier. Il est normal et attendu que la majorité des requirements n'en génèrent pas.
L'objectif est la qualité, pas la quantité.

TYPES AUTORISÉS — tu dois utiliser exactement l'un de ces trois types pour chaque entrée :

"ambiguity" — Le requirement peut être interprété de plusieurs façons. Deux développeurs pourraient implémenter des comportements différents.
  Cela inclut les requirements contenant un verbe d'action vague qui ne décrit pas ce que le système fait concrètement.
  Verbes vagues à détecter : gérer, traiter, intervenir, prendre en charge, s'occuper de, opérer, supporter, permettre la gestion de, agir sur, administrer (sans précision de l'action).
  Exemple vague : "Un administrateur peut intervenir sur les réservations." → "Intervenir" ne définit aucune action concrète (modifier ? annuler ? rembourser ?).
  Exemple clair (ne pas signaler) : "Un administrateur peut modifier ou annuler une réservation." → Les actions sont explicites.
  Autre exemple : "Le système affiche les données récentes." → Récentes signifie quoi ? 24h, 7 jours, depuis la dernière connexion ?

"missing_rule" — Une règle métier ou une condition est implicite mais non exprimée.
  Exemples : permissions manquantes, seuil non défini, règle de validation absente, transition d'état non décrite, comportement en cas d'erreur non spécifié.
  Exemple : "Le système verrouille le compte après plusieurs tentatives." → Combien de tentatives ? Le verrou est-il permanent ou temporaire ?

"missing_info" — Une information concrète indispensable pour écrire le test est absente.
  Exemples : canal de notification non précisé, format de données manquant, délai non défini, valeur limite absente, contrainte de champ non décrite.
  Exemple : "L'utilisateur reçoit une notification." → Par quel canal ? Email, SMS, in-app ?

NE PAS signaler :
- Les termes dont la définition est évidente dans le contexte métier standard.
- Les formulations génériques qui ne créent pas de doute réel pour un testeur.
- Les observations du type "le terme X n'est pas défini" si X est communément compris.
- Les répétitions du même type d'observation sur plusieurs requirements.

Format de sortie :

[
  {
    "reference": "REQ-XXX",
    "type": "ambiguity",
    "ambiguity": "Le critère 'récent' n'est pas défini : la fenêtre temporelle à considérer est inconnue.",
    "recommendation": "Préciser la durée : dernières 24h, 7 jours, ou depuis la dernière connexion."
  },
  {
    "reference": "REQ-XXX",
    "type": "missing_rule",
    "ambiguity": "Le comportement du système en cas de tentatives de connexion échouées n'est pas défini.",
    "recommendation": "Préciser le nombre de tentatives avant verrouillage et la durée du verrouillage."
  },
  {
    "reference": "REQ-XXX",
    "type": "missing_info",
    "ambiguity": "Le canal de notification n'est pas précisé.",
    "recommendation": "Indiquer si la notification est envoyée par email, SMS ou in-app."
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

return NextResponse.json({ project, requirements, spec_quality: specQuality }, { status: 200 })

  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    )
  }
}