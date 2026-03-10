"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { WorkspaceEmpty } from "@/components/dashboard/WorkspaceEmpty"
import { WorkspaceProject } from "@/components/dashboard/WorkspaceProject"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"

type Project = { id: string; title: string; created_at: string | null }

export default function Dashboard() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [specInput, setSpecInput] = useState("")

  const [requirements, setRequirements] = useState<any[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<{ id: string; field: "req_code" | "description" } | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const [activeView, setActiveView] = useState<"requirements" | "testcases">("requirements")
  const [testCases, setTestCases] = useState<any[]>([])
  const [tcLoading, setTcLoading] = useState(false)
  const [clarifications, setClarifications] = useState<any[]>([])
  const [editingTcCell, setEditingTcCell] = useState<{ id: string; field: "category" | "steps" | "expected_result" | "priority" } | null>(null)
  const [editingTcValue, setEditingTcValue] = useState("")
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deletedReq, setDeletedReq] = useState<{ id: string; project_id: string; req_code: string; description: string } | null>(null)

  // ── Handlers: requirements inline editing ────────────────────────────────

  const handleTcDirectCommit = async (id: string, field: "category" | "steps" | "expected_result" | "priority", value: string) => {
    setTestCases(prev => prev.map(tc => tc.id === id ? { ...tc, [field]: value } : tc))
    await supabase.from("test_cases").update({ [field]: value }).eq("id", id)
  }

  const handleTcEditStart = (id: string, field: "category" | "steps" | "expected_result" | "priority", currentValue: string) => {
    setEditingTcCell({ id, field })
    setEditingTcValue(currentValue)
  }

  const handleTcEditCommit = async () => {
    if (!editingTcCell) return
    const { id, field } = editingTcCell
    const value = editingTcValue
    setEditingTcCell(null)
    setTestCases(prev => prev.map(tc => tc.id === id ? { ...tc, [field]: value } : tc))
    await supabase.from("test_cases").update({ [field]: value }).eq("id", id)
  }

  const handleEditStart = (id: string, field: "req_code" | "description", currentValue: string) => {
    setEditingCell({ id, field })
    setEditingValue(currentValue)
  }

  const handleEditCommit = async () => {
    if (!editingCell) return
    const { id, field } = editingCell
    const value = editingValue
    setEditingCell(null)
    setRequirements(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
    await supabase.from("requirements").update({ [field]: value }).eq("id", id)
  }

  const handleRenameProject = async (id: string, newTitle: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, title: newTitle } : p))
    await supabase.from("projects").update({ title: newTitle }).eq("id", id)
  }

  const handleDeleteProject = async () => {
    if (!deleteTargetId) return
    const id = deleteTargetId
    setDeleteTargetId(null)
    setProjects(prev => prev.filter(p => p.id !== id))
    if (selectedProjectId === id) setSelectedProjectId(null)
    await supabase.from("projects").delete().eq("id", id)
  }

  const handleAddRequirement = async (req_code: string, description: string) => {
    if (!selectedProjectId) return
    await supabase.from("requirements").insert({ project_id: selectedProjectId, req_code, description })
    await fetchRequirements(selectedProjectId)
  }

  const handleDelete = async (id: string) => {
    if (!selectedProjectId) return
    const req = requirements.find(r => r.id === id)
    if (req) setDeletedReq({ id: req.id, project_id: req.project_id, req_code: req.req_code, description: req.description })
    await supabase.from("requirements").delete().eq("id", id)
    fetchRequirements(selectedProjectId)
  }

  // ── Undo last requirement deletion (Ctrl+Z) ──────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== "z") return
      const tag = (document.activeElement as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      if (!deletedReq) return
      e.preventDefault()
      const req = deletedReq
      setDeletedReq(null)
      supabase.from("requirements")
        .insert({ id: req.id, project_id: req.project_id, req_code: req.req_code, description: req.description })
        .then(() => fetchRequirements(req.project_id))
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [deletedReq])

  // ── Data fetching ────────────────────────────────────────────────────────

  const fetchRequirements = async (projectId: string) => {
    const { data, error } = await supabase
      .from("requirements")
      .select("*")
      .eq("project_id", projectId)
      .order("req_code")

    if (error) {
      console.error("Erreur fetch requirements:", error)
    } else {
      setRequirements(data ?? [])
    }
  }

  const fetchClarifications = async (projectId: string) => {
    const { data } = await supabase
      .from("clarifications")
      .select("*")
      .eq("project_id", projectId)
      .order("element_reference")
    setClarifications(data ?? [])
  }

  const fetchTestCases = async (projectId: string) => {
    const { data, error } = await supabase
      .from("test_cases")
      .select("*, requirements(req_code)")
      .eq("project_id", projectId)
      .order("tc_code")

    if (error) {
      console.error("Erreur fetch test cases:", error)
    } else {
      setTestCases(data ?? [])
    }
  }

  const handleGenerateTestCases = async () => {
    if (!selectedProjectId) return
    setTcLoading(true)
    try {
      const res = await fetch("/api/generate-test-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId }),
      })
      if (res.ok) {
        await fetchTestCases(selectedProjectId)
        setActiveView("testcases")
      } else {
        const text = await res.text()
        setError(`Erreur génération test cases ${res.status} : ${text}`)
      }
    } catch (err: any) {
      setError(`Erreur réseau : ${err.message}`)
    } finally {
      setTcLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedProjectId) return
    setActiveView("requirements")
    setTestCases([])
    setClarifications([])
    fetchRequirements(selectedProjectId)
    fetchTestCases(selectedProjectId)
    fetchClarifications(selectedProjectId)
  }, [selectedProjectId])

  const fetchProjects = async () => {
    setError("")
    setLoading(true)

    const { data, error } = await supabase
      .from("projects")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erreur fetch projects:", error)
      setError(error.message)
      setProjects([])
    } else {
      setProjects((data ?? []) as Project[])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleGenerateRequirements = async () => {
    setError("")

    if (specInput.trim() === "") {
      setError("La spécification est obligatoire")
      return
    }

    setAiLoading(true)
    setRequirements([])

    try {
      const res = await fetch("/api/generate-requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specification: specInput }),
      })

      if (res.ok) {
        const data = await res.json()
        setRequirements(data.requirements || [])
        setSpecInput("")
        await fetchProjects()
        if (data.project?.id) {
          setSelectedProjectId(data.project.id)
        }
      } else {
        const text = await res.text()
        setError(`Erreur ${res.status} : ${text}`)
      }
    } catch (err: any) {
      setError(`Erreur réseau : ${err.message}`)
    } finally {
      setAiLoading(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        projects={projects}
        selectedId={selectedProjectId}
        loading={loading}
        onSelect={setSelectedProjectId}
        onLogout={handleLogout}
        onLogoClick={() => setSelectedProjectId(null)}
        onRename={handleRenameProject}
        onDeleteRequest={setDeleteTargetId}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="h-14 flex items-center justify-between px-8 border-b bg-background shrink-0">
          <span className="text-sm font-medium text-foreground">
            {selectedProject?.title ?? "Dashboard"}
          </span>
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
        </header>

        {/* Scrollable workspace */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {error && (
            <div className="mb-5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {!selectedProjectId ? (
            <WorkspaceEmpty
              specInput={specInput}
              onSpecChange={setSpecInput}
              onGenerate={handleGenerateRequirements}
              loading={aiLoading}
            />
          ) : (
            <WorkspaceProject
              activeView={activeView}
              onViewChange={setActiveView}
              requirements={requirements}
              editingReqCell={editingCell}
              editingReqValue={editingValue}
              onReqEditStart={handleEditStart}
              onReqEditChange={setEditingValue}
              onReqEditCommit={handleEditCommit}
              onReqDelete={handleDelete}
              onReqAdd={handleAddRequirement}
              hasTestCases={testCases.length > 0}
              testCases={testCases}
              editingTcCell={editingTcCell}
              editingTcValue={editingTcValue}
              onTcEditStart={handleTcEditStart}
              onTcEditChange={setEditingTcValue}
              onTcEditCommit={handleTcEditCommit}
              tcLoading={tcLoading}
              onGenerateTestCases={handleGenerateTestCases}
              clarifications={clarifications}
              onTcDirectCommit={handleTcDirectCommit}
            />
          )}
        </main>
      </div>

      {/* Delete confirmation modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTargetId(null)} />
          <div className="relative bg-background rounded-lg border shadow-lg p-6 w-80">
            <p className="text-sm font-medium mb-4">Delete this project?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setDeleteTargetId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteProject}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
