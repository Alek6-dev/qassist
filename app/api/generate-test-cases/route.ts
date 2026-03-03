import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

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
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: `Génère des cas de test en français pour les exigences suivantes.
Retourne UNIQUEMENT un JSON valide, sans texte avant ni après.
Format strict :
{"testCases":[{"requirement_id":"...","tc_code":"...","category":"...","preconditions":"...","steps":"...","expected_result":"..."}]}

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

  // 9. Extract JSON robustly (same pattern as generate-requirements)
  function extractJSON(raw: string): string | null {
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "")
    const startChar = cleaned.search(/[{\[]/)
    if (startChar === -1) return null
    const openChar = cleaned[startChar]
    const closeChar = openChar === "{" ? "}" : "]"
    let depth = 0
    let endChar = -1
    for (let i = startChar; i < cleaned.length; i++) {
      if (cleaned[i] === openChar) depth++
      else if (cleaned[i] === closeChar) {
        depth--
        if (depth === 0) { endChar = i; break }
      }
    }
    if (endChar === -1) return null
    return cleaned.slice(startChar, endChar + 1)
  }

  const jsonStr = extractJSON(text)
  if (!jsonStr) {
    return NextResponse.json(
      { error: "AI output does not contain valid JSON structure" },
      { status: 500 }
    )
  }

  let parsed: any
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    return NextResponse.json({ error: "AI output is not valid JSON" }, { status: 500 })
  }

  if (!Array.isArray(parsed.testCases)) {
    return NextResponse.json(
      { error: "AI output is missing testCases array" },
      { status: 500 }
    )
  }

  // 10. Insert test_cases in batch
  const toInsert = parsed.testCases.map((tc: any) => ({
    project_id: projectId,
    requirement_id: tc.requirement_id,
    tc_code: tc.tc_code,
    category: tc.category,
    preconditions: tc.preconditions,
    steps: tc.steps,
    expected_result: tc.expected_result,
    priority: "medium", // ← ajoute ça
  }))
  console.log("TO INSERT:", toInsert)
  
  const { data: inserted, error: insertError } = await supabase
    .from("test_cases")
    .insert(toInsert)
    .select()

  if (insertError) {
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
