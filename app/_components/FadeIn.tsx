'use client'

import { useEffect, useRef, useState } from 'react'

interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number        // ms
  direction?: 'up' | 'none'
}

export default function FadeIn({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: direction === 'up' && !visible ? 'translateY(18px)' : 'translateY(0)',
        transition: `opacity 0.65s ease-out ${delay}ms, transform 0.65s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
