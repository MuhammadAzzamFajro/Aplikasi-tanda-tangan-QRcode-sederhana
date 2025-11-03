import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/SupabaseClient'

export async function GET(request: NextRequest) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { user },
      { status: 200 }
    )

  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}