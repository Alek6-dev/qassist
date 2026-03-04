"use client"

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
import { ClipboardList, Trash2 } from "lucide-react"

type ReqField = "req_code" | "description"

interface RequirementsTableProps {
  requirements: any[]
  editingCell: { id: string; field: ReqField } | null
  editingValue: string
  onEditStart: (id: string, field: ReqField, value: string) => void
  onEditChange: (v: string) => void
  onEditCommit: () => void
  onDelete: (id: string) => void
}

export function RequirementsTable({
  requirements,
  editingCell,
  editingValue,
  onEditStart,
  onEditChange,
  onEditCommit,
  onDelete,
}: RequirementsTableProps) {
  if (requirements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <ClipboardList className="h-5 w-5 text-muted-foreground/40" />
        </div>
        <p className="text-sm text-muted-foreground">No requirements for this project.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-b">
          <TableHead className="w-36 px-4 py-3 text-xs font-semibold uppercase tracking-wide">
            Requirement
          </TableHead>
          <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
            Description
          </TableHead>
          <TableHead className="w-12 px-4 py-3" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {requirements.map((req) => (
          <TableRow key={req.id} className="hover:bg-muted/30 transition-colors border-b last:border-0">
            <TableCell className="font-mono font-medium align-top px-4 py-3 text-sm">
              {editingCell?.id === req.id && editingCell?.field === "req_code" ? (
                <Input
                  value={editingValue}
                  onChange={(e) => onEditChange(e.target.value)}
                  onBlur={onEditCommit}
                  onKeyDown={(e) => e.key === "Enter" && onEditCommit()}
                  autoFocus
                  className="h-7 text-sm font-mono"
                />
              ) : (
                <span
                  onClick={() => onEditStart(req.id, "req_code", req.req_code)}
                  className="cursor-text"
                >
                  {req.req_code}
                </span>
              )}
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

            <TableCell className="align-top text-right px-4 py-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5"
                onClick={() => onDelete(req.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
