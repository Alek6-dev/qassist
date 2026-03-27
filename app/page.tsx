import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LandingPage from './_components/LandingPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MyQAssist — Générez vos cas de test depuis vos spécifications fonctionnelles',
  description:
    'MyQAssist transforme vos spécifications fonctionnelles en exigences structurées (REQ-001…) et cas de test complets avec analyse de couverture. Idéal pour les consultants QA, chefs de projet et équipes de test logiciel.',
}

export default async function Home() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) redirect('/dashboard')

  return <LandingPage />
}
