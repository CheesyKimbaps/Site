import { NextRequest, NextResponse } from 'next/server'
// No kv import needed for auth route

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    const correctPassword = process.env.APP_PASSWORD

    if (!correctPassword) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    if (password === correctPassword) {
      return NextResponse.json({ success: true })
    } else {
      // Log failed attempt to Discord webhook
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'Unknown'
      
      // Send webhook notification for failed login
      try {
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL
        if (webhookUrl) {
          const embed = {
            title: '🚨 Failed Login Attempt',
            color: 0xff0000,
            fields: [
              {
                name: 'Attempted Password',
                value: `\`${password}\``,
                inline: true
              },
              {
                name: 'IP Address',
                value: ip || 'Unknown',
                inline: true
              },
              {
                name: 'Timestamp',
                value: new Date().toLocaleString(),
                inline: false
              }
            ],
            timestamp: new Date().toISOString()
          }

          await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: '<@539475826333319179>',
              embeds: [embed]
            }),
          })
        }
      } catch (webhookError) {
        console.error('Failed to send Discord webhook:', webhookError)
      }

      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
