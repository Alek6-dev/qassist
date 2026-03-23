'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push('/dashboard')
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })
      if (error) setMessage({ type: 'error', text: error.message })
      else setMessage({ type: 'success', text: 'Un email de réinitialisation a été envoyé. Vérifiez votre boîte mail.' })
    } else if (mode === 'signup') {
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

  const switchMode = (next: 'signin' | 'signup' | 'reset') => {
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

          {/* Tabs — hidden in reset mode */}
          {mode !== 'reset' && (
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
          )}

          {/* Reset mode header */}
          {mode === 'reset' && (
            <div className="mb-5">
              <p className="text-sm font-medium text-foreground">Réinitialiser le mot de passe</p>
              <p className="text-xs text-muted-foreground mt-1">Entrez votre email pour recevoir un lien de réinitialisation.</p>
            </div>
          )}

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

            {mode !== 'reset' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Mot de passe</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => switchMode('reset')}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2 pr-10 text-sm border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

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
              {loading ? '…' : mode === 'reset' ? 'Envoyer le lien' : mode === 'signin' ? 'Se connecter' : 'Créer un compte'}
            </button>

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Retour à la connexion
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
