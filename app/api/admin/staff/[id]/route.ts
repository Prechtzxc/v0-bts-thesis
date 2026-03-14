import { createClient } from "@supabase/supabase-js"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { admin_role } = body

    if (!admin_role) {
      return NextResponse.json(
        { success: false, error: "Admin role is required" },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ admin_role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error("API: Error updating staff role:", error)
      return NextResponse.json(
        { success: false, error: "Failed to update staff role" },
        { status: 500 }
      )
    }

    // Invalidate cache by clearing it on staff list endpoint
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("API: Unexpected error in staff PUT:", err)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      console.error("API: Error deleting staff member:", error)
      return NextResponse.json(
        { success: false, error: "Failed to delete staff member" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("API: Unexpected error in staff DELETE:", err)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
