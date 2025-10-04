import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    const wipeLog = await request.json()
    
    // Get existing wipe logs
    const existingLogs = await redis.get('wipe_logs') || []
    
    // Add new wipe log
    const updatedLogs = Array.isArray(existingLogs) 
      ? [...existingLogs, wipeLog]
      : [wipeLog]
    
    // Store updated logs
    await redis.set('wipe_logs', updatedLogs)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging wipe:', error)
    return NextResponse.json(
      { error: 'Failed to log wipe' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const wipeLogs = await redis.get('wipe_logs') || []
    return NextResponse.json(wipeLogs)
  } catch (error) {
    console.error('Error fetching wipe logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wipe logs' },
      { status: 500 }
    )
  }
}
