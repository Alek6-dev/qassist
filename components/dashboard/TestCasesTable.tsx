"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select as SelectPrimitive } from "radix-ui"
import { Select, SelectContent, SelectItem } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { FlaskConical } from "lucide-react"

type TcField = "category" | "steps" | "expected_result" | "priority"
type SortColumn = "requirement" | "tc" | "category" | "priority"
type SortDirection = "asc" | "desc"

interface TestCasesTableProps {
  testCases: any[]
  requirements: { id: string }[]
  editingCell: { id: string; field: TcField } | null
  editingValue: string
  onEditStart: (id: string, field: TcField, value: string) => void
  onEditChange: (v: string) => void
  onEditCommit: () => void
  onDirectCommit?: (id: string, field: TcField, value: string) => void
}

// ── Display mappings ───────────────────────────────────────────────────────

const PRIORITY_LABELS: Record<string, string> = { high: "High", medium: "Medium", low: "Low" }
const CATEGORY_LABELS: Record<string, string> = {
  "Happy path": "Cas nominal",
  "Negative": "Cas négatif",
  "Edge case": "Cas limite",
  "Permissions/Security": "Permissions/Sécurité",
  "UI/UX": "UI/UX",
  "Data/State": "Données/État",
  "Integration": "Intégration",
}

// ── Priority badge ─────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: string }) {
  const label = PRIORITY_LABELS[priority] ?? (priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : "—")
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium cursor-pointer", {
        "border-red-200 text-red-600 bg-red-50/80": priority === "high",
        "border-amber-200 text-amber-600 bg-amber-50/80": priority === "medium",
        "border-emerald-200 text-emerald-600 bg-emerald-50/80": priority === "low",
      })}
    >
      {label}
    </Badge>
  )
}

// ── Sort icon ──────────────────────────────────────────────────────────────

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  return (
    <span
      className={cn("inline ml-1 text-[10px] leading-none", {
        "text-foreground": active,
        "text-muted-foreground/30": !active,
      })}
    >
      {active ? (direction === "asc" ? "▲" : "▼") : "▲"}
    </span>
  )
}

// ── Sort logic ─────────────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }

function sortedTestCases(
  testCases: any[],
  reqLabelMap: Map<string, string>,
  column: SortColumn,
  direction: SortDirection
): any[] {
  const dir = direction === "asc" ? 1 : -1

  return [...testCases].sort((a, b) => {
    if (column === "requirement") {
      const la = reqLabelMap.get(a.requirement_id) ?? ""
      const lb = reqLabelMap.get(b.requirement_id) ?? ""
      return la.localeCompare(lb) * dir
    }
    if (column === "tc") {
      return (a.tc_code ?? "").localeCompare(b.tc_code ?? "") * dir
    }
    if (column === "category") {
      return (a.category ?? "").localeCompare(b.category ?? "") * dir
    }
    if (column === "priority") {
      const pa = PRIORITY_ORDER[a.priority] ?? 99
      const pb = PRIORITY_ORDER[b.priority] ?? 99
      return (pa - pb) * dir
    }
    return 0
  })
}

// ── Main component ─────────────────────────────────────────────────────────

