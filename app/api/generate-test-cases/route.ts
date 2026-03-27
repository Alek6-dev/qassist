import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { parseAIJson } from "@/lib/ai/parseAIJson"
import { checkQuota } from "@/lib/quota"

export const runtime = "nodejs"

const BATCH_SIZE = 6

// ── Prompt ───────────────────────────────────────────────────────────────────

function buildBatchPrompt(requirementsList: string, tcOffset: number): string {
  const tcStart = String(tcOffset + 1).padStart(3, "0")
  return `INSTRUCTION ABSOLUE : Ta réponse doit commencer par { et se terminer par }. Tu ne dois écrire AUCUN texte avant ou après le JSON. Aucun bloc markdown. Aucune explication. Aucun commentaire. Aucune virgule en fin de liste. Uniquement du JSON valide et complet.

Tu es un ingénieur QA senior expérimenté. Génère des cas de test réalistes en français pour les exigences listées ci-dessous.

FORMAT DE SORTIE — OBLIGATOIRE, SANS EXCEPTION :
{"testCases":[{"requirement_id":"REQ-001","tc_code":"TC-001","category":"Happy path","preconditions":"Utilisateur connecté avec un compte actif","steps":"1. Ouvrir la page d'accueil\n2. Cliquer sur l'icône de notification\n3. Observer la liste des notifications","expected_result":"La liste des notifications s'affiche avec les 3 dernières notifications reçues.","priority":"Medium"},{"requirement_id":"REQ-001","tc_code":"TC-002","category":"Negative","preconditions":"Utilisateur connecté avec un compte actif","steps":"1. Ouvrir la page des notifications\n2. Couper la connexion réseau\n3. Tenter de rafraîchir la liste","expected_result":"Un message d'erreur 'Impossible de charger les notifications' s'affiche.","priority":"Medium"},{"requirement_id":"REQ-001","tc_code":"TC-003","category":"Permissions/Security","preconditions":"Aucune session active","steps":"1. Accéder directement à l'URL de la page des notifications sans être connecté","expected_result":"L'utilisateur est redirigé vers la page de connexion.","priority":"High"}]}

CHAMPS OBLIGATOIRES — noms EXACTS, ne jamais utiliser d'autres noms :
- "requirement_id" : code de l'exigence (ex: "REQ-001")
- "tc_code" : identifiant du test (ex: "TC-001"), numérotation globale croissante sur tous les tests
- "category" : EXACTEMENT l'une de ces valeurs : "Happy path", "Negative", "Edge case", "Permissions/Security", "UI/UX", "Data/State", "Integration"
- "preconditions" : état du système avant le test (string, vide "" si aucune)
- "steps" : actions utilisateur numérotées séparées par \\n, 2 à 5 étapes maximum
- "expected_result" : résultat observable et mesurable en 1 phrase
- "priority" : "High", "Medium" ou "Low"

NUMÉROTATION : les tc_code de ce lot commencent à TC-${tcStart} et s'incrémentent de façon continue.

━━━ ANALYSE AVANT GÉNÉRATION ━━━
Pour chaque exigence, pose-toi ces questions avant de générer les tests :
1. Quel est le chemin nominal qui prouve que la fonctionnalité marche ? → Happy path
2. Que se passe-t-il si l'utilisateur fournit une donnée invalide, manquante ou dans un mauvais état ? → Negative
3. Existe-t-il une valeur limite, un quota, un état intermédiaire ou un comportement aux bords ? → Edge case
4. Y a-t-il un contrôle d'accès, un rôle ou une permission à valider ? → Permissions/Security

━━━ RÈGLES DE COUVERTURE ━━━
Génère au minimum 2 tests par exigence : le chemin nominal et au moins un cas d'échec.
Un seul test est acceptable uniquement pour une exigence purement informative (affichage statique, label, message non interactif).
Génère jusqu'à 4 ou 5 tests si la complexité fonctionnelle le justifie (plusieurs chemins d'échec distincts, plusieurs rôles, plusieurs états).
Ne génère pas de tests redondants qui couvrent exactement le même scénario pour la même exigence.

Déclencheurs systématiques — applique-les sans exception :
- L'exigence implique une saisie utilisateur → toujours un test avec donnée invalide ou manquante
- L'exigence implique une création ou modification de données → toujours un test avec état de départ invalide, doublon ou champ manquant
- L'exigence implique une limite (nombre max, taille, délai, quota) → toujours un test à la limite et un au-delà
- L'exigence implique une permission ou un rôle → toujours un test avec un utilisateur non autorisé
- L'exigence implique une action qui peut échouer côté système (réseau, API, timeout) → un test de comportement en cas d'erreur système

RÈGLE OBLIGATOIRE — CHAMPS OPTIONNELS :
Avant de générer un TC de type "champ obligatoire manquant", relis l'exigence.
- Si l'exigence décrit le champ comme "optionnel" → ne génère JAMAIS un TC qui teste son absence comme une erreur. Génère à la place un TC nominal qui vérifie que la création réussit sans ce champ.
- Si l'exigence dit que le système définit une valeur par défaut automatiquement → ne génère JAMAIS un TC qui suppose que l'utilisateur doit renseigner ce champ. Le champ est transparent pour l'utilisateur.

RÈGLE OBLIGATOIRE — PÉRIMÈTRE DES FONCTIONNALITÉS :
Ne génère jamais de TC basé sur une fonctionnalité absente des exigences du lot.
Chaque scénario doit être directement traçable à une exigence listée ci-dessous.
Si un scénario plausible n'est couvert par aucune exigence du lot → ne le génère pas.

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
  "Un message s'affiche ou l'utilisateur est redirigé." ← interdit : contient 'ou'

RÈGLE : un expected_result ne doit jamais contenir le mot 'ou'. Un seul comportement attendu par TC. Si deux comportements sont possibles, crée deux TCs distincts.

RAPPEL FINAL : commence par { et termine par }. Zéro texte hors du JSON.

Exigences :
${requirementsList}`
}

