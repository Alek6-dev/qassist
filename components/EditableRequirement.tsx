"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Props = {
  id: string
  req_code: string
  description: string
}

export default function EditableRequirement({ id, req_code, description }: Props) {
  const router = useRouter()
  const [code, setCode] = useState(req_code)
  const [desc, setDesc] = useState(description)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    const { error: deleteError } = await supabase
      .from("requirements")
      .delete()
      .eq("id", id)

    if (deleteError) {
      setError("Erreur lors de la suppression")
      return
    }

    router.refresh()
  }

  const handleSave = async (field: "req_code" | "description", value: string) => {
    const trimmed = value.trim()
    if (trimmed === (field === "req_code" ? req_code : description)) return

    setSaving(true)
    setError("")

    const { error: updateError } = await supabase
      .from("requirements")
      .update({ [field]: trimmed })
      .eq("id", id)

    if (updateError) {
      setError("Erreur lors de la sauvegarde")
    }

    setSaving(false)
  }

  return (
    <li>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onBlur={(e) => handleSave("req_code", e.target.value)}
        style={{ fontWeight: "bold", width: 90 }}
      />
      {" : "}
      <input
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        onBlur={(e) => handleSave("description", e.target.value)}
        style={{ width: 500 }}
      />
      <button onClick={handleDelete} style={{ marginLeft: 8, color: "red" }} title="Supprimer">×</button>
      {saving && <span style={{ marginLeft: 8, color: "gray", fontSize: 12 }}>Enregistrement…</span>}
      {error && <span style={{ marginLeft: 8, color: "red", fontSize: 12 }}>{error}</span>}
    </li>
  )
}
