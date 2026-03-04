"use client"

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

interface TestCasesTableProps {
  testCases: any[]
  editingCell: { id: string; field: TcField } | null
  editingValue: string
  onEditStart: (id: string, field: TcField, value: string) => void
  onEditChange: (v: string) => void
  onEditCommit: () => void
  onDirectCommit?: (id: string, field: TcField, value: string) => void
}

function PriorityBadge({ priority }: { priority: string }) {
  const label = priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : "—"
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

export function TestCasesTable({
  testCases,
  editingCell,
  editingValue,
  onEditStart,
  onEditChange,
  onEditCommit,
  onDirectCommit,
}: TestCasesTableProps) {
  if (testCases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <FlaskConical className="h-5 w-5 text-muted-foreground/40" />
        </div>
        <p className="text-sm text-muted-foreground">No test cases yet.</p>
        <p className="text-xs text-muted-foreground/60">Generate them from the Requirements tab.</p>
      </div>
    )
  }

  // Group consecutive test cases by requirement
  const groups: { reqCode: string; tcs: any[] }[] = []
  for (const tc of testCases) {
    const reqCode = tc.requirements?.req_code ?? "—"
    const last = groups[groups.length - 1]
    if (last && last.reqCode === reqCode) {
      last.tcs.push(tc)
    } else {
      groups.push({ reqCode, tcs: [tc] })
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
      <span
        onClick={() => onEditStart(tc.id, field, value)}
        className="cursor-text"
      >
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
      <span
        onClick={() => onEditStart(tc.id, field, value)}
        className="cursor-text whitespace-pre-wrap"
      >
        {value}
      </span>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-b">
          <TableHead className="w-32 px-4 py-3 text-xs font-semibold uppercase tracking-wide">
            Requirement
          </TableHead>
          <TableHead className="w-24 px-4 py-3 text-xs font-semibold uppercase tracking-wide">
            TC
          </TableHead>
          <TableHead className="w-28 px-4 py-3 text-xs font-semibold uppercase tracking-wide">
            Category
          </TableHead>
          <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
            Steps
          </TableHead>
          <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
            Expected result
          </TableHead>
          <TableHead className="w-24 px-4 py-3 text-xs font-semibold uppercase tracking-wide">
            Priority
          </TableHead>
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
                  {group.reqCode}
                </TableCell>
              )}
              <TableCell className="font-mono text-xs text-muted-foreground align-top px-4 py-3 whitespace-nowrap">
                {tc.tc_code}
              </TableCell>
              <TableCell className="align-top px-4 py-3 text-sm">
                {editableInput(tc, "category", tc.category)}
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
