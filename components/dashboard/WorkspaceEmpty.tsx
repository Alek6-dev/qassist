"use client"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { UploadCloud } from "lucide-react"

interface WorkspaceEmptyProps {
  specInput: string
  onSpecChange: (v: string) => void
  onGenerate: () => void
  loading: boolean
}

export function WorkspaceEmpty({ specInput, onSpecChange, onGenerate, loading }: WorkspaceEmptyProps) {
  return (
    <div className="flex flex-col items-center pt-10">
      <div className="w-full max-w-2xl space-y-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Create a new project</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Paste a functional specification to generate structured requirements automatically.
          </p>
        </div>

        {/* Drop zone */}
        <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 px-8 py-10 flex flex-col items-center gap-3 text-center select-none">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <UploadCloud className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Drag &amp; drop a PDF specification</p>
            <p className="text-xs text-muted-foreground/50 mt-0.5">or paste your text below</p>
          </div>
        </div>

        <Textarea
          value={specInput}
          onChange={(e) => onSpecChange(e.target.value)}
          placeholder="Paste your specification here…"
          className="min-h-[160px] resize-none text-sm"
        />

        <Button
          onClick={onGenerate}
          disabled={loading || specInput.trim() === ""}
          className="w-full"
        >
          {loading ? "Generating requirements…" : "Generate Requirements"}
        </Button>
      </div>
    </div>
  )
}
