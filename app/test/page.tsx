'use client'

export default function TestPage() {
  const handleTest = async () => {
    const res = await fetch('/api/generate-requirements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        specification: 'User can create an account'
      })
    })

    const data = await res.json()
    console.log('Status:', res.status)
    console.log('Response:', data)
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Test API</h1>
      <button onClick={handleTest}>
        Test generate-requirements
      </button>
    </div>
  )
}