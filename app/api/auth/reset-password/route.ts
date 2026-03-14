import { type NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, updateUserPassword } from '@/lib/storage'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Request password reset
export async function POST(request: NextRequest) {
  try {
    const { email, action, token, newPassword } = await request.json()

    if (action === 'request') {
      // Request password reset
      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 })
      }

      const user = await getUserByEmail(email)
      if (!user) {
        // Don't reveal if email exists or not for security
        return NextResponse.json({ 
          success: true, 
          message: 'If an account with that email exists, a reset link has been sent.' 
        })
      }

      // Generate reset token and store in Supabase (NOT in-memory)
      const resetToken = generateToken()
      const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Store reset token in Supabase
      const { error: storeError } = await supabase
        .from('password_reset_tokens')
        .insert([{
          email,
          token: resetToken,
          expires_at: expires.toISOString()
        }])

      if (storeError) {
        console.error('Error storing reset token:', storeError)
        return NextResponse.json({ 
          success: true, 
          message: 'If an account with that email exists, a reset link has been sent.' 
        })
      }

      // Get the base URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

      // Send email
      try {
        await fetch(`${baseUrl}/api/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            template: 'password_reset',
            data: { resetUrl },
          }),
        })
      } catch (emailError) {
        console.error('Failed to send reset email:', emailError)
      }

      // Log reset URL to console for testing
      console.log('\n========================================')
      console.log('PASSWORD RESET LINK (Console Mode)')
      console.log('========================================')
      console.log('Email:', email)
      console.log('Reset URL:', resetUrl)
      console.log('Token:', resetToken)
      console.log('Expires:', expires.toLocaleString())
      console.log('========================================\n')

      return NextResponse.json({ 
        success: true, 
        message: 'If an account with that email exists, a reset link has been sent.',
        // For development testing - shows in browser console
        devResetUrl: resetUrl,
      })
    } 
    
    if (action === 'reset') {
      // Reset password with token
      if (!token || !newPassword) {
        return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 })
      }

      // Verify token from Supabase (NOT in-memory)
      const { data: tokenData, error: queryError } = await supabase
        .from('password_reset_tokens')
        .select('email, expires_at')
        .eq('token', token)
        .single()

      if (queryError || !tokenData) {
        return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
      }

      if (new Date() > new Date(tokenData.expires_at)) {
        // Delete expired token
        await supabase
          .from('password_reset_tokens')
          .delete()
          .eq('token', token)
        
        return NextResponse.json({ error: 'Reset token has expired' }, { status: 400 })
      }

      const user = await getUserByEmail(tokenData.email)
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 400 })
      }

      // Update password in Supabase
      const success = await updateUserPassword(user.id, user.password, newPassword)
      if (!success) {
        return NextResponse.json({ error: 'Failed to update password' }, { status: 400 })
      }

      // Delete used token from Supabase
      await supabase
        .from('password_reset_tokens')
        .delete()
        .eq('token', token)

      return NextResponse.json({ success: true, message: 'Password has been reset successfully' })
    }

    if (action === 'verify') {
      // Verify token is valid
      if (!token) {
        return NextResponse.json({ error: 'Token is required' }, { status: 400 })
      }

      const { data: tokenData, error } = await supabase
        .from('password_reset_tokens')
        .select('email, expires_at')
        .eq('token', token)
        .single()

      if (error || !tokenData || new Date() > new Date(tokenData.expires_at)) {
        return NextResponse.json({ valid: false })
      }

      return NextResponse.json({ valid: true, email: tokenData.email })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
