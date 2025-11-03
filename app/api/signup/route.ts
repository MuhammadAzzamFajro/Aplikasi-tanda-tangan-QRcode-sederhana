import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/SupabaseClient'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, confirmPassword } = await request.json()

    // Validasi
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Sign up dengan Supabase Auth (tanpa email confirmation)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`
      }
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    
    return NextResponse.json(
      { 
        message: 'User created successfully!',
        user: {
          id: authData.user?.id,
          email: authData.user?.email,
          name: authData.user?.user_metadata?.full_name
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}