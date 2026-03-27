import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { parseAIJson } from '@/lib/ai/parseAIJson'
import { checkQuota } from '@/lib/quota'
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

    const MAX_SPEC_CHARS = 50_000
    if (specification.length > MAX_SPEC_CHARS) {
      return NextResponse.json(
        { error: `Specification too long (max ${MAX_SPEC_CHARS.toLocaleString()} characters)` },
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

    // Vérification quota plan
    const quota = await checkQuota(user.id, 'generate_requirements')
    if (!quota.allowed) {
      return NextResponse.json(
        { error: quota.reason, quota_exceeded: true, plan: quota.plan },
        { status: 403 }
      )
    }

    // Rate limiting : max 10 générations par heure par utilisateur
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: recentCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo)

    if ((recentCount ?? 0) >= 10) {
      return NextResponse.json(
        { error: 'Too many requests. Maximum 10 generations per hour.' },
        { status: 429 }
      )
    }

    // Appel à l'API Anthropic
    const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim()
    let aiRaw: any
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60_000)
    try {

const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01"
  },
  signal: controller.signal,
  body: JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
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
REQ-002 → "Le système doit s'assurer que l'adresse email n'est pas déjà utilisée lors de l'inscription."
REQ-003 → "Le système doit afficher un message de confirmation après la création du compte."

━━━ RÈGLE DE FORMULATION COMPORTEMENTALE ━━━
Une exigence décrit un comportement du système, pas un champ de base de données.
Si la spec liste des champs ("contient : nom, description, date"), reformule chaque champ en comportement observable :
- Champ obligatoire saisi par l'utilisateur → "Le système requiert [champ] lors de la création de [entité]."
- Champ généré automatiquement par le système → "Le système enregistre automatiquement [champ] à la création de [entité]."
- Champ optionnel → "[Champ] est optionnel lors de la création de [entité]."
Ne génère jamais une exigence du type "Un projet doit contenir un nom." — ce n'est pas testable en tant que comportement.

━━━ RÈGLES IMPLICITES À DÉTECTER ━━━
Certaines règles ne sont jamais écrites dans une spec mais sont systématiquement attendues par un QA senior.
Si la spec contient l'un de ces éléments, génère les exigences correspondantes même si elles ne sont pas explicitement formulées :

- Inscription avec email → générer : "Le système vérifie que l'adresse email n'est pas déjà utilisée lors de l'inscription."
- Connexion avec mot de passe → générer : "Le système bloque l'accès si les identifiants sont incorrects."
- Lien envoyé par email (réinitialisation, invitation, confirmation) → générer : "Le lien [type] envoyé par email expire après utilisation ou après un délai défini."
- Formulaire avec champ mot de passe → générer une exigence sur la validation du format si des contraintes sont implicitement attendues.
- Action irréversible (suppression, archivage) → générer : "Le système demande une confirmation avant d'exécuter [action]." si ce n'est pas précisé.

━━━ RÈGLE DE PERMISSION ━━━
Si la spec définit des rôles utilisateurs (admin, membre, invité, etc.), pour chaque action (créer, modifier, supprimer, archiver, déplacer, partager, assigner, commenter), vérifie si la spec précise explicitement qui peut l'effectuer.
- Si le rôle est précisé dans la spec → inclure le rôle dans la description de l'exigence : "Un administrateur peut [action]."
- Si le rôle n'est pas précisé mais que des rôles existent → formuler avec "un utilisateur autorisé" pour signaler l'ambiguïté sans bloquer la génération.
Ne génère pas d'exigence de permission pour les actions qui s'appliquent universellement à tous les utilisateurs connectés.

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
  return NextResponse.json(
    { error: 'Failed to call AI API' },
    { status: 500 }
  )
}