// ── Appel Anthropic pour un lot ───────────────────────────────────────────────

async function callAnthropicBatch(
  batch: Array<{ id: string; req_code: string; description: string }>,
  tcOffset: number,
  apiKey: string
): Promise<any[]> {
  const requirementsList = batch
    .map((r) => `- ${r.req_code} (id: ${r.id}): ${r.description}`)
    .join("\n")

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 90_000)

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 8192,
        messages: [{ role: "user", content: buildBatchPrompt(requirementsList, tcOffset) }],
      }),
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[generate-test-cases] Anthropic batch error:", errorText)
      throw new Error("Failed to call AI API")
    }

    const raw = await response.json()
    const text = raw.content?.[0]?.text ?? ""
    if (!text) throw new Error("AI output is empty for this batch")

    const parsed = await parseAIJson(text, apiKey)
    if (!Array.isArray(parsed.testCases)) throw new Error("AI output is missing testCases array")

    return parsed.testCases
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
  }
}

// ── Route ─────────────────────────────────────────────────────────────────────

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

  // 3. Verify project ownership explicitly (defense in depth over RLS)
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  // 4. Fetch requirements
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

  // 5. Vérification quota plan (REQ max par projet)
  const quota = await checkQuota(user.id, 'generate_test_cases', projectId)
  if (!quota.allowed) {
    return NextResponse.json(
      { error: quota.reason, quota_exceeded: true, plan: quota.plan },
      { status: 403 }
    )
  }

  // 6. Check API key
  const apiKey = (process.env.ANTHROPIC_API_KEY || "").trim()
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 500 }
    )
  }

  // 7. Split requirements into batches
  const batches: Array<typeof requirements> = []
  for (let i = 0; i < requirements.length; i += BATCH_SIZE) {
    batches.push(requirements.slice(i, i + BATCH_SIZE))
  }

  const isDev = process.env.NODE_ENV === "development"
  if (isDev) {
    console.log(`[generate-test-cases] ${requirements.length} requirements → ${batches.length} batch(es) of ${BATCH_SIZE}`)
  }

  // 8. Call AI for each batch sequentially, accumulate raw test cases
  const allRawTestCases: any[] = []
  let tcOffset = 0

  for (let i = 0; i < batches.length; i++) {
    if (isDev) {
      console.log(`[generate-test-cases] Batch ${i + 1}/${batches.length} (${batches[i].length} req, TC offset: ${tcOffset})`)
    }
    try {
      const batchTCs = await callAnthropicBatch(batches[i], tcOffset, apiKey)
      allRawTestCases.push(...batchTCs)
      tcOffset += batchTCs.length
    } catch (err: any) {
      console.error(`[generate-test-cases] Batch ${i + 1}/${batches.length} failed:`, err.message)
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
  }

  if (isDev) {
    console.log(`[generate-test-cases] ${allRawTestCases.length} TC(s) received across all batches`)
  }

  // 9. Map all raw TCs → DB rows
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
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
      return trimmed
    }
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

  const toInsert: any[] = []
  for (const tc of allRawTestCases) {
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

  // 10. Delete existing test_cases (only after successful AI generation across all batches)
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
