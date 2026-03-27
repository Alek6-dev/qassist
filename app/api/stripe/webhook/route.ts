import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

// Résout le user_id depuis les métadonnées du sub ou en cherchant par customer_id en DB
async function resolveUserId(sub: Stripe.Subscription): Promise<string | null> {
  if (sub.metadata?.user_id) return sub.metadata.user_id

  const { data } = await getSupabase()
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', sub.customer as string)
    .single()

  return data?.user_id ?? null
}

function planFromPriceId(priceId: string): string {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro'
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return 'starter'
  return 'starter'
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {

      // Paiement réussi via Checkout (nouveau sub ou upgrade)
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const plan = session.metadata?.plan

        if (!userId || !plan || !session.subscription) break

        const sub = await stripe.subscriptions.retrieve(session.subscription as string) as unknown as { id: string; current_period_end: number }
        const periodEnd = !isNaN(sub.current_period_end)
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null

        await getSupabase()
          .from('subscriptions')
          .update({
            plan,
            status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: sub.id,
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        // Si c'était un upgrade, on annule l'ancien abonnement
        const previousSubId = session.metadata?.previous_subscription_id
        if (previousSubId && previousSubId !== sub.id) {
          try {
            await stripe.subscriptions.cancel(previousSubId)
            console.log(`[webhook] Cancelled previous subscription ${previousSubId}`)
          } catch (err) {
            console.error('[webhook] Failed to cancel previous subscription:', err)
          }
        }
        break
      }

      // Renouvellement mensuel
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.subscription) break

        // Ignorer les invoices de première création (déjà gérées par checkout.session.completed)
        if (invoice.billing_reason === 'subscription_create') break

        const sub = await stripe.subscriptions.retrieve(invoice.subscription as string) as unknown as Stripe.Subscription & { current_period_end: number }
        const userId = await resolveUserId(sub)
        if (!userId) {
          console.warn('[webhook] invoice.payment_succeeded: user_id not found for sub', sub.id)
          break
        }

        const priceId = sub.items.data[0]?.price.id ?? ''
        const plan = planFromPriceId(priceId)
        const periodEnd = !isNaN(sub.current_period_end)
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null

        await getSupabase()
          .from('subscriptions')
          .update({
            plan,
            status: 'active',
            stripe_subscription_id: sub.id,
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
        break
      }

      // Abonnement annulé (via portail ou fin de période)
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = await resolveUserId(sub)
        if (!userId) {
          console.warn('[webhook] subscription.deleted: user_id not found for sub', sub.id)
          break
        }

        // Vérifie que c'est bien l'abonnement actif en DB qui est annulé
        // (ignore si l'utilisateur a déjà un nouvel abonnement actif — cas upgrade)
        const { data: current } = await getSupabase()
          .from('subscriptions')
          .select('stripe_subscription_id')
          .eq('user_id', userId)
          .single()

        if (current?.stripe_subscription_id !== sub.id) {
          console.log(`[webhook] subscription.deleted ignored — DB has different active sub (${current?.stripe_subscription_id} vs ${sub.id})`)
          break
        }

        await getSupabase()
          .from('subscriptions')
          .update({
            plan: 'free',
            status: 'active',
            stripe_subscription_id: null,
            current_period_end: null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        console.log(`[webhook] User ${userId} downgraded to free (subscription ${sub.id} deleted)`)
        break
      }

      // Paiement échoué
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.subscription) break

        const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
        const userId = await resolveUserId(sub)
        if (!userId) break

        await getSupabase()
          .from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('user_id', userId)
        break
      }
    }
  } catch (err) {
    console.error('[webhook] Handler error:', err)
  }

  return NextResponse.json({ received: true })
}
