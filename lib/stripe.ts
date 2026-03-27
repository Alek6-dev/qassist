import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-03-25.dahlia',
})

export const PLANS = {
  starter: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    name: 'Starter',
    projectsPerMonth: 5,
    maxReqPerProject: 60,
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    name: 'Pro',
    projectsPerMonth: Infinity,
    maxReqPerProject: 120,
  },
  free: {
    priceId: null,
    name: 'Free',
    projectsPerMonth: null, // 2 lifetime, handled separately
    maxReqPerProject: 30,
  },
} as const

export type Plan = keyof typeof PLANS
