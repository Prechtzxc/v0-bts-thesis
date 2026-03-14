'use server'

import { createClient } from '@supabase/supabase-js'

// Server-side login action that uses service role key to bypass RLS
export async function loginServerAction(email: string, password: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("[v0] Login server action - Missing Supabase credentials")
    return null
  }

  try {
    // Create admin client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Query users table directly with service role key
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error) {
      console.error("Login error:", error.message)
      return null
    }

    if (!data) {
      return null
    }

    // Verify password (plain text comparison)
    if (data.password !== password) {
      return null
    }

    // Return user data with both snake_case and camelCase for compatibility
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      password: data.password,
      role: data.role,
      admin_role: data.admin_role,
      profile_picture: data.profile_picture,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  } catch (error) {
    console.error("Login error:", error)
    return null
  }
}
