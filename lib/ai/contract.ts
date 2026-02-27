import { z } from 'zod'

const RequirementSchema = z.object({
  id: z.string(),
  description: z.string(),
})

const TestCaseSchema = z.object({
  tc_id: z.string(),
  requirement_id: z.string(),
  category: z.string(),
  preconditions: z.string(),
  steps: z.string(),
  expected_result: z.string(),
  priority: z.string(),
})

const ClarificationSchema = z.object({
  type: z.string(),
  element_reference: z.string(),
  explanation: z.string(),
  recommendation: z.string(),
})

export const AIResponseSchema = z.object({
  requirements: z.array(RequirementSchema),
  test_cases: z.array(TestCaseSchema),
  clarifications: z.array(ClarificationSchema),
})

export type AIResponse = z.infer<typeof AIResponseSchema>
