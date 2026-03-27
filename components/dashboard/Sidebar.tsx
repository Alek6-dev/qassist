"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FileText, FolderKanban, LogOut, MoreHorizontal } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type Project = { id: string; title: string; created_at: string | null }

type Plan = 'free' | 'starter' | 'pro'

const PLAN_LABELS: Record<Plan, string> = { free: 'Free', starter: 'Starter', pro: 'Pro' }
const PLAN_COLORS: Record<Plan, string> = {
  free: 'bg-gray-100 text-gray-500',
  starter: 'bg-indigo-50 text-indigo-600',
  pro: 'bg-violet-50 text-violet-600',
}

interface SidebarProps {
  projects: Project[]
  selectedId: string | null
  loading: boolean
  onSelect: (id: string) => void
  onLogout: () => void
  onLogoClick: () => void
  onRename: (id: string, newTitle: string) => void
  onDeleteRequest: (id: string) => void
  plan?: Plan
}

export function Sidebar({ projects, selectedId, loading, onSelect, onLogout, onLogoClick, onRename, onDeleteRequest, plan = 'free' }: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const renameInputRef = useRef<HTMLInputElement>(null)

  // Focus input when rename starts
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingId])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!openMenuId) return
    const handler = () => setOpenMenuId(null)
    document.addEventListener("click", handler)
    return () => document.removeEventListener("click", handler)
  }, [openMenuId])

  const startRename = (project: Project) => {
    setOpenMenuId(null)
    setRenamingId(project.id)
    setRenameValue(project.title)
  }

  const commitRename = () => {
    if (!renamingId) return
    const trimmed = renameValue.trim()
    if (trimmed) onRename(renamingId, trimmed)
    setRenamingId(null)
  }

  return (
    <aside className="w-60 border-r bg-sidebar flex flex-col h-screen shrink-0">
      {/* Logo */}
      <button
        onClick={onLogoClick}
        className="h-14 flex items-center gap-2.5 px-4 border-b shrink-0 w-full hover:bg-muted/40 transition-colors"
      >
        <Image
          src="/Logo-MyQAssist.svg"
          alt="MyQAssist logo"
          width={24}
          height={24}
          className="shrink-0"
        />
        <span className="font-semibold text-sm tracking-tight">MyQAssist</span>
      </button>

      {/* Projects section */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className="flex items-center gap-1.5 px-2 mb-1.5">
          <FolderKanban className="h-3 w-3 text-muted-foreground/70" />
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            Projets
          </span>
        </div>

        {loading && (
          <p className="px-3 py-2 text-sm text-muted-foreground">Loading…</p>
        )}

        {!loading && projects.length === 0 && (
          <p className="px-3 py-2 text-sm text-muted-foreground">Aucun projet.</p>
        )}

        <nav className="space-y-0.5 mt-1">
          {projects.map((project) => (
            <div
              key={project.id}
              className="relative"
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {renamingId === project.id ? (
                /* Inline rename input */
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <input
                    ref={renameInputRef}
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") commitRename()
                      if (e.key === "Escape") setRenamingId(null)
                    }}
                    onBlur={commitRename}
                    className="flex-1 min-w-0 bg-transparent text-sm text-foreground font-medium outline-none"
                  />
                </div>
              ) : (
                /* Normal project row */
                <button
                  onClick={() => onSelect(project.id)}
                  className={cn(
                    "w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors",
                    selectedId === project.id
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <FileText
                    className={cn("h-3.5 w-3.5 shrink-0",
                      selectedId === project.id ? "text-primary" : "text-muted-foreground/50"
                    )}
                  />
                  <span className="truncate flex-1">{project.title}</span>

                  {/* "..." actions button — visible on hover or when menu is open */}
                  {(hoveredId === project.id || openMenuId === project.id) && (
                    <span
                      role="button"
                      onClick={e => {
                        e.stopPropagation()
                        setOpenMenuId(openMenuId === project.id ? null : project.id)
                      }}
                      className="p-0.5 rounded hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              )}

              {/* Dropdown menu */}
              {openMenuId === project.id && (
                <div
                  className="absolute right-0 top-full mt-0.5 z-50 w-36 rounded-md border bg-popover shadow-md py-1"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                    onClick={() => startRename(project)}
                  >
                    Renommer
                  </button>
                  <button
                    className="w-full text-left px-3 py-1.5 text-sm text-destructive hover:bg-muted transition-colors"
                    onClick={() => {
                      setOpenMenuId(null)
                      onDeleteRequest(project.id)
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Plan badge + billing link */}
      <div className="px-3 pt-3 pb-1 border-t">
        <Link
          href="/dashboard/billing"
          className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-muted/60 transition-colors group"
        >
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Mon plan</span>
          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", PLAN_COLORS[plan])}>
            {PLAN_LABELS[plan]}
          </span>
        </Link>
      </div>

      {/* Logout */}
      <div className="px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground h-8 px-2.5"
          onClick={onLogout}
        >
          <LogOut className="h-3.5 w-3.5" />
          Déconnexion
        </Button>
      </div>
    </aside>
  )
}
