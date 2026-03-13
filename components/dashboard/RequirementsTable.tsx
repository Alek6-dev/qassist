"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ClipboardList, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { computeCoverage, type CoverageStatus } from "@/lib/coverage"

type ReqField = "req_code" | "description"

interface RequirementsTableProps {
  requirements: any[]
  testCases: any[]
  editingCell: { id: string; field: ReqField } | null
  editingValue: string
  onEditStart: (id: string, field: ReqField, value: string) => void
  onEditChange: (v: string) => void
  onEditCommit: () => void
  onDelete: (id: string) => void
  onAdd: (req_code: string, description: string) => Promise<void>
  hasTestCases: boolean
}

// ── Coverage badge ─────────────────────────────────────────────────────────

function CoverageBadge({ status, tcCode }: { status: CoverageStatus; tcCode: string | null }) {
  const label =
    status === "direct" || status === "indirect"
      ? (tcCode ?? "—")
      : status === "uncovered"
      ? "Non couvert"
      : "—"

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", {
        "border-emerald-200 text-emerald-600 bg-emerald-50/80": status === "direct",
        "border-amber-200 text-amber-600 bg-amber-50/80":       status === "indirect",
        "border-red-200 text-red-600 bg-red-50/80":             status === "uncovered",
        "border-gray-200 text-gray-500 bg-gray-50/80":          status === "undefined",
      })}
    >
      {label}
    </Badge>
  )
}

function LegendBadge({ status, label }: { status: CoverageStatus; label: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", {
        "border-emerald-200 text-emerald-600 bg-emerald-50/80": status === "direct",
        "border-amber-200 text-amber-600 bg-amber-50/80":       status === "indirect",
        "border-red-200 text-red-600 bg-red-50/80":             status === "uncovered",
        "border-gray-200 text-gray-500 bg-gray-50/80":          status === "undefined",
      })}
    >
      {label}
    </Badge>
  )
}

// ── Header tooltip ─────────────────────────────────────────────────────────

function CoverageHeaderTooltip() {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-flex items-center gap-1 select-none">
      Couverture
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground text-[10px] font-bold leading-none hover:bg-muted/80 transition-colors"
      >
        ?
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-popover border rounded-lg shadow-md p-3 w-40 flex flex-col gap-2 pointer-events-none">
          <LegendBadge status="direct"    label="Direct" />
          <LegendBadge status="indirect"  label="Indirect" />
          <LegendBadge status="uncovered" label="Non couvert" />
          <LegendBadge status="undefined" label="Non défini" />
        </div>
      )}
    </span>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export function RequirementsTable({
  requirements,
  testCases,
  editingCell,
  editingValue,
  onEditStart,
  onEditChange,
  onEditCommit,
  onDelete,
  onAdd,
  hasTestCases,
}: RequirementsTableProps) {
  const [adding, setAdding] = useState(false)
  const [newDescription, setNewDescription] = useState("")
  const [pendingCode, setPendingCode] = useState("")
  const newDescRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (adding) newDescRef.current?.focus()
  }, [adding])

  const startAdding = () => {
    const nums = requirements
      .map(r => parseInt(r.req_code?.replace(/[^0-9]/g, "") || "0"))
      .filter(n => !isNaN(n))
    const max = nums.length > 0 ? Math.max(...nums) : 0
    setPendingCode(`REQ-${String(max + 1).padStart(3, "0")}`)
    setNewDescription("")
    setAdding(true)
  }

  const commitAdd = async () => {
    if (!adding) return
    const desc = newDescription.trim()
    setAdding(false)
    setNewDescription("")
    if (desc) await onAdd(pendingCode, desc)
  }

  // Computed coverage for every requirement
  const coverageMap = computeCoverage(requirements, testCases)

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-b">
          <TableHead className="w-36 px-4 py-3 text-xs font-semibold uppercase tracking-wide">
            Exigence
          </TableHead>
          <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
            Description
          </TableHead>
          <TableHead className="w-36 px-4 py-3 text-xs font-semibold uppercase tracking-wide">
            <CoverageHeaderTooltip />
          </TableHead>
          <TableHead className="w-12 px-4 py-3" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* Empty state row */}
        {requirements.length === 0 && !adding && (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={4} className="py-14 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">Aucune exigence pour ce projet.</p>
              </div>
            </TableCell>
          </TableRow>
        )}

        {/* Existing requirements */}
        {requirements.map((req, index) => {
          const displayCode = `REQ-${String(index + 1).padStart(3, "0")}`
          const coverage = coverageMap.get(req.id) ?? { status: "undefined" as CoverageStatus, tcCode: null }
          return (
            <TableRow key={req.id} className="hover:bg-muted/30 transition-colors border-b last:border-0">
              <TableCell className="font-mono font-medium align-top px-4 py-3 text-sm">
                <span>{displayCode}</span>
              </TableCell>

              <TableCell className="align-top px-4 py-3 text-sm">
                {editingCell?.id === req.id && editingCell?.field === "description" ? (
                  <textarea
                    value={editingValue}
                    onChange={(e) => onEditChange(e.target.value)}
                    onBlur={onEditCommit}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onEditCommit()}
                    autoFocus
                    rows={Math.max(1, editingValue.split("\n").length)}
                    className="w-full text-sm resize-none border-0 outline-none ring-1 ring-ring rounded px-2 py-1 bg-background"
                  />
                ) : (
                  <span
                    onClick={() => onEditStart(req.id, "description", req.description)}
                    className="cursor-text whitespace-pre-wrap text-foreground/90"
                  >
                    {req.description}
                  </span>
                )}
              </TableCell>

              <TableCell className="align-top px-4 py-3">
                <CoverageBadge status={coverage.status} tcCode={coverage.tcCode} />
              </TableCell>

              <TableCell className="align-top text-right px-4 py-3">
                {!hasTestCases && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5"
                    onClick={() => onDelete(req.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          )
        })}

        {/* New requirement row (inline) */}
        {adding && (
          <TableRow className="bg-muted/20">
            <TableCell className="font-mono font-medium px-4 py-3 text-sm text-muted-foreground">
              {pendingCode}
            </TableCell>
            <TableCell className="px-4 py-3">
              <input
                ref={newDescRef}
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) commitAdd()
                  if (e.key === "Escape") { setAdding(false); setNewDescription("") }
                }}
                onBlur={commitAdd}
                placeholder="Description…"
                className="w-full text-sm bg-transparent outline-none ring-1 ring-ring rounded px-2 py-1"
              />
            </TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
        )}

        {/* Add requirement trigger row */}
        <TableRow
          className="hover:bg-muted/30 cursor-pointer border-0"
          onClick={startAdding}
        >
          <TableCell colSpan={4} className="px-4 py-2.5">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="h-3.5 w-3.5" />
              Ajouter une exigence
            </span>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