aiRaw = await anthropicResponse.json()
      clearTimeout(timeoutId)
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('Erreur lors de l\'appel à l\'API Anthropic:', error)
      return NextResponse.json(
        { error: 'Failed to call AI API' },
        { status: 500 }
      )
    }

    // Extraction du texte
    const text = aiRaw.content?.[0]?.text ?? ''
    
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
      console.error('[generate-requirements] Failed to parse AI JSON:', err.message)
      return NextResponse.json({ error: err.message }, { status: 422 })
    }

    // Qualité de la spec
    const specQuality: string = parsed.spec_quality ?? "GOOD"
    if (specQuality === "BAD") {
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

    // Création du projet (uniquement si l'IA a produit des exigences valides)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title: 'New Project',
        original_spec: specification,
      })
      .select()
      .single()

    if (projectError) {
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      )
    }

    // Insertion en DB
    let requirements
    try {
      requirements = await insertRequirements(supabase, project.id, mappedItems)
    } catch (err) {
      console.error('[generate-requirements] Supabase insert requirements error:', err)
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

      const clarController = new AbortController()
      const clarTimeoutId = setTimeout(() => clarController.abort(), 60_000)
      const clarResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": clarApiKey,
          "anthropic-version": "2023-06-01"
        },
        signal: clarController.signal,
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: `Réponds UNIQUEMENT avec un tableau JSON valide. Aucun texte avant ni après. Aucune explication. Commence directement par "[".

Tu es un analyste QA senior chargé d'identifier les problèmes qui auraient un impact réel sur l'implémentation, la compréhension fonctionnelle ou l'écriture de tests.

PRINCIPE FONDAMENTAL :
Un requirement clair et bien formulé ne doit produire AUCUN point à clarifier. Il est normal et attendu que la majorité des requirements n'en génèrent pas.
L'objectif est la qualité, pas la quantité.

━━━ ÉTAPE 0 — REGROUPER LES EXIGENCES CONNEXES ━━━
Avant de générer les clarifications, identifie les groupes de requirements qui partagent le même domaine fonctionnel (ex : toutes les REQs sur les notifications, toutes celles sur les permissions d'une même entité, toutes celles sur un même mécanisme).
Règle absolue : si la même observation s'applique à plusieurs requirements d'un même groupe, génère-la UNE SEULE FOIS en référençant le premier REQ concerné.
Ne répète jamais la même clarification pour des REQs adjacentes qui partagent le même contexte ou la même lacune.

━━━ CHECKLIST SÉCURITÉ — vérifie systématiquement ━━━
Pour chaque spec, applique ces contrôles indépendamment des instructions générales :
- Lien envoyé par email (réinitialisation de mot de passe, invitation, confirmation) → signaler si la durée de validité ou les conditions d'expiration ne sont pas définies.
- Création de compte avec mot de passe → signaler si les règles de complexité (longueur minimale, caractères requis) ne sont pas définies.
- Action irréversible (suppression définitive, archivage) → signaler si une confirmation utilisateur ou une restriction de permission n'est pas définie.
- Accès externe (invité, lien de partage) → signaler si le mécanisme de contrôle d'accès et l'authentification requise ne sont pas précisés.

━━━ DÉTECTION DES PERMISSIONS MANQUANTES ━━━
Pour chaque requirement décrivant une action (verbes : déplacer, archiver, assigner, réassigner, commenter, supprimer, partager, filtrer, exporter, modifier le rôle), vérifie si la spec précise explicitement qui peut l'effectuer.
Si le "qui" n'est pas défini et que la spec comporte des rôles utilisateurs → générer une clarification de type "missing_rule".
Applique ce contrôle même pour des actions qui paraissent anodines (déplacer une carte Kanban, marquer comme lu, ajouter un tag) car les permissions implicites sont une source fréquente d'anomalies en production.

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
      clearTimeout(clarTimeoutId)

      if (clarResponse.ok) {
        const clarRaw = await clarResponse.json()
        const clarText = clarRaw.content?.[0]?.text ?? ''

        if (clarText) {
          try {
            const parsedClar = await parseAIJson(clarText, clarApiKey)
            const clarArray = Array.isArray(parsedClar)
              ? parsedClar
              : Array.isArray(parsedClar.clarifications)
                ? parsedClar.clarifications
                : [parsedClar]
            if (Array.isArray(clarArray) && clarArray.length > 0) {
              const clarificationsToInsert = clarArray
                .filter((c: any) => {
                  const ref = c.reference ?? c.element_reference
                  const expl = c.ambiguity ?? c.explanation
                  return (
                    typeof ref === 'string' && ref.trim() !== '' &&
                    typeof expl === 'string' && expl.trim() !== '' &&
                    typeof c.recommendation === 'string' && c.recommendation.trim() !== ''
                  )
                })
                .map((c: any) => ({
                project_id: project.id,
                type: typeof c.type === 'string' && c.type.trim() !== '' ? c.type : 'ambiguity',
                element_reference: (c.reference ?? c.element_reference).trim(),
                explanation: (c.ambiguity ?? c.explanation).trim(),
                recommendation: c.recommendation.trim(),
              }))
              await supabase.from('clarifications').insert(clarificationsToInsert)
            }
          } catch (err) {
            console.error('[generate-requirements] Clarifications parsing error:', err)
          }
        }
      }
    } catch (err) {
      console.error('Erreur lors de la génération des clarifications:', err)
    }

return NextResponse.json({ project, requirements, spec_quality: specQuality }, { status: 200 })

  } catch (err) {
    console.error('[generate-requirements] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    )
  }
}