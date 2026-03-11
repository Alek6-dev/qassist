export type CoverageStatus = "undefined" | "direct" | "indirect" | "uncovered"

export type CoverageResult = {
  status: CoverageStatus
  tcCode: string | null // first matching TC code to display
}

/**
 * Computes coverage status for every requirement based on the linked test cases.
 *
 * Rules:
 *  - undefined  → no test cases have been generated yet
 *  - direct     → at least one TC has requirement_id === req.id
 *  - indirect   → no direct TC, but req_code appears in steps/expected_result of another TC
 *  - uncovered  → neither direct nor indirect match found
 *
 * Returns a Map keyed by requirement id.
 */
export function computeCoverage(
  requirements: any[],
  testCases: any[]
): Map<string, CoverageResult> {
  const result = new Map<string, CoverageResult>()

  if (testCases.length === 0) {
    for (const req of requirements) {
      result.set(req.id, { status: "undefined", tcCode: null })
    }
    return result
  }

  for (let i = 0; i < requirements.length; i++) {
    const req = requirements[i]
    // Display code mirrors what RequirementsTable renders (index-based)
    const displayCode = `REQ-${String(i + 1).padStart(3, "0")}`

    // ── Direct ────────────────────────────────────────────────────────────
    const directTc = testCases.find((tc) => tc.requirement_id === req.id)
    if (directTc) {
      result.set(req.id, { status: "direct", tcCode: directTc.tc_code })
      continue
    }

    // ── Indirect ──────────────────────────────────────────────────────────
    // Search for the requirement's code in the text of TCs linked to other requirements.
    // Checks both the stored req_code and the current display code.
    const storedCode = (req.req_code ?? "").toLowerCase()
    const dispCode = displayCode.toLowerCase()

    const indirectTc = testCases.find((tc) => {
      if (tc.requirement_id === req.id) return false
      const text = `${tc.steps ?? ""} ${tc.expected_result ?? ""}`.toLowerCase()
      return (
        (storedCode && text.includes(storedCode)) ||
        (dispCode && text.includes(dispCode))
      )
    })

    if (indirectTc) {
      result.set(req.id, { status: "indirect", tcCode: indirectTc.tc_code })
      continue
    }

    // ── Uncovered ─────────────────────────────────────────────────────────
    result.set(req.id, { status: "uncovered", tcCode: null })
  }

  return result
}

/**
 * Aggregates raw coverage results into summary counts.
 */
export function summarizeCoverage(coverageMap: Map<string, CoverageResult>) {
  let direct = 0
  let indirect = 0
  let uncovered = 0
  let undefined_ = 0

  for (const { status } of coverageMap.values()) {
    if (status === "direct") direct++
    else if (status === "indirect") indirect++
    else if (status === "uncovered") uncovered++
    else undefined_++
  }

  const total = coverageMap.size
  const covered = direct + indirect
  const rate = total > 0 ? Math.round((covered / total) * 100) : 0

  return { total, direct, indirect, uncovered, undefined: undefined_, rate }
}