export function TestCasesTable({
  testCases,
  requirements,
  editingCell,
  editingValue,
  onEditStart,
  onEditChange,
  onEditCommit,
  onDirectCommit,
}: TestCasesTableProps) {
  const [sortCol, setSortCol] = useState<SortColumn>("requirement")
  const [sortDir, setSortDir] = useState<SortDirection>("asc")

  if (testCases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <FlaskConical className="h-5 w-5 text-muted-foreground/40" />
        </div>
        <p className="text-sm text-muted-foreground">Aucun cas de test.</p>
        <p className="text-xs text-muted-foreground/60">Générez-les depuis l'onglet Exigences.</p>
      </div>
    )
  }

  // Map requirement id → UI display label (index-based, mirrors RequirementsTable)
  const reqLabelMap = new Map(
    requirements.map((r, i) => [r.id, `REQ-${String(i + 1).padStart(3, "0")}`])
  )

  const handleSort = (col: SortColumn) => {
    if (col === sortCol) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortCol(col)
      setSortDir("asc")
    }
  }

  // Apply sorting before grouping
  const sorted = sortedTestCases(testCases, reqLabelMap, sortCol, sortDir)

  // Group consecutive TCs by requirement label
  const groups: { reqLabel: string; tcs: any[] }[] = []
  for (const tc of sorted) {
    const reqLabel = reqLabelMap.get(tc.requirement_id) ?? tc.requirements?.req_code ?? "—"
    const last = groups[groups.length - 1]
    if (last && last.reqLabel === reqLabel) {
      last.tcs.push(tc)
    } else {
      groups.push({ reqLabel, tcs: [tc] })
    }
  }

  const editableInput = (tc: any, field: TcField, value: string) => {
    if (editingCell?.id === tc.id && editingCell?.field === field) {
      return (
        <Input
          value={editingValue}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onEditCommit}
          onKeyDown={(e) => e.key === "Enter" && onEditCommit()}
          autoFocus
          className="h-7 text-sm"
        />
      )
    }
    return (
      <span onClick={() => onEditStart(tc.id, field, value)} className="cursor-text">
        {value}
      </span>
    )
  }

  const editableTextarea = (tc: any, field: TcField, value: string) => {
    if (editingCell?.id === tc.id && editingCell?.field === field) {
      return (
        <textarea
          value={editingValue}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onEditCommit}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onEditCommit()}
          autoFocus
          rows={Math.max(1, editingValue.split("\n").length)}
          className="w-full text-sm resize-none border-0 outline-none ring-1 ring-ring rounded px-2 py-1 bg-background"
        />
      )
    }
    return (
      <span onClick={() => onEditStart(tc.id, field, value)} className="cursor-text whitespace-pre-wrap">
        {value}
      </span>
    )
  }

  const sortableHead = (col: SortColumn, label: string, className?: string) => (
    <TableHead
      className={cn("px-4 py-3 text-xs uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors", className, {
        "font-bold text-foreground": sortCol === col,
        "font-semibold text-muted-foreground": sortCol !== col,
      })}
      onClick={() => handleSort(col)}
    >
      {label}
      <SortIcon active={sortCol === col} direction={sortDir} />
    </TableHead>
  )

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-b">
          {sortableHead("requirement", "Exigence", "w-32")}
          {sortableHead("tc", "CT", "w-24")}
          {sortableHead("category", "Catégorie", "w-28")}
          <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
            Étapes
          </TableHead>
          <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
            Résultat attendu
          </TableHead>
          {sortableHead("priority", "Priorité", "w-24")}
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((group) =>
          group.tcs.map((tc, tcIdx) => (
            <TableRow key={tc.id} className="hover:bg-muted/20 transition-colors border-b last:border-0">
              {tcIdx === 0 && (
                <TableCell
                  rowSpan={group.tcs.length}
                  className="font-mono font-semibold text-xs align-top px-4 py-3 border-r bg-muted/30 text-muted-foreground whitespace-nowrap"
                >
                  {group.reqLabel}
                </TableCell>
              )}
              <TableCell className="font-mono text-xs text-muted-foreground align-top px-4 py-3 whitespace-nowrap">
                {tc.tc_code}
              </TableCell>
              <TableCell className="align-top px-4 py-3 text-sm">
                {editableInput(tc, "category", CATEGORY_LABELS[tc.category] ?? tc.category)}
              </TableCell>
              <TableCell className="align-top px-4 py-3 text-sm">
                {editableTextarea(tc, "steps", tc.steps)}
              </TableCell>
              <TableCell className="align-top px-4 py-3 text-sm">
                {editableTextarea(tc, "expected_result", tc.expected_result)}
              </TableCell>
              <TableCell className="align-top px-4 py-3">
                <Select
                  value={tc.priority ?? "medium"}
                  onValueChange={(val) => onDirectCommit?.(tc.id, "priority", val)}
                >
                  <SelectPrimitive.Trigger asChild>
                    <button type="button" className="focus:outline-none cursor-pointer hover:opacity-75 transition-opacity">
                      <PriorityBadge priority={tc.priority} />
                    </button>
                  </SelectPrimitive.Trigger>
                  <SelectContent position="popper" align="end" className="z-[9999]">
                    <SelectItem value="low">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        Low
                      </span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                        Medium
                      </span>
                    </SelectItem>
                    <SelectItem value="high">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                        High
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
