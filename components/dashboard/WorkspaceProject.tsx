"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Download, Sparkles, X } from "lucide-react"
import { RequirementsTable } from "./RequirementsTable"
import { TestCasesTable } from "./TestCasesTable"
import { ClarificationsTable } from "./ClarificationsTable"
import { computeCoverage, summarizeCoverage } from "@/lib/coverage"

type ReqField = "req_code" | "description"
type TcField = "category" | "steps" | "expected_result" | "priority"

interface WorkspaceProjectProps {
  activeView: "requirements" | "testcases"
  onViewChange: (v: "requirements" | "testcases") => void
  // requirements
  requirements: any[]
  editingReqCell: { id: string; field: ReqField } | null
  editingReqValue: string
  onReqEditStart: (id: string, field: ReqField, value: string) => void
  onReqEditChange: (v: string) => void
  onReqEditCommit: () => void
  onReqDelete: (id: string) => void
  onReqAdd: (req_code: string, description: string) => Promise<void>
  hasTestCases: boolean
  // test cases
  testCases: any[]
  editingTcCell: { id: string; field: TcField } | null
  editingTcValue: string
  onTcEditStart: (id: string, field: TcField, value: string) => void
  onTcEditChange: (v: string) => void
  onTcEditCommit: () => void
  tcLoading: boolean
  onGenerateTestCases: () => void
  clarifications: any[]
  onTcDirectCommit?: (id: string, field: "category" | "steps" | "expected_result" | "priority", value: string) => void
  projectName?: string
}

// ── Coverage summary modal ─────────────────────────────────────────────────

function CoverageSummaryModal({
  requirements,
  testCases,
  onClose,
}: {
  requirements: any[]
  testCases: any[]
  onClose: () => void
}) {
  const coverageMap = computeCoverage(requirements, testCases)
  const { total, direct, indirect, uncovered, rate } = summarizeCoverage(coverageMap)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-background rounded-xl border shadow-lg w-80">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <p className="text-sm font-semibold">Résumé du taux de couverture</p>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="px-5 py-4 space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{total} exigence{total !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              Couverture directe
            </span>
            <span className="font-medium tabular-nums">{direct}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              Couverture indirecte
            </span>
            <span className="font-medium tabular-nums">{indirect}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              Non couvert
            </span>
            <span className="font-medium tabular-nums">{uncovered}</span>
          </div>
        </div>

        {/* Rate */}
        <div className="px-5 py-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">Taux de couverture global</p>
            <p className="text-lg font-bold tabular-nums">{rate} %</p>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                rate >= 80 ? "bg-green-500" : rate >= 50 ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${rate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export function WorkspaceProject({
  activeView,
  onViewChange,
  requirements,
  editingReqCell,
  editingReqValue,
  onReqEditStart,
  onReqEditChange,
  onReqEditCommit,
  onReqDelete,
  onReqAdd,
  hasTestCases,
  testCases,
  editingTcCell,
  editingTcValue,
  onTcEditStart,
  onTcEditChange,
  onTcEditCommit,
  tcLoading,
  onGenerateTestCases,
  clarifications,
  onTcDirectCommit,
  projectName = "",
}: WorkspaceProjectProps) {
  // ── Notification badge ─────────────────────────────────────────────────
  const [reqBadge, setReqBadge] = useState(false)
  const prevTcCount = useRef(0)

  useEffect(() => {
    if (testCases.length > 0 && prevTcCount.current === 0) {
      // Test cases just appeared → show badge unless already on requirements
      setReqBadge(activeView !== "requirements")
    }
    prevTcCount.current = testCases.length
  }, [testCases.length]) // intentionally omit activeView to avoid resetting on tab switches

  const handleViewRequirements = () => {
    setReqBadge(false)
    onViewChange("requirements")
  }

  // ── CSV export ─────────────────────────────────────────────────────────
  const handleExportCsv = () => {
    const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`
    const reqMap = new Map(requirements.map(r => [r.id, r]))
    const CATEGORY_FR: Record<string, string> = {
      "Happy path": "Cas nominal",
      "Negative": "Cas négatif",
      "Edge case": "Cas limite",
      "Permissions/Security": "Permissions/Sécurité",
      "UI/UX": "UI/UX",
      "Data/State": "Données/État",
      "Integration": "Intégration",
    }
    const PRIORITY_FR: Record<string, string> = { high: "Haute", medium: "Moyenne", low: "Basse" }
    const headers = ["ID Cas de test", "ID Exigence", "Description de l'exigence", "Catégorie", "Étapes", "Résultat attendu", "Priorité"]
    const rows = testCases.map(tc => {
      const req = reqMap.get(tc.requirement_id)
      return [tc.tc_code, req?.req_code, req?.description, CATEGORY_FR[tc.category] ?? tc.category, tc.steps, tc.expected_result, PRIORITY_FR[tc.priority] ?? tc.priority]
        .map(v => escape(String(v ?? "")))
        .join(",")
    })
    const csv = [headers.map(escape).join(","), ...rows].join("\r\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    a.download = slug ? `qassist-test-cases-${slug}.csv` : "qassist-test-cases.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Coverage summary modal ─────────────────────────────────────────────
  const [showCoverage, setShowCoverage] = useState(false)
  const canShowCoverage = requirements.length > 0 && testCases.length > 0

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      {/* Card header: tabs + actions */}
      <div className="flex items-center justify-between border-b bg-card px-1">
        <div className="flex items-center">
          {/* Requirements tab */}
          <button
            onClick={handleViewRequirements}
            className={cn(
              "relative px-4 py-3.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeView === "requirements"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Exigences
            {reqBadge && (
              <span className="absolute top-2.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {/* Test Cases tab */}
          <button
            onClick={() => onViewChange("testcases")}
            className={cn(
              "px-4 py-3.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeView === "testcases"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Cas de test
          </button>

          {/* Coverage summary link */}
          {canShowCoverage && (
            <button
              onClick={() => setShowCoverage(true)}
              className="px-4 py-3.5 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors -mb-px"
            >
              Voir le taux de couverture
            </button>
          )}
        </div>

        {activeView === "requirements" && requirements.length > 0 && (
          <div className="pr-4">
            <Button
              onClick={onGenerateTestCases}
              disabled={tcLoading}
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {tcLoading ? "Génération…" : "Générer les cas de test"}
            </Button>
          </div>
        )}

        {activeView === "testcases" && testCases.length > 0 && (
          <div className="pr-4">
            <Button
              onClick={handleExportCsv}
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        )}
      </div>

      {/* Card body */}
      {activeView === "requirements" && (
        <>
          <RequirementsTable
            requirements={requirements}
            testCases={testCases}
            editingCell={editingReqCell}
            editingValue={editingReqValue}
            onEditStart={onReqEditStart}
            onEditChange={onReqEditChange}
            onEditCommit={onReqEditCommit}
            onDelete={onReqDelete}
            onAdd={onReqAdd}
            hasTestCases={hasTestCases}
          />
          <ClarificationsTable clarifications={clarifications} />
        </>
      )}

      {activeView === "testcases" && (
        <TestCasesTable
          testCases={testCases}
          requirements={requirements}
          editingCell={editingTcCell}
          editingValue={editingTcValue}
          onEditStart={onTcEditStart}
          onEditChange={onTcEditChange}
          onEditCommit={onTcEditCommit}
          onDirectCommit={onTcDirectCommit}
        />
      )}

      {/* Coverage summary modal */}
      {showCoverage && (
        <CoverageSummaryModal
          requirements={requirements}
          testCases={testCases}
          onClose={() => setShowCoverage(false)}
        />
      )}
    </div>
  )
}
