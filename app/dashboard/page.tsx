"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Project = { id: string; title: string; created_at: string | null }

export default function Dashboard() {
  const router = useRouter()
      const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [specInput, setSpecInput] = useState("")

    // États pour le bloc IA temporaire
  const [requirements, setRequirements] = useState<any[]>([])
  const [aiLoading, setAiLoading] = useState(false)

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

    return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Container principal avec 2 colonnes */}
      <div style={{ display: "flex", gap: 20 }}>
        {/* Colonne gauche - Sidebar */}
        <div style={{ width: 250, flexShrink: 0 }}>
          <h2>Mes projets</h2>

          {loading && <p>Chargement…</p>}
          {!loading && error && <p style={{ color: "red" }}>Erreur : {error}</p>}
          {!loading && !error && projects.length === 0 && <p>Aucun projet pour le moment.</p>}

          {!loading && !error && projects.length > 0 && (
            <ul>
              {projects.map((project) => (
                <li key={project.id}>
                  <strong>{project.title}</strong>
                  {project.created_at ? ` — ${new Date(project.created_at).toLocaleString("fr-FR")}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Colonne droite - Workspace */}
        <div style={{ flex: 1 }}>
          <div>
            <textarea
              value={specInput}
              onChange={(e) => setSpecInput(e.target.value)}
              placeholder="Collez votre spécification ici..."
              style={{ width: "100%", minHeight: 100, padding: 8 }}
            />
            <button onClick={handleGenerateRequirements} disabled={aiLoading} style={{ marginTop: 10 }}>
              Générer les requirements
            </button>
          </div>

          {aiLoading && <p style={{ marginTop: 10 }}>Génération…</p>}

          {!aiLoading && requirements.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3>Requirements générés</h3>
              <ul>
                {requirements.map((req: any, idx: number) => (
                  <li key={idx}>
                    <strong>{req.req_code}</strong> : {req.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}