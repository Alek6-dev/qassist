'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  // Vérifier si une session existe au chargement de la page
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      
      if (data.session) {
        router.push('/dashboard')
      }
    }

    checkSession()
  }, [router])

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`
    }
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Signup successful! Check your email.')
    }
  }

const handleSignIn = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    setMessage(error.message)
  } else {
    await supabase.auth.getSession() // force sync
    router.replace('/dashboard')
  }
}

  return (
    <div style={{ padding: 20 }}>
      <h1>Login / Signup</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

            <button onClick={handleSignUp}>Sign Up</button>
      <button onClick={handleSignIn} style={{ marginLeft: 10 }}>
        Sign In
      </button>
    </div>
  )
}