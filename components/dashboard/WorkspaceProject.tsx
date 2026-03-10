"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { RequirementsTable } from "./RequirementsTable"
import { TestCasesTable } from "./TestCasesTable"
import { ClarificationsTable } from "./ClarificationsTable"

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
}

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
}: WorkspaceProjectProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      {/* Card header: tabs + action button */}
      <div className="flex items-center justify-between border-b bg-card px-1">
        <div className="flex items-center">
          <button
            onClick={() => onViewChange("requirements")}
            className={cn(
              "px-4 py-3.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeView === "requirements"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Requirements
          </button>
          <button
            onClick={() => onViewChange("testcases")}
            className={cn(
              "px-4 py-3.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeView === "testcases"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Test Cases
          </button>
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
              {tcLoading ? "Generating…" : "Generate Test Cases"}
            </Button>
          </div>
        )}
      </div>

      {/* Card body */}
      {activeView === "requirements" && (
        <>
          <RequirementsTable
            requirements={requirements}
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
    </div>
  )
}
