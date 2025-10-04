import { NextRequest, NextResponse } from 'next/server'
// No kv import needed for webhook route

export async function POST(request: NextRequest) {
  try {
    const { password, ip, timestamp } = await request.json()
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL

    if (!webhookUrl) {
      console.error('Discord webhook URL not configured')
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      )
    }

    const embed = {
      title: '🚨 Failed Login Attempt',
      color: 0xff0000, // Red color
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
          value: new Date(timestamp).toLocaleString(),
          inline: false
        }
      ],
      timestamp: timestamp
    }

    const webhookPayload = {
      content: '<@783202111209996298>',
      embeds: [embed]
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    })

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.statusText}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to send webhook' },
      { status: 500 }
    )
  }
}
