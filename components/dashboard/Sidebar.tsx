"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FileText, FolderKanban, LogOut, Zap } from "lucide-react"

type Project = { id: string; title: string; created_at: string | null }

interface SidebarProps {
  projects: Project[]
  selectedId: string | null
  loading: boolean
  onSelect: (id: string) => void
  onLogout: () => void
  onLogoClick: () => void
}

export function Sidebar({ projects, selectedId, loading, onSelect, onLogout, onLogoClick }: SidebarProps) {
  return (
    <aside className="w-60 border-r bg-sidebar flex flex-col h-screen shrink-0">
      {/* Logo */}
      <button
        onClick={onLogoClick}
        className="h-14 flex items-center gap-2.5 px-4 border-b shrink-0 w-full hover:bg-muted/40 transition-colors"
      >
        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0">
          <Zap className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm tracking-tight">QAssist</span>
      </button>

      {/* Projects section */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className="flex items-center gap-1.5 px-2 mb-1.5">
          <FolderKanban className="h-3 w-3 text-muted-foreground/70" />
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            Projects
          </span>
        </div>

        {loading && (
          <p className="px-3 py-2 text-sm text-muted-foreground">Loading…</p>
        )}

        {!loading && projects.length === 0 && (
          <p className="px-3 py-2 text-sm text-muted-foreground">No projects yet.</p>
        )}

        <nav className="space-y-0.5 mt-1">
          {projects.map((project) => (
            <button
              key={project.id}
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
              <span className="truncate">{project.title}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Logout */}
      <div className="px-3 py-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground h-8 px-2.5"
          onClick={onLogout}
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
