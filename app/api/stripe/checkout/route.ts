import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { stripe, PLANS, Plan } from '@/lib/stripe'

export const runtime = 'nodejs'

const PLAN_ORDER: Record<Plan, number> = { free: 0, starter: 1, pro: 2 }

function getAuthSupabase(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
}

function getServiceSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = getAuthSupabase(cookieStore)
  const serviceSupabase = getServiceSupabase()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { plan } = await req.json() as { plan: Plan }
  if (!plan || plan === 'free' || !PLANS[plan]?.priceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const { data: subscription } = await serviceSupabase
    .from('subscriptions')
    .select('plan, stripe_customer_id, stripe_subscription_id')
    .eq('user_id', user.id)
    .single()

  const currentPlan = (subscription?.plan ?? 'free') as Plan
  const isDowngrade = PLAN_ORDER[plan] < PLAN_ORDER[currentPlan]

  // ── Downgrade (ex: Pro → Starter) : mise à jour directe, pas de paiement ──
  if (isDowngrade && subscription?.stripe_subscription_id) {
    const existingSub = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)

    if (existingSub.status === 'canceled') {
      return NextResponse.json({ error: 'No active subscription to downgrade' }, { status: 400 })
    }

    const itemId = existingSub.items.data[0]?.id
    if (!itemId) {
      return NextResponse.json({ error: 'Subscription item not found' }, { status: 500 })
    }

    const updated = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      items: [{ id: itemId, price: PLANS[plan].priceId! }],
      proration_behavior: 'create_prorations',
      // On met à jour les métadonnées du sub pour que les futurs webhooks connaissent le plan
      metadata: { user_id: user.id, plan },
    })

    const sub = updated as unknown as { current_period_end: number | null }
    const periodEnd = sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null

    await serviceSupabase
      .from('subscriptions')
      .update({
        plan,
        status: 'active',
        current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    return NextResponse.json({ downgraded: true })
  }

  // ── Upgrade ou premier abonnement : Stripe Checkout ──
  let customerId = subscription?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    })
    customerId = customer.id

    await serviceSupabase
      .from('subscriptions')
      .update({ stripe_customer_id: customerId })
      .eq('user_id', user.id)
  }

  const previousSubscriptionId = subscription?.stripe_subscription_id ?? null

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: PLANS[plan].priceId!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing`,
    // Métadonnées sur la session (pour checkout.session.completed)
    metadata: {
      user_id: user.id,
      plan,
      ...(previousSubscriptionId ? { previous_subscription_id: previousSubscriptionId } : {}),
    },
    // Métadonnées copiées sur l'abonnement créé (pour invoice.* et subscription.deleted)
    subscription_data: {
      metadata: { user_id: user.id, plan },
    },
  })

  return NextResponse.json({ url: session.url })
}
