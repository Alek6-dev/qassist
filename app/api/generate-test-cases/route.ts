import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { parseAIJson } from "@/lib/ai/parseAIJson"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  // 1. Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { projectId } = body as { projectId?: unknown }

  if (!projectId || typeof projectId !== "string" || projectId.trim() === "") {
    return NextResponse.json(
      { error: "projectId is required and must be a non-empty string" },
      { status: 400 }
    )
  }

  // 2. Auth SSR
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 3. Fetch requirements
  const { data: requirements, error: reqError } = await supabase
    .from("requirements")
    .select("id, req_code, description")
    .eq("project_id", projectId)

  if (reqError) {
    return NextResponse.json(
      { error: "Failed to fetch requirements" },
      { status: 500 }
    )
  }

  if (!requirements || requirements.length === 0) {
    return NextResponse.json(
      { error: "No requirements found for this project" },
      { status: 400 }
    )
  }

  // 4. Delete existing test_cases for this project
  const { error: deleteError } = await supabase
    .from("test_cases")
    .delete()
    .eq("project_id", projectId)

  if (deleteError) {
    return NextResponse.json(
      { error: "Failed to delete existing test cases" },
      { status: 500 }
    )
  }

  // 5. Check API key
  const apiKey = (process.env.ANTHROPIC_API_KEY || "").trim()
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 500 }
    )
  }

  // 6. Build prompt
  const requirementsList = requirements
    .map((r) => `- ${r.req_code} (id: ${r.id}): ${r.description}`)
    .join("\n")

  // 7. Call Anthropic API
  let aiRaw: any
  try {
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `INSTRUCTION ABSOLUE : Ta réponse doit commencer par { et se terminer par }. Tu ne dois écrire AUCUN texte avant ou après le JSON. Aucun bloc markdown. Aucune explication. Aucun commentaire. Aucune virgule en fin de liste. Uniquement du JSON valide et complet.

Tu es un ingénieur QA senior expérimenté. Génère des cas de test réalistes en français pour les exigences listées ci-dessous.

FORMAT DE SORTIE — OBLIGATOIRE, SANS EXCEPTION :
{"testCases":[{"requirement_id":"REQ-001","tc_code":"TC-001","category":"Happy path","preconditions":"Utilisateur connecté avec un compte actif","steps":"1. Ouvrir la page d'accueil\n2. Cliquer sur l'icône de notification\n3. Observer la liste des notifications","expected_result":"La liste des notifications s'affiche avec les 3 dernières notifications reçues.","priority":"Medium"},{"requirement_id":"REQ-001","tc_code":"TC-002","category":"Negative","preconditions":"Utilisateur non connecté","steps":"1. Accéder directement à la page des notifications sans être connecté","expected_result":"L'utilisateur est redirigé vers la page de connexion.","priority":"High"}]}

CHAMPS OBLIGATOIRES — noms EXACTS, ne jamais utiliser d'autres noms :
- "requirement_id" : code de l'exigence (ex: "REQ-001")
- "tc_code" : identifiant du test (ex: "TC-001"), numérotation globale croissante sur tous les tests
- "category" : EXACTEMENT l'une de ces valeurs : "Happy path", "Negative", "Edge case", "Permissions/Security", "UI/UX", "Data/State", "Integration"
- "preconditions" : état du système avant le test (string, vide "" si aucune)
- "steps" : actions utilisateur numérotées séparées par \\n, 2 à 5 étapes maximum
- "expected_result" : résultat observable et mesurable en 1 phrase
- "priority" : "High", "Medium" ou "Low"

━━━ RÈGLES DE COUVERTURE ━━━
Pour chaque exigence, génère entre 1 et 4 tests selon sa complexité :
- 1 "Happy path" (toujours)
- 1 "Negative" si la fonctionnalité peut échouer (saisie invalide, état manquant, erreur)
- 1 "Edge case" ou "Permissions/Security" seulement si pertinent
- Ne génère jamais de tests artificiels pour atteindre un quota

━━━ RÈGLES DE PRIORITÉ ━━━
Distribue les priorités de façon réaliste, comme un QA professionnel le ferait.

"High" — UNIQUEMENT si l'échec de ce test bloquerait l'utilisation principale de l'application :
  • création de compte, connexion, authentification
  • création ou suppression de données critiques
  • contrôle d'accès et permissions
  • toute action sans laquelle l'utilisateur ne peut pas utiliser le produit
  → Ne force jamais "High" si l'échec n'est pas bloquant.

"Medium" — comportement fonctionnel normal, important mais non bloquant :
  • modification de données
  • affectation d'éléments, changement de statut
  • création d'objets secondaires
  • navigation interne au produit

"Low" — comportements secondaires ou non bloquants, représente environ 20 à 30 % des tests quand la spécification contient des fonctionnalités secondaires :
  • affichages de tableau de bord
  • messages UI, notifications, commentaires
  • fonctionnalités cosmétiques ou informatives
  • widgets, indicateurs visuels

Règle : si tu hésites entre High et Medium, choisis Medium. Si tu hésites entre Medium et Low, choisis Low.

━━━ RÈGLES POUR LES STEPS ━━━
Chaque step doit être une ACTION utilisateur concrète et observable.

À FAIRE :
  "1. Ouvrir la page de connexion"
  "2. Saisir un email invalide dans le champ Email"
  "3. Cliquer sur le bouton Connexion"

À NE PAS FAIRE :
  "Vérifier que le champ est présent"
  "S'assurer que le système répond"
  "Vérifier si la page s'affiche"

━━━ RÈGLES POUR EXPECTED_RESULT ━━━
Le résultat attendu doit être précis, observable et mesurable.

À FAIRE :
  "Un message d'erreur 'Email invalide' s'affiche sous le champ Email."
  "L'utilisateur est redirigé vers le tableau de bord."
  "La liste affiche exactement les 5 éléments correspondant au filtre."

À NE PAS FAIRE :
  "Le système fonctionne correctement."
  "L'application répond comme prévu."
  "Tout s'affiche bien."

RAPPEL FINAL : commence par { et termine par }. Zéro texte hors du JSON.

Exigences :
${requirementsList}`,
          },
        ],
      }),
    })

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text()
      console.error("Anthropic error:", errorText)
      return NextResponse.json({ error: "Failed to call AI API" }, { status: 500 })
    }

    aiRaw = await anthropicResponse.json()
  } catch (err) {
    console.error("Anthropic fetch error:", err)
    return NextResponse.json({ error: "Failed to call AI API" }, { status: 500 })
  }

  // 8. Extract text
  const text = aiRaw.content?.[0]?.text ?? ""

  if (!text) {
    return NextResponse.json({ error: "AI output is empty" }, { status: 500 })
  }

  // 9. Parse AI output (tolerant: cleans + retries via AI repair if needed)
  let parsed: any
  try {
    parsed = await parseAIJson(text, apiKey)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  if (!Array.isArray(parsed.testCases)) {
    return NextResponse.json(
      { error: "AI output is missing testCases array" },
      { status: 500 }
    )
  }

  // 10. Map AI output → DB rows (tolerant)

  const isDev = process.env.NODE_ENV === "development"

  // req_code → UUID lookup (requirements already fetched above)
  const reqCodeToId = new Map<string, string>()
  for (const r of requirements) {
    reqCodeToId.set(r.req_code, r.id)
  }

  const VALID_PRIORITIES = new Set(["high", "medium", "low"])

  function normalizePriority(val: any): string {
    const lower = typeof val === "string" ? val.toLowerCase() : ""
    return VALID_PRIORITIES.has(lower) ? lower : "medium"
  }

  function resolveRequirementId(val: any): string | null {
    if (typeof val !== "string" || val.trim() === "") return null
    const trimmed = val.trim()
    // Already a UUID
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
      return trimmed
    }
    // Code lookup (REQ-001, etc.)
    const uuid = reqCodeToId.get(trimmed)
    if (!uuid && isDev) {
      console.warn(`[generate-test-cases] Unknown requirement code: "${trimmed}"`)
    }
    return uuid ?? null
  }

  const usedCodes = new Set<string>()
  let tcCounter = 1

  function resolveTcCode(val: any): string {
    const candidate = typeof val === "string" && val.trim() !== "" ? val.trim() : null
    if (candidate && !usedCodes.has(candidate)) {
      usedCodes.add(candidate)
      return candidate
    }
    let generated: string
    do {
      generated = `TC-${String(tcCounter).padStart(3, "0")}`
      tcCounter++
    } while (usedCodes.has(generated))
    usedCodes.add(generated)
    return generated
  }

  if (isDev) {
    console.log(`[generate-test-cases] ${parsed.testCases.length} TC(s) received from AI`)
  }

  const toInsert: any[] = []
  for (const tc of parsed.testCases) {
    const requirementId = resolveRequirementId(tc.requirement_id)
    if (!requirementId) {
      if (isDev) {
        console.warn(`[generate-test-cases] Skipping TC "${tc.tc_code}" — unresolved requirement_id: "${tc.requirement_id}"`)
      }
      continue
    }
    toInsert.push({
      project_id: projectId,
      requirement_id: requirementId,
      tc_code: resolveTcCode(tc.tc_code),
      category: typeof tc.category === "string" ? tc.category : "",
      preconditions: typeof tc.preconditions === "string" ? tc.preconditions : "",
      steps: typeof tc.steps === "string" ? tc.steps : "",
      expected_result: typeof tc.expected_result === "string" ? tc.expected_result : "",
      priority: normalizePriority(tc.priority),
    })
  }

  if (isDev) {
    console.log(`[generate-test-cases] ${toInsert.length} TC(s) ready to insert`)
  }

  if (toInsert.length === 0) {
    return NextResponse.json(
      { error: "No valid test cases could be mapped from AI output" },
      { status: 422 }
    )
  }

  // 11. Insert
  const { data: inserted, error: insertError } = await supabase
    .from("test_cases")
    .insert(toInsert)
    .select()

  if (insertError) {
    console.error("[generate-test-cases] Insert error:", insertError)
    return NextResponse.json(
      { error: "Failed to insert test cases" },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { success: true, inserted: inserted?.length ?? 0 },
    { status: 200 }
  )
}
