"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Props = {
  projectId: string
  nextReqCode: string
}

export default function AddRequirement({ projectId, nextReqCode }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAdd = async () => {
    setLoading(true)
    setError("")

    const { error: insertError } = await supabase
      .from("requirements")
      .insert({
        project_id: projectId,
        req_code: nextReqCode,
        description: "Nouveau requirement",
      })

    if (insertError) {
      setError("Erreur lors de l'ajout")
      setLoading(false)
      return
    }

    router.refresh()
    setLoading(false)
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <button onClick={handleAdd} disabled={loading}>
        + Ajouter un requirement
      </button>
      {error && <span style={{ marginLeft: 8, color: "red", fontSize: 12 }}>{error}</span>}
    </div>
  )
}
