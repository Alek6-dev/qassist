"use client"

import { useState, useRef, useCallback, DragEvent } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { UploadCloud, CheckCircle2, X } from "lucide-react"

interface WorkspaceEmptyProps {
  specInput: string
  onSpecChange: (v: string) => void
  onGenerate: () => void
  loading: boolean
}

type PdfState = {
  fileName: string
  charCount: number
  previewText: string
}

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export function WorkspaceEmpty({ specInput, onSpecChange, onGenerate, loading }: WorkspaceEmptyProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [pdfState, setPdfState] = useState<PdfState | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Validation ────────────────────────────────────────────────────────────

  const validateFile = (file: File): string | null => {
    if (file.type !== "application/pdf") return "Le fichier doit être un PDF."
    if (file.size > MAX_SIZE) return "Le fichier dépasse la limite de 10MB."
    return null
  }

  // ── Upload & extract ──────────────────────────────────────────────────────

  const processFile = useCallback(async (file: File) => {
    setUploadError(null)
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/extract-pdf", { method: "POST", body: formData })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        if (res.status === 422) {
          setUploadError("Aucun texte lisible n'a été trouvé dans ce PDF.\nMerci de coller votre spécification manuellement.")
        } else {
          setUploadError(body.error ?? "Échec de l'extraction du PDF.")
        }
        return
      }

      const { text } = await res.json()
      if (!text || !text.trim()) {
        setUploadError("Aucun texte exploitable n'a été trouvé dans ce PDF.\nMerci de coller votre spécification manuellement.")
        return
      }
      setPdfState({ fileName: file.name, charCount: text.length, previewText: text })
      // Set extracted text as the specInput so the existing generate flow works unchanged
      onSpecChange(text)
    } catch {
      setUploadError("Erreur réseau lors de l'extraction du PDF.")
    } finally {
      setIsUploading(false)
    }
  }, [onSpecChange])

  // ── File selection entry point ────────────────────────────────────────────

  const handleFileSelected = useCallback((file: File) => {
    const err = validateFile(file)
    if (err) { setUploadError(err); return }

    // If textarea has manual text (not from a previous PDF), ask for confirmation
    if (specInput.trim() !== "" && pdfState === null) {
      setPendingFile(file)
      setShowConfirm(true)
      return
    }

    processFile(file)
  }, [specInput, pdfState, processFile])

  // ── Drag & drop handlers ──────────────────────────────────────────────────

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelected(file)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  // ── File input (click to browse) ──────────────────────────────────────────

  const handleClick = () => fileInputRef.current?.click()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelected(file)
    e.target.value = "" // reset so same file can be re-selected
  }

  // ── Confirm dialog handlers ───────────────────────────────────────────────

  const handleConfirmReplace = () => {
    setShowConfirm(false)
    onSpecChange("")
    if (pendingFile) processFile(pendingFile)
    setPendingFile(null)
  }

  const handleCancelConfirm = () => {
    setShowConfirm(false)
    setPendingFile(null)
  }

  // ── Remove PDF ────────────────────────────────────────────────────────────

  const handleRemovePdf = () => {
    setPdfState(null)
    onSpecChange("")
    setUploadError(null)
  }

  const handleClosePreview = () => {
    // Persist any in-progress edits to specInput before closing
    if (pdfState) {
      onSpecChange(pdfState.previewText)
    }
    setShowPreview(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center pt-10">
      <div className="w-full max-w-2xl space-y-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Créer un nouveau projet</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Collez une spécification fonctionnelle pour générer des exigences structurées automatiquement.
          </p>
        </div>

        {/* Drop zone — success state when PDF uploaded, interactive otherwise */}
        {pdfState ? (
          <div className="rounded-xl border-2 border-dashed border-green-500/50 bg-green-500/5 px-8 py-8 flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm font-medium text-foreground">
              ✓ {pdfState.fileName} uploadé avec succès
            </p>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="text-xs text-blue-500 hover:underline"
            >
              Aperçu du texte extrait
            </button>
            <button
              type="button"
              onClick={handleRemovePdf}
              className="text-xs text-muted-foreground hover:text-destructive mt-1"
            >
              Supprimer et recommencer
            </button>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
            className={`rounded-xl border-2 border-dashed px-8 py-10 flex flex-col items-center gap-3 text-center select-none cursor-pointer transition-colors ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/30"
            } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              {isUploading ? (
                <div className="h-5 w-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <UploadCloud className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {isUploading ? "Extraction du texte en cours…" : "Importez ou déposez votre document PDF ici"}
              </p>
              {!isUploading && (
                <p className="text-xs text-muted-foreground/50 mt-0.5">Max 10MB — ou collez votre texte ci-dessous</p>
              )}
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleInputChange}
        />

        {/* Upload / extraction error */}
        {uploadError && (
          <p className="text-xs text-destructive whitespace-pre-line">{uploadError}</p>
        )}

        {/* Textarea — available for manual input; hidden when PDF is loaded */}
        {!pdfState && (
          <Textarea
            value={specInput}
            onChange={(e) => onSpecChange(e.target.value)}
            placeholder="Collez votre spécification ici…"
            className="min-h-[160px] resize-none text-sm"
          />
        )}

        <Button
          onClick={onGenerate}
          disabled={loading || specInput.trim() === ""}
          className="w-full"
        >
          {loading ? "Génération des exigences…" : "Générer les exigences"}
        </Button>
      </div>

      {/* ── Confirm replace modal ─────────────────────────────────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCancelConfirm} />
          <div className="relative bg-background rounded-lg border shadow-lg p-6 w-[360px]">
            <p className="text-sm font-medium mb-2">Remplacer le texte actuel ?</p>
            <p className="text-sm text-muted-foreground mb-5">
              L'upload d'un PDF supprimera le texte actuellement écrit. Voulez-vous continuer ?
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={handleCancelConfirm}>Annuler</Button>
              <Button size="sm" onClick={handleConfirmReplace}>Continuer</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview modal ─────────────────────────────────────────────────── */}
      {showPreview && pdfState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleClosePreview} />
          <div
            className="relative bg-background rounded-lg border shadow-lg w-[640px] max-w-[90vw] flex flex-col"
            style={{ height: "70vh" }}
          >
            {/* Modal header */}
            <div className="px-6 py-4 border-b flex items-start justify-between shrink-0">
              <div>
                <p className="text-sm font-medium">Texte extrait de : {pdfState.fileName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ~{pdfState.charCount.toLocaleString()} caractères extraits
                </p>
              </div>
              <button
                type="button"
                onClick={handleClosePreview}
                className="text-muted-foreground hover:text-foreground ml-4 mt-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Editable text — scrollable, no save button, blur validates */}
            <div className="flex-1 overflow-hidden px-6 py-4">
              <textarea
                value={pdfState.previewText}
                onChange={(e) => {
                  const newText = e.target.value
                  setPdfState(prev => prev ? { ...prev, previewText: newText } : null)
                }}
                onBlur={(e) => {
                  const newText = e.target.value
                  onSpecChange(newText)
                  setPdfState(prev => prev ? { ...prev, charCount: newText.length } : null)
                }}
                className="w-full h-full text-xs text-muted-foreground font-sans leading-relaxed resize-none bg-transparent outline-none"
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
