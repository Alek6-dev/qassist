'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckIcon } from 'lucide-react'

type Plan = 'free' | 'starter' | 'pro'

const PLAN_ORDER: Record<Plan, number> = { free: 0, starter: 1, pro: 2 }

const PLANS = [
  {
    key: 'free' as Plan,
    name: 'Free',
    price: '0€',
    period: '',
    features: ['2 projets (à vie)', '30 exigences max', 'Historique 1 mois', 'Workflow complet', 'Export CSV'],
  },
  {
    key: 'starter' as Plan,
    name: 'Starter',
    price: '19€',
    period: '/mois',
    features: ['5 projets par mois', '60 exigences max', 'Historique 6 mois', 'Workflow complet', 'Export CSV'],
  },
  {
    key: 'pro' as Plan,
    name: 'Pro',
    price: '39€',
    period: '/mois',
    features: ['Projets illimités', '120 exigences max', 'Historique illimité', 'Régénération sans perte', 'Support prioritaire'],
  },
]

export default function BillingPage() {
  const [plan, setPlan] = useState<Plan>('free')
  const [status, setStatus] = useState('active')
  const [periodEnd, setPeriodEnd] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionPlan, setActionPlan] = useState<Plan | null>(null)
  const [managing, setManaging] = useState(false)
  const [confirmDowngrade, setConfirmDowngrade] = useState<Plan | null>(null)

  useEffect(() => {
    fetch('/api/subscription')
      .then(r => r.json())
      .then(d => {
        if (d.plan) setPlan(d.plan)
        if (d.status) setStatus(d.status)
        if (d.current_period_end) setPeriodEnd(d.current_period_end)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handlePlanAction = async (targetPlan: Plan) => {
    setActionPlan(targetPlan)
    setConfirmDowngrade(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: targetPlan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.downgraded) {
        window.location.reload()
      } else {
        console.error('Checkout error:', data)
        setActionPlan(null)
      }
    } catch (err) {
      console.error('Checkout fetch error:', err)
      setActionPlan(null)
    }
  }

  const handleManage = async () => {
    setManaging(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setManaging(false)
    } catch {
      setManaging(false)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au dashboard
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Abonnement</h1>

        {/* Plan actuel */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-0.5">Plan actuel</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 capitalize">{plan}</span>
              {status === 'past_due' && (
                <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                  Paiement en retard
                </span>
              )}
            </div>
            {periodEnd && plan !== 'free' && (
              <p className="text-xs text-gray-400 mt-1">Renouvellement le {formatDate(periodEnd)}</p>
            )}
          </div>
          {plan !== 'free' && (
            <button
              onClick={handleManage}
              disabled={managing}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors disabled:opacity-50"
            >
              {managing ? 'Redirection…' : 'Gérer mon abonnement'}
            </button>
          )}
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((p) => {
            const isCurrent = p.key === plan
            const isUpgrade = PLAN_ORDER[p.key] > PLAN_ORDER[plan]
            const isDowngrade = PLAN_ORDER[p.key] < PLAN_ORDER[plan] && p.key !== 'free'

            return (
              <div
                key={p.key}
                className={`bg-white rounded-xl border p-5 flex flex-col ${
                  isCurrent ? 'border-indigo-400 ring-2 ring-indigo-400/30' : 'border-gray-200'
                }`}
              >
                {isCurrent && (
                  <span className="self-start text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full font-medium mb-3">
                    Plan actuel
                  </span>
                )}
                <p className="font-bold text-gray-900 text-base mb-0.5">{p.name}</p>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-bold text-gray-900">{p.price}</span>
                  {p.period && <span className="text-sm text-gray-400 mb-0.5">{p.period}</span>}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="w-full text-center text-sm py-2 rounded-lg bg-gray-50 text-gray-400 cursor-default select-none">
                    Plan actuel
                  </div>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handlePlanAction(p.key)}
                    disabled={actionPlan === p.key}
                    className="w-full text-center text-sm font-medium py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors disabled:opacity-50"
                  >
                    {actionPlan === p.key ? 'Traitement…' : `Passer à ${p.name}`}
                  </button>
                ) : isDowngrade ? (
                  <button
                    onClick={() => setConfirmDowngrade(p.key)}
                    disabled={actionPlan === p.key}
                    className="w-full text-center text-sm font-medium py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {actionPlan === p.key ? 'Traitement…' : `Rétrograder vers ${p.name}`}
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          Paiements sécurisés par Stripe. Annulation possible à tout moment via &quot;Gérer mon abonnement&quot;.
        </p>
      </div>

      {/* Popup confirmation downgrade */}
      {confirmDowngrade && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Rétrograder vers {PLANS.find(p => p.key === confirmDowngrade)?.name} ?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Votre abonnement sera modifié immédiatement. La différence sera calculée au prorata sur votre prochaine facture. Vous conservez l&apos;accès à votre plan actuel jusqu&apos;à la fin de la période en cours.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDowngrade(null)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handlePlanAction(confirmDowngrade)}
                disabled={actionPlan === confirmDowngrade}
                className="flex-1 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {actionPlan === confirmDowngrade ? 'Traitement…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
