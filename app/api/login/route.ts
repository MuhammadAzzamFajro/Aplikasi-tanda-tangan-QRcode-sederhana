import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/SupabaseClient'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()


    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    })

    if (authError) {
      console.error('Supabase login error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Login successful',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.user_metadata?.full_name
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Login route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}