'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push('/dashboard')
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login` },
      })
      if (error) setMessage({ type: 'error', text: error.message })
      else setMessage({ type: 'success', text: 'Compte créé ! Vérifiez votre email pour confirmer.' })
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage({ type: 'error', text: error.message })
      else router.replace('/dashboard')
    }

    setLoading(false)
  }

  const switchMode = (next: 'signin' | 'signup') => {
    setMode(next)
    setMessage(null)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo + tagline */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/Logo-fond-blanc.svg"
            alt="QAssist"
            width={40}
            height={40}
            className="mb-3"
          />
          <h1 className="text-xl font-semibold tracking-tight text-foreground">QAssist</h1>
        </div>

        {/* Card */}
        <div className="border rounded-xl shadow-sm p-6 bg-background">

          {/* Tabs */}
          <div className="flex rounded-lg bg-muted p-1 mb-6">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
                mode === 'signin'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
                mode === 'signup'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2 text-sm border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 text-sm border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {message && (
              <div
                className={`text-sm px-3 py-2 rounded-md ${
                  message.type === 'error'
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {loading ? '…' : mode === 'signin' ? 'Se connecter' : 'Créer un compte'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
