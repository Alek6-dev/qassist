"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AlertCircle } from "lucide-react"

const TYPE_LABELS: Record<string, string> = {
  ambiguity: "Ambiguïté",
  missing_rule: "Règle métier manquante",
  missing_info: "Information manquante",
}

interface ClarificationsTableProps {
  clarifications: any[]
}

export function ClarificationsTable({ clarifications }: ClarificationsTableProps) {
  return (
    <div className="border-t">
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-amber-50/60">
        <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          {clarifications.length > 0
            ? `Points à clarifier (${clarifications.length})`
            : "Points à clarifier"}
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b">
            <TableHead className="w-32 px-4 py-3 text-xs font-semibold uppercase tracking-wide">
              Référence
            </TableHead>
            <TableHead className="w-28 px-4 py-3 text-xs font-semibold uppercase tracking-wide">
              Type
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
              Ambiguïté
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
              Recommandation
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clarifications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="px-4 py-4 text-sm text-muted-foreground">
                Aucune clarification nécessaire pour ces exigences.
              </TableCell>
            </TableRow>
          ) : (
            clarifications.map((c, idx) => (
              <TableRow key={idx} className="hover:bg-muted/20 transition-colors border-b last:border-0">
                <TableCell className="font-mono font-medium text-sm align-top px-4 py-3 whitespace-nowrap">
                  {c.element_reference}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground align-top px-4 py-3 whitespace-nowrap">
                  {TYPE_LABELS[c.type] ?? c.type}
                </TableCell>
                <TableCell className="text-sm align-top px-4 py-3">
                  {c.explanation}
                </TableCell>
                <TableCell className="text-sm align-top px-4 py-3 text-muted-foreground">
                  {c.recommendation}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
