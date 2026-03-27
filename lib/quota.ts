import { createServerClient } from '@supabase/ssr'
import { PLANS, Plan } from './stripe'

function getServiceSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export type QuotaAction = 'generate_requirements' | 'generate_test_cases'

export interface QuotaResult {
  allowed: boolean
  reason?: string
  plan?: Plan
}

export async function checkQuota(
  userId: string,
  action: QuotaAction,
  projectId?: string
): Promise<QuotaResult> {
  // Kill switch — PAYMENT_ENFORCED=false = tout le monde en mode Pro sans restriction
  if (process.env.PAYMENT_ENFORCED !== 'true') {
    return { allowed: true }
  }

  const supabase = getServiceSupabase()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .single()

  // Si pas d'abonnement trouvé, on considère free
  const plan = ((subscription?.plan) ?? 'free') as Plan

  // ── generate_requirements : vérification du quota projets ────────────────────
  if (action === 'generate_requirements') {
    if (plan === 'free') {
      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if ((count ?? 0) >= 2) {
        return {
          allowed: false,
          reason: 'Vous avez atteint la limite de 2 projets du plan Free. Passez au plan Starter pour continuer.',
          plan,
        }
      }
    } else if (plan === 'starter') {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString())

      if ((count ?? 0) >= 5) {
        return {
          allowed: false,
          reason: 'Vous avez atteint la limite de 5 projets par mois du plan Starter. Passez au plan Pro pour continuer.',
          plan,
        }
      }
    }
    // Pro : illimité, pas de vérification
  }

  // ── generate_test_cases : vérification du nombre de REQ du projet ────────────
  if (action === 'generate_test_cases' && projectId) {
    const maxReq = PLANS[plan].maxReqPerProject

    const { count } = await supabase
      .from('requirements')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    if ((count ?? 0) > maxReq) {
      return {
        allowed: false,
        reason: `Ce projet dépasse la limite de ${maxReq} exigences du plan ${PLANS[plan].name}. Passez à un plan supérieur pour générer les cas de test.`,
        plan,
      }
    }
  }

  return { allowed: true, plan }
}
