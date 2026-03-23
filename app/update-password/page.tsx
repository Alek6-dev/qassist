'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    // createBrowserClient auto-échange le ?code= PKCE au chargement de la page.
    // On écoute le résultat via onAuthStateChange.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
      if (event === 'SIGNED_IN' && session) setReady(true)
    })

    // Fallback : session déjà établie si l'event a été émis avant le listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    // Timeout : si rien ne se passe après 5s, le lien est invalide
    const timeout = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) setMessage({ type: 'error', text: 'Lien invalide ou expiré. Demandez un nouveau lien.' })
      })
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' })
      return
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères.' })
      return
    }
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Mot de passe mis à jour. Redirection…' })
      setTimeout(() => router.replace('/dashboard'), 1500)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image src="/Logo-fond-blanc.svg" alt="QAssist" width={40} height={40} className="mb-3" />
          <h1 className="text-xl font-semibold tracking-tight text-foreground">QAssist</h1>
        </div>

        <div className="border rounded-xl shadow-sm p-6 bg-background">
          <div className="mb-5">
            <p className="text-sm font-medium text-foreground">Nouveau mot de passe</p>
            <p className="text-xs text-muted-foreground mt-1">Choisissez un nouveau mot de passe pour votre compte.</p>
          </div>

          {!ready && !message && (
            <p className="text-sm text-muted-foreground text-center py-4">Vérification du lien…</p>
          )}

          {!ready && message && (
            <div className="text-sm px-3 py-2 rounded-md bg-destructive/10 text-destructive">
              {message.text}
            </div>
          )}

          {ready && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Nouveau mot de passe</label>
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

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Confirmer</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2 pr-10 text-sm border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {message && (
                <div className={`text-sm px-3 py-2 rounded-md ${
                  message.type === 'error'
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {loading ? '…' : 'Mettre à jour'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
