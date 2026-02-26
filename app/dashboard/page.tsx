"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Project = { id: string; name: string; created_at: string | null }

export default function Dashboard() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchProjects = async () => {
    setError("")
    setLoading(true)

    const { data, error } = await supabase
      .from("projects")
      .select("id, name, created_at")
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

  const handleCreateProject = async () => {
    setError("")
    const { error } = await supabase.from("projects").insert({ name: "Projet test" })
    if (error) {
      console.error("Erreur insert project:", error)
      setError(error.message)
      return
    }
    await fetchProjects() // refresh liste après création
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={handleLogout}>Logout</button>
        <button onClick={handleCreateProject}>Créer un projet</button>
      </div>

      <hr style={{ margin: "20px 0" }} />

      <h2>Mes projets</h2>

      {loading && <p>Chargement…</p>}
      {!loading && error && <p style={{ color: "red" }}>Erreur : {error}</p>}
      {!loading && !error && projects.length === 0 && <p>Aucun projet pour le moment.</p>}

      {!loading && !error && projects.length > 0 && (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <strong>{project.name}</strong>
              {project.created_at ? ` — ${new Date(project.created_at).toLocaleString("fr-FR")}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}