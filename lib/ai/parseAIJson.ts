/**
 * Shared utility for tolerant AI JSON extraction and parsing.
 *
 * Pipeline:
 *  1. Try JSON.parse on the full cleaned text (ideal: AI returned pure JSON)
 *  2. Extract first { } block with brace-balanced matching (handles strings with { })
 *  3. Clean common LLM mistakes (trailing commas) and try JSON.parse
 *  4. If still failing, ask AI to repair, then retry steps 2-3
 *  5. Only throw if everything fails
 */

function stripFences(raw: string): string {
  return raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
}

/**
 * Bracket/brace-balanced extraction — handles both objects { } and arrays [ ].
 * Correctly skips delimiters inside JSON strings.
 */
function extractJSON(raw: string): string | null {
  const cleaned = stripFences(raw)

  const objIdx = cleaned.indexOf("{")
  const arrIdx = cleaned.indexOf("[")

  // Pick the delimiter that appears first (array or object)
  let startIdx: number
  let openChar: string
  let closeChar: string

  if (arrIdx !== -1 && (objIdx === -1 || arrIdx < objIdx)) {
    startIdx = arrIdx
    openChar = "["
    closeChar = "]"
  } else if (objIdx !== -1) {
    startIdx = objIdx
    openChar = "{"
    closeChar = "}"
  } else {
    return null
  }

  let depth = 0
  let inString = false
  let escaped = false

  for (let i = startIdx; i < cleaned.length; i++) {
    const ch = cleaned[i]

    if (escaped) { escaped = false; continue }
    if (ch === "\\" && inString) { escaped = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue

    if (ch === openChar) depth++
    else if (ch === closeChar) {
      depth--
      if (depth === 0) return cleaned.slice(startIdx, i + 1)
    }
  }

  return null
}

function cleanJSON(raw: string): string {
  return raw
    .replace(/,\s*([}\]])/g, "$1") // trailing commas before } or ]
    .trim()
}

async function repairWithAI(fragment: string, apiKey: string): Promise<string | null> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: `Fix the following malformed JSON so it becomes strictly valid JSON. Return ONLY the corrected JSON, no explanations, no markdown.\n\nMalformed JSON:\n${fragment}`,
          },
        ],
      }),
    })

    if (!response.ok) return null
    const data = await response.json()
    return data.content?.[0]?.text ?? null
  } catch {
    return null
  }
}

function tryParse(text: string): any {
  return JSON.parse(cleanJSON(text))
}

export async function parseAIJson(raw: string, apiKey: string): Promise<any> {
  // Step 1: Try parsing the full text directly (AI returned pure JSON)
  try {
    return tryParse(stripFences(raw).trim())
  } catch {
    // not pure JSON, continue
  }

  // Step 2: Extract first balanced { } block
  const extracted = extractJSON(raw)
  if (!extracted) {
    throw new Error("AI output does not contain valid JSON structure")
  }

  // Step 3: Clean + parse the extracted block
  try {
    return tryParse(extracted)
  } catch {
    // Step 4: Repair — send only the extracted fragment (not the full raw)
    // so the repair model has enough tokens to return the corrected JSON
    console.warn("[parseAIJson] JSON.parse failed, attempting AI repair...")
    const repaired = await repairWithAI(extracted, apiKey)

    if (repaired) {
      const repairedExtracted = extractJSON(repaired)
      if (repairedExtracted) {
        try {
          return tryParse(repairedExtracted)
        } catch {
          // fall through
        }
      }
    }

    throw new Error("AI output is not valid JSON and repair attempt failed")
  }
}
