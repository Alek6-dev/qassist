import Image from 'next/image'
import Link from 'next/link'
import {
  CheckIcon,
  FileTextIcon,
  ListChecksIcon,
  BarChart3Icon,
  AlertCircleIcon,
  DownloadIcon,
  PencilIcon,
} from 'lucide-react'
import ScreenshotGallery from './ScreenshotGallery'
import FadeIn from './FadeIn'

// ─── Browser chrome mockup ───────────────────────────────────────────────────

function BrowserFrame({
  src,
  alt,
  priority = false,
  dark = true,
}: {
  src: string
  alt: string
  priority?: boolean
  dark?: boolean
}) {
  return (
    <div
      className={`rounded-xl overflow-hidden shadow-2xl ${
        dark ? 'border border-white/10' : 'border border-gray-200'
      }`}
    >
      <div
        className={`px-4 py-2.5 flex items-center gap-3 ${
          dark ? 'bg-[#1c1c1e]' : 'bg-gray-100'
        }`}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <div className={`w-3 h-3 rounded-full ${dark ? 'bg-[#ff5f57]' : 'bg-gray-300'}`} />
          <div className={`w-3 h-3 rounded-full ${dark ? 'bg-[#febc2e]' : 'bg-gray-300'}`} />
          <div className={`w-3 h-3 rounded-full ${dark ? 'bg-[#28c840]' : 'bg-gray-300'}`} />
        </div>
        <a
          href="/dashboard"
          className={`flex-1 rounded-md px-3 py-1 text-xs text-center truncate cursor-pointer hover:underline ${
            dark ? 'bg-[#2c2c2e] text-gray-500' : 'bg-white text-gray-400'
          }`}
        >
          myqassist.fr
        </a>
      </div>
      <Image
        src={src}
        alt={alt}
        width={1280}
        height={800}
        className="w-full block"
        priority={priority}
      />
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const steps = [
  {
    number: '01',
    label: 'Spécification',
    description: 'Collez votre spécification fonctionnelle ou uploadez un PDF jusqu\'à 5 Mo',
  },
  {
    number: '02',
    label: 'Exigences',
    description: 'MyQAssist génère vos exigences fonctionnelles atomiques et détecte les ambiguïtés',
  },
  {
    number: '03',
    label: 'Cas de test',
    description: 'Chaque exigence est couverte par un ou plusieurs cas de test avec étapes et résultats attendus',
  },
  {
    number: '04',
    label: 'Couverture',
    description: 'Taux de couverture calculé en temps réel, traçabilité exigences et cas de test',
  },
]


const features = [
  {
    Icon: FileTextIcon,
    title: 'Exigences fonctionnelles atomiques',
    description:
      'Votre spécification fonctionnelle est décomposée en exigences testables et traçables, numérotées REQ-001, REQ-002, éditables directement dans l\'interface.',
  },
  {
    Icon: ListChecksIcon,
    title: 'Cas de test complets',
    description:
      'Étapes détaillées, résultat attendu, priorité et catégorie générés automatiquement pour chaque exigence fonctionnelle.',
  },
  {
    Icon: AlertCircleIcon,
    title: 'Détection d\'ambiguïtés',
    description:
      'MyQAssist identifie les zones floues, règles métier manquantes et informations qui bloqueraient la rédaction de vos cas de test.',
  },
  {
    Icon: BarChart3Icon,
    title: 'Analyse de couverture de tests',
    description:
      'Chaque exigence est tracée à ses cas de test. Couverture directe, indirecte et non couverte calculées en temps réel.',
  },
  {
    Icon: PencilIcon,
    title: 'Édition directe',
    description:
      'Modifiez vos exigences et cas de test directement dans l\'interface. Les modifications sont sauvegardées automatiquement.',
  },
  {
    Icon: DownloadIcon,
    title: 'Export CSV',
    description:
      'Exportez tous vos cas de test en CSV, prêts à être importés dans votre outil de gestion de tests logiciels.',
  },
]

const plans = [
  {
    name: 'Free',
    price: '0€',
    period: '',
    description: 'Pour découvrir MyQAssist',
    features: ['2 projets (à vie)', '30 exigences max', 'Cas de test complets', 'Export CSV', 'Analyse de couverture', 'Historique 1 mois'],
    cta: 'Commencer gratuitement',
    href: '/login',
    highlight: true,
    available: true,
  },
  {
    name: 'Starter',
    price: '19€',
    period: '/mois',
    description: 'Pour les freelances QA',
    features: ['5 projets par mois', '60 exigences max', 'Cas de test complets', 'Export CSV', 'Analyse de couverture', 'Historique 6 mois'],
    cta: 'Bientôt disponible',
    href: '#',
    highlight: false,
    available: false,
  },
  {
    name: 'Pro',
    price: '39€',
    period: '/mois',
    description: 'Pour les équipes QA',
    features: [
      'Projets illimités',
      '120 exigences max',
      'Cas de test complets',
      'Export CSV',
      'Analyse de couverture',
      'Historique complet',
      'Régénération sans perte',
      'Support prioritaire',
    ],
    cta: 'Bientôt disponible',
    href: '#',
    highlight: false,
    available: false,
  },
]

// ─── Arrow icon (inline, no extra dep) ───────────────────────────────────────

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Landing page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050507]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/Logo-MyQAssist.svg" alt="MyQAssist" width={28} height={28} />
            <span className="text-white font-semibold text-base tracking-tight">MyQAssist</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5"
            >
              Se connecter
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#050507] pt-32 pb-0 overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(99,102,241,0.2) 0%, transparent 70%)',
          }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8" style={{ animation: 'lp-fade-up 0.6s ease-out both' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-indigo-300 text-xs font-medium tracking-wide">
              Assistant QA professionnel
            </span>
          </div>

          {/* H1 */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.06] mb-6" style={{ animation: 'lp-fade-up 0.6s ease-out 120ms both' }}>
            Générez vos cas de test
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              en 60 secondes
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed" style={{ animation: 'lp-fade-up 0.6s ease-out 220ms both' }}>
            À partir de votre spécification fonctionnelle ou de vos user stories, MyQAssist génère vos exigences, vos cas de test et analyse le taux de couverture.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16" style={{ animation: 'lp-fade-up 0.6s ease-out 320ms both' }}>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              Essayer gratuitement
              <ArrowRight />
            </Link>
            <Link
              href="#workflow"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-medium px-6 py-3 rounded-xl text-sm transition-colors border border-white/10 hover:border-white/20"
            >
              Voir comment ça marche
            </Link>
          </div>

          {/* Main screenshot */}
          <div className="relative" style={{ animation: 'lp-fade 0.9s ease-out 450ms both' }}>
            {/* Fade to white — creates seamless blend into next section */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
            <BrowserFrame
              src="/screenshots/cas_de_test.png"
              alt="MyQAssist, vue des cas de test générés automatiquement depuis une spécification fonctionnelle"
              priority
              dark
            />
          </div>
        </div>
      </section>

      {/* ── Workflow steps ───────────────────────────────────────────────────── */}
      <section id="workflow" className="bg-white pt-28 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FadeIn direction="none" className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-3">
              Comment ça marche
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              De la spécification fonctionnelle au rapport de couverture
            </h2>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative">
            {/* Connecting line — desktop only */}
            <div className="hidden md:block absolute top-7 left-[14%] right-[14%] h-px bg-gradient-to-r from-indigo-100 via-indigo-200 to-indigo-100" />

            {steps.map((step, index) => (
              <FadeIn key={step.number} delay={index * 90}>
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4 z-10">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-indigo-500">{step.number}</span>
                  </div>
                </div>
                <p className="font-semibold text-gray-900 text-sm mb-1">{step.label}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
              </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Screenshots ──────────────────────────────────────────────────────── */}
      <section>
        <ScreenshotGallery />
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FadeIn direction="none" className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-3">
              Fonctionnalités
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Tout ce qu&apos;il faut pour un QA structuré
            </h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ Icon, title, description }, index) => (
              <FadeIn key={title} delay={index * 60}>
              <div
                className="p-5 rounded-xl border border-gray-100 hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-100/50 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center mb-4">
                  <Icon className="w-4 h-4 text-indigo-500" strokeWidth={1.75} />
                </div>
                <p className="font-semibold text-gray-900 text-sm mb-1.5">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
              </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FadeIn direction="none" className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-3">
              Tarifs
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Simple et transparent
            </h2>
            <p className="text-gray-500 text-sm mt-3">
              Commencez gratuitement. Passez à un plan payant quand vous en avez besoin.
            </p>
          </FadeIn>

          <FadeIn direction="none">
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  plan.highlight
                    ? 'bg-indigo-500 shadow-xl shadow-indigo-500/25 ring-2 ring-indigo-500'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    Disponible dès maintenant
                  </div>
                )}

                <div className="mb-5">
                  <p
                    className={`font-bold text-base mb-1 ${
                      plan.highlight ? 'text-indigo-100' : 'text-gray-900'
                    }`}
                  >
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1">
                    <span
                      className={`text-4xl font-bold ${
                        plan.highlight ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span
                        className={`text-sm mb-1 ${
                          plan.highlight ? 'text-indigo-200' : 'text-gray-500'
                        }`}
                      >
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-1.5 ${
                      plan.highlight ? 'text-indigo-200' : 'text-gray-500'
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs">
                      <CheckIcon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          plan.highlight ? 'text-indigo-200' : 'text-indigo-500'
                        }`}
                      />
                      <span className={plan.highlight ? 'text-indigo-100' : 'text-gray-600'}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.available ? (
                  <Link
                    href={plan.href}
                    className={`block w-full text-center text-sm font-medium py-2.5 rounded-xl transition-colors ${
                      plan.highlight
                        ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                        : 'bg-indigo-500 text-white hover:bg-indigo-600'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <div
                    className={`w-full text-center text-sm font-medium py-2.5 rounded-xl cursor-not-allowed select-none ${
                      plan.highlight
                        ? 'bg-indigo-600/50 text-indigo-300'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {plan.cta}
                  </div>
                )}
              </div>
            ))}
          </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Testimonials placeholder ─────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <FadeIn className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Témoignages
          </p>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Ce que disent nos utilisateurs
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-6 flex flex-col gap-3"
              >
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((j) => (
                    <div key={j} className="w-3 h-3 rounded-sm bg-gray-200" />
                  ))}
                </div>
                <div className="space-y-1.5">
                  <div className="h-2.5 bg-gray-100 rounded-full w-full" />
                  <div className="h-2.5 bg-gray-100 rounded-full w-4/5" />
                  <div className="h-2.5 bg-gray-100 rounded-full w-3/5" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-7 h-7 rounded-full bg-gray-100 shrink-0" />
                  <div className="space-y-1">
                    <div className="h-2 bg-gray-100 rounded-full w-16" />
                    <div className="h-2 bg-gray-100 rounded-full w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-6">
            Bientôt disponible. Nous collectons les retours de nos premiers utilisateurs beta.
          </p>
        </FadeIn>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#050507] py-20 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(99,102,241,0.14) 0%, transparent 70%)',
          }}
        />
        <FadeIn className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Prêt à diviser par 5 le temps de rédaction de vos cas de test ?
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Essayez MyQAssist gratuitement, aucune carte bancaire requise.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
          >
            Commencer gratuitement
            <ArrowRight />
          </Link>
        </FadeIn>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="bg-[#050507] border-t border-white/5 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Image src="/Logo-MyQAssist.svg" alt="MyQAssist" width={24} height={24} />
            <span className="text-gray-500 text-sm">MyQAssist, votre assistant QA</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <Link href="/mentions-legales" className="hover:text-gray-400 transition-colors">
              Mentions légales
            </Link>
            <Link href="/cgv" className="hover:text-gray-400 transition-colors">
              CGV et CGU
            </Link>
            <Link href="/confidentialite" className="hover:text-gray-400 transition-colors">
              Politique de confidentialité
            </Link>
            <span>© {new Date().getFullYear()} MyQAssist</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
