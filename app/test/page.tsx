import { supabase } from '@/lib/supabase'

export default async function TestPage() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')

  return (
    <div style={{ padding: 20 }}>
      <h1>Test Supabase Connection</h1>
      <pre>{JSON.stringify({ data, error }, null, 2)}</pre>
    </div>
  )
}