"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

type Props = {
  id: string
  tc_code: string
  category: string
  preconditions: string
  steps: string
  expected_result: string
}

type Field = "tc_code" | "category" | "preconditions" | "steps" | "expected_result"

export default function EditableTestCase({
  id,
  tc_code,
  category,
  preconditions,
  steps,
  expected_result,
}: Props) {
  const [activeField, setActiveField] = useState<Field | null>(null)
  const [tcCode, setTcCode] = useState(tc_code)
  const [cat, setCat] = useState(category)
  const [pre, setPre] = useState(preconditions)
  const [stps, setStps] = useState(steps)
  const [result, setResult] = useState(expected_result)
  const [error, setError] = useState("")

  const handleSave = async (field: Field, value: string) => {
    setError("")
    setActiveField(null)

    const { error: updateError } = await supabase
      .from("test_cases")
      .update({ [field]: value.trim() })
      .eq("id", id)

    if (updateError) {
      setError("Erreur lors de la sauvegarde")
    }
  }

  return (
    <div style={{ marginTop: 12, padding: "8px 12px", borderLeft: "3px solid #ccc" }}>

      <div>
        {activeField === "tc_code" ? (
          <input
            autoFocus
            value={tcCode}
            onChange={(e) => setTcCode(e.target.value)}
            onBlur={(e) => handleSave("tc_code", e.target.value)}
            style={{ fontWeight: "bold", width: 100 }}
          />
        ) : (
          <strong onClick={() => setActiveField("tc_code")} style={{ cursor: "pointer" }}>
            {tcCode}
          </strong>
        )}
        {" — "}
        {activeField === "category" ? (
          <input
            autoFocus
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            onBlur={(e) => handleSave("category", e.target.value)}
            style={{ width: 160 }}
          />
        ) : (
          <span onClick={() => setActiveField("category")} style={{ cursor: "pointer" }}>
            {cat}
          </span>
        )}
      </div>

      <div style={{ marginTop: 4 }}>
        <span style={{ fontWeight: 600 }}>Préconditions :</span>
        {activeField === "preconditions" ? (
          <textarea
            autoFocus
            value={pre}
            onChange={(e) => setPre(e.target.value)}
            onBlur={(e) => handleSave("preconditions", e.target.value)}
            style={{ display: "block", width: "100%", minHeight: 48 }}
          />
        ) : (
          <div onClick={() => setActiveField("preconditions")} style={{ cursor: "pointer" }}>
            {pre}
          </div>
        )}
      </div>

      <div style={{ marginTop: 4 }}>
        <span style={{ fontWeight: 600 }}>Étapes :</span>
        {activeField === "steps" ? (
          <textarea
            autoFocus
            value={stps}
            onChange={(e) => setStps(e.target.value)}
            onBlur={(e) => handleSave("steps", e.target.value)}
            style={{ display: "block", width: "100%", minHeight: 72 }}
          />
        ) : (
          <div onClick={() => setActiveField("steps")} style={{ cursor: "pointer" }}>
            {stps.split("\n").map((step, i) => (
              <div key={i}>{step}</div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 4 }}>
        <span style={{ fontWeight: 600 }}>Résultat attendu :</span>
        {activeField === "expected_result" ? (
          <textarea
            autoFocus
            value={result}
            onChange={(e) => setResult(e.target.value)}
            onBlur={(e) => handleSave("expected_result", e.target.value)}
            style={{ display: "block", width: "100%", minHeight: 48 }}
          />
        ) : (
          <div onClick={() => setActiveField("expected_result")} style={{ cursor: "pointer" }}>
            {result}
          </div>
        )}
      </div>

      {error && (
        <span style={{ color: "red", fontSize: 12, marginTop: 4, display: "block" }}>
          {error}
        </span>
      )}
    </div>
  )
}
