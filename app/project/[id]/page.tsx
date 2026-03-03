import { Fragment } from "react"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import EditableRequirement from "@/components/EditableRequirement"
import AddRequirement from "@/components/AddRequirement"
import GenerateTestCasesButton from "@/components/GenerateTestCasesButton"
import EditableTestCase from "@/components/EditableTestCase"

type Requirement = { id: string; req_code: string; description: string }
type Project = { id: string; title: string; created_at: string | null }
type TestCase = {
  id: string
  requirement_id: string
  tc_code: string
  category: string
  preconditions: string
  steps: string
  expected_result: string
}
type Clarification = {
  id: string
  type: string
  element_reference: string
  explanation: string
  recommendation: string
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  )

  const { data: project } = await supabase
    .from("projects")
    .select("id, title, created_at")
    .eq("id", id)
    .single<Project>()

  if (!project) {
    notFound()
  }

  const { data: requirements } = await supabase
    .from("requirements")
    .select("id, req_code, description")
    .eq("project_id", id)
    .order("req_code")

  const reqs: Requirement[] = requirements ?? []
  const nextReqCode = `REQ_${String(reqs.length + 1).padStart(3, "0")}`

  const { data: testCasesData } = await supabase
    .from("test_cases")
    .select("id, requirement_id, tc_code, category, preconditions, steps, expected_result")
    .eq("project_id", id)
    .order("tc_code")

  const testCasesByReq: Record<string, TestCase[]> = {}
  for (const tc of (testCasesData ?? []) as TestCase[]) {
    if (!testCasesByReq[tc.requirement_id]) testCasesByReq[tc.requirement_id] = []
    testCasesByReq[tc.requirement_id].push(tc)
  }

  const { data: clarificationsData } = await supabase
    .from("clarifications")
    .select("id, type, element_reference, explanation, recommendation")
    .eq("project_id", id)
    .order("element_reference")

  const clarifications: Clarification[] = (clarificationsData ?? []) as Clarification[]

  return (
    <div style={{ padding: 20 }}>
      <Link href="/dashboard">← Retour au dashboard</Link>

      <h1 style={{ marginTop: 16 }}>{project.title}</h1>
      {project.created_at && (
        <p>{new Date(project.created_at).toLocaleString("fr-FR")}</p>
      )}

      <h2>Requirements</h2>

      <AddRequirement projectId={id} nextReqCode={nextReqCode} />

      {reqs.length === 0 ? (
        <p>Aucun requirement pour ce projet.</p>
      ) : (
        <ul>
          {reqs.map((req) => (
            <Fragment key={req.id}>
              <EditableRequirement
                id={req.id}
                req_code={req.req_code}
                description={req.description}
              />
              {(testCasesByReq[req.id] ?? []).map((tc) => (
                <li key={tc.id} style={{ marginLeft: 32, listStyleType: "none" }}>
                  <EditableTestCase
                    id={tc.id}
                    tc_code={tc.tc_code}
                    category={tc.category}
                    preconditions={tc.preconditions}
                    steps={tc.steps}
                    expected_result={tc.expected_result}
                  />
                </li>
              ))}
            </Fragment>
          ))}
        </ul>
      )}
      <GenerateTestCasesButton projectId={id} />

      <h2 style={{ marginTop: 32 }}>Clarifications</h2>

      {clarifications.length === 0 ? (
        <p>Aucune clarification pour ce projet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {clarifications.map((c) => (
            <div key={c.id} style={{ background: "#f9f9f9", padding: "10px 14px", borderLeft: "3px solid #bbb" }}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{c.type} — {c.element_reference}</div>
              <div><span style={{ fontWeight: 600 }}>Explication : </span>{c.explanation}</div>
              <div style={{ marginTop: 4 }}><span style={{ fontWeight: 600 }}>Recommandation : </span>{c.recommendation}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
