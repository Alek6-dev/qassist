import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: body.name,
        description: body.description
      })
      .select()

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ data }, { status: 200 })

  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}