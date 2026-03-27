'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { XIcon } from 'lucide-react'

const SLIDES = [
  {
    src: '/screenshots/exigences.png',
    label: 'Exigences structurées',
    description:
      'Votre spec est décomposée en exigences atomiques et testables, numérotées REQ-001, REQ-002… Chaque exigence est éditable inline et sauvegardée automatiquement.',
    bullets: [
      'Exigences atomiques et traçables',
      'Édition directe avec sauvegarde automatique',
      "Détection d'ambiguïtés intégrée",
    ],
  },
  {
    src: '/screenshots/cas_de_test.png',
    label: 'Cas de test complets',
    description:
      'Pour chaque exigence, MyQAssist génère un ou plusieurs cas de test avec étapes détaillées, résultat attendu, priorité et catégorie. Rien à rédiger manuellement.',
    bullets: [
      'Étapes et résultats attendus',
      'Priorités High / Medium / Low',
      'Catégories : nominal, négatif, limite',
    ],
  },
  {
    src: '/screenshots/taux_de_couverture.png',
    label: 'Analyse de couverture',
    description:
      'Chaque exigence est tracée à ses cas de test. Le taux de couverture global est calculé en temps réel : couverture directe, indirecte et non couverte.',
    bullets: [
      'Taux de couverture global',
      'Traçabilité exigences et cas de test',
      'Export CSV en un clic',
    ],
  },
]

// ── Browser chrome ────────────────────────────────────────────────────────────

function BrowserChrome({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 shrink-0 ${dark ? 'bg-[#1c1c1e]' : 'bg-gray-100'}`}>
      <div className="flex gap-1.5 shrink-0">
        <div className={`w-3 h-3 rounded-full ${dark ? 'bg-[#ff5f57]' : 'bg-gray-300'}`} />
        <div className={`w-3 h-3 rounded-full ${dark ? 'bg-[#febc2e]' : 'bg-gray-300'}`} />
        <div className={`w-3 h-3 rounded-full ${dark ? 'bg-[#28c840]' : 'bg-gray-300'}`} />
      </div>
      <div className={`flex-1 rounded px-3 py-1 text-xs text-center truncate ${dark ? 'bg-[#2c2c2e] text-gray-500' : 'bg-white text-gray-400'}`}>
        myqassist.fr
      </div>
    </div>
  )
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ src, label, onClose }: { src: string; label: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 bg-black/85 backdrop-blur-sm cursor-zoom-out"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors" aria-label="Fermer">
        <XIcon className="w-4 h-4" />
      </button>
      <div className="relative max-w-5xl w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl cursor-default" onClick={e => e.stopPropagation()}>
        <BrowserChrome dark />
        <Image src={src} alt={label} width={1280} height={800} className="w-full block" priority />
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ScreenshotGallery() {
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(0)
  const lastActionRef = useRef(0)
  const lastCardReachedRef = useRef(0)
  const close = useCallback(() => setZoomed(false), [])

  // Advance card with debounce — prevents trackpad over-firing
  const advance = useCallback((dir: 1 | -1) => {
    const now = Date.now()
    if (now - lastActionRef.current < 500) return
    lastActionRef.current = now
    const next = Math.max(0, Math.min(SLIDES.length - 1, activeRef.current + dir))
    if (next === activeRef.current) return
    activeRef.current = next
    if (next === SLIDES.length - 1) lastCardReachedRef.current = Date.now()
    setActive(next)
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      const rect = el.getBoundingClientRect()
      const goingDown = e.deltaY > 0
      const goingUp = e.deltaY < 0

      if (goingDown) {
        if (activeRef.current < SLIDES.length - 1) {
            // Start sequence only when section bottom is fully in the viewport,
          // so the section is entirely visible before any card advances.
          // Once mid-sequence (activeRef > 0), always intercept so the page
          // cannot scroll away while cards are still advancing.
          if (rect.bottom <= window.innerHeight || activeRef.current > 0) {
            e.preventDefault()
            advance(1)
          }
        } else {
          // At last card: hold page scroll for 600ms so user can see it
          if (Date.now() - lastCardReachedRef.current < 600) {
            e.preventDefault()
          }
        }
      } else if (goingUp && activeRef.current > 0) {
        // Position-based trigger: start reverse only when section top is back
        // in the viewport (rect.top >= 0), so the section is fully visible.
        // Once mid-reverse, always intercept to keep the page locked.
        if (rect.top >= 0 || activeRef.current < SLIDES.length - 1) {
          e.preventDefault()
          advance(-1)
        }
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [advance])

  const cardStyle = (i: number): React.CSSProperties => {
    if (i < active) {
      return { transform: 'translateY(-112%)', opacity: 0, zIndex: 10, transition: 'transform 0.6s cubic-bezier(0.55,0,0.45,1), opacity 0.3s ease', pointerEvents: 'none' }
    }
    if (i === active) {
      return { transform: 'translateY(0) scale(1)', opacity: 1, zIndex: 30, transition: 'transform 0.65s cubic-bezier(0.34,1.3,0.64,1), opacity 0.4s ease' }
    }
    const offset = i - active
    return {
      transform: `translateY(${offset * 16}px) scale(${1 - offset * 0.035})`,
      opacity: 1, zIndex: 30 - offset * 10,
      transition: 'transform 0.65s cubic-bezier(0.34,1.3,0.64,1)',
    }
  }

  const textStyle = (i: number): React.CSSProperties => {
    if (i === active) return { opacity: 1, transform: 'translateY(0)', transition: 'all 0.55s cubic-bezier(0.34,1.3,0.64,1)', pointerEvents: 'auto' }
    return { opacity: 0, transform: i < active ? 'translateY(-14px)' : 'translateY(14px)', transition: 'all 0.4s ease', pointerEvents: 'none' }
  }

  return (
    <>
      {/* ── Mobile: stacked list ────────────────────────────────────────────── */}
      <div className="md:hidden space-y-14 px-4 py-16">
        {SLIDES.map(({ src, label, description, bullets }) => (
          <div key={label}>
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm mb-5">
              <BrowserChrome />
              <Image src={src} alt={label} width={1280} height={800} className="w-full h-auto block" />
            </div>
            <p className="font-bold text-gray-900 text-lg mb-2">{label}</p>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">{description}</p>
            <ul className="space-y-2">
              {bullets.map(b => (
                <li key={b} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Desktop: compact section, wheel-scroll drives card transitions ────── */}
      {/*
        Pas de container sticky ni de hauteur artificielle :
        la section est aussi haute que son contenu (~600px).
        La roue de la souris sur la section avance/recule les cartes.
        Quand toutes les cartes ont été vues, le scroll reprend normalement.
      */}
      <div ref={sectionRef} className="hidden md:block bg-gray-50 pt-10 pb-22">

        {/* Section header */}
        <div className="max-w-6xl mx-auto w-full px-6 mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-2">Le produit</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Un outil de test logiciel complet, en une seule interface
          </h2>
        </div>

        <div className="max-w-6xl mx-auto w-full px-6 flex gap-16 items-center">

          {/* Left: stacked cards (aspect-ratio = natural screenshot ratio) */}
          <div className="flex-[3] self-start">
            <div className="relative w-full aspect-video">
              {SLIDES.map(({ src, label }, i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-xl overflow-hidden border border-gray-200 shadow-lg flex flex-col bg-white"
                  style={cardStyle(i)}
                  onClick={() => { if (i === active) setZoomed(true) }}
                  role={i === active ? 'button' : undefined}
                  tabIndex={i === active ? 0 : -1}
                  aria-label={i === active ? `Agrandir — ${label}` : undefined}
                >
                  <BrowserChrome />
                  <div className="relative flex-1 min-h-0 cursor-zoom-in">
                    <Image
                      src={src} alt={label} fill
                      className="object-cover object-top"
                      sizes="(max-width: 1280px) 58vw, 720px"
                      priority={i === 0}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: fading text */}
          <div className="flex-[2] relative" style={{ minHeight: '320px' }}>
            {SLIDES.map(({ label, description, bullets }, i) => (
              <div key={i} className="absolute inset-0 flex flex-col justify-center" style={textStyle(i)}>
                <div className="w-10 h-0.5 bg-indigo-500 rounded-full mb-5" />
                <p className="text-2xl font-bold text-gray-900 mb-3">{label}</p>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">{description}</p>
                <ul className="space-y-3">
                  {bullets.map(b => (
                    <li key={b} className="flex items-center gap-3 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                {/* Dots + scroll hint */}
                <div className="flex items-center gap-3 mt-8">
                  {SLIDES.map((_, j) => (
                    <div key={j} className={`rounded-full transition-all duration-300 ${j === active ? 'w-5 h-1.5 bg-indigo-500' : 'w-1.5 h-1.5 bg-gray-300'}`} />
                  ))}
                  {active < SLIDES.length - 1 && (
                    <span className="text-xs text-gray-400 ml-1">Faites défiler ↓</span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {zoomed && <Lightbox src={SLIDES[active].src} label={SLIDES[active].label} onClose={close} />}
    </>
  )
}
