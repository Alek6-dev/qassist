const softwareApp = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MyQAssist',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  inLanguage: 'fr-FR',
  url: 'https://myqassist.fr',
  description:
    "MyQAssist transforme vos spécifications fonctionnelles en exigences structurées et cas de test complets avec analyse de couverture, grâce à l'intelligence artificielle.",
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'EUR',
      description: '2 projets à vie, 30 exigences max, cas de test complets, export CSV',
    },
    {
      '@type': 'Offer',
      name: 'Starter',
      price: '19',
      priceCurrency: 'EUR',
      description: '5 projets par mois, 60 exigences max, historique 6 mois',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '39',
      priceCurrency: 'EUR',
      description: 'Projets illimités, 120 exigences max, historique complet, support prioritaire',
    },
  ],
}

const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MyQAssist',
  url: 'https://myqassist.fr',
  logo: 'https://myqassist.fr/Logo-MyQAssist.svg',
  description:
    "Assistant QA professionnel qui transforme les spécifications fonctionnelles en exigences et cas de test grâce à l'IA.",
}

export default function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
    </>
  )
}
