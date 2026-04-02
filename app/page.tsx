import LandingPage from './_components/LandingPage'
import JsonLd from './_components/JsonLd'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MyQAssist — Générez vos cas de test depuis vos spécifications fonctionnelles',
  description:
    'MyQAssist transforme vos spécifications fonctionnelles en exigences structurées (REQ-001…) et cas de test complets avec analyse de couverture. Idéal pour les consultants QA, chefs de projet et équipes de test logiciel.',
  alternates: {
    canonical: 'https://myqassist.fr',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'MyQAssist — Générez vos cas de test depuis vos spécifications fonctionnelles',
    description:
      'Transformez vos spécifications fonctionnelles en exigences structurées et cas de test complets avec analyse de couverture. Essai gratuit, sans carte bancaire.',
    url: 'https://myqassist.fr',
    siteName: 'MyQAssist',
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function Home() {
  return (
    <>
      <JsonLd />
      <LandingPage />
    </>
  )
}
