import LandingPage from './_components/LandingPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MyQAssist — Générez vos cas de test depuis vos spécifications fonctionnelles',
  description:
    'MyQAssist transforme vos spécifications fonctionnelles en exigences structurées (REQ-001…) et cas de test complets avec analyse de couverture. Idéal pour les consultants QA, chefs de projet et équipes de test logiciel.',
}

export default function Home() {
  return <LandingPage />
}
