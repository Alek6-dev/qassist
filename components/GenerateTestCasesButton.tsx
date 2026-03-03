"use client"

import { useState } from "react"

type Props = {
  projectId: string
}

export default function GenerateTestCasesButton({ projectId }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGenerate = async () => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/generate-test-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      })

      const data = await res.json()
      console.log("generate-test-cases response:", data)

      if (!res.ok) {
        setError(data.error ?? `Erreur ${res.status}`)
      }
    } catch (err: any) {
      setError(`Erreur réseau : ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 24 }}>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Génération…" : "Générer les test cases"}
      </button>
      {error && <span style={{ marginLeft: 8, color: "red", fontSize: 12 }}>{error}</span>}
    </div>
  )
}
