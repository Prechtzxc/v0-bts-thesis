import { createClient } from "@supabase/supabase-js"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cache staff list for 30 seconds to reduce database load
let staffCache: any[] | null = null
let staffCacheTime: number = 0
const CACHE_DURATION = 30000

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const now = Date.now()
    if (staffCache && now - staffCacheTime < CACHE_DURATION) {
      return NextResponse.json({ 
        success: true, 
        data: staffCache,
        cached: true
      })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .limit(100)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error("API: Error fetching staff members:", error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch staff members" },
        { status: 500 }
      )
    }

    // Update cache
    staffCache = data || []
    staffCacheTime = now

    return NextResponse.json({ 
      success: true, 
      data: data || [],
      cached: false
    })
  } catch (err) {
    console.error("API: Unexpected error in staff GET:", err)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, adminRole } = body

    // Server-side validation
    if (!name || !email || !password || !adminRole) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Check if email already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 }
      )
    }

    // Create new staff member
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{
        name,
        email: email.toLowerCase(),
        password,
        role: 'admin',
        admin_role: adminRole,
      }])
      .select()
      .single()

    if (error) {
      console.error("API: Error creating staff member:", error)
      return NextResponse.json(
        { success: false, error: "Failed to create staff member" },
        { status: 500 }
      )
    }

    // Invalidate cache
    staffCache = null

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    )
  } catch (err) {
    console.error("API: Unexpected error in staff POST:", err)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
