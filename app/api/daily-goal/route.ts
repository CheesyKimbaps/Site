import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET() {
  try {
    const dailyGoal = await redis.get('daily_goal')
    return NextResponse.json({ dailyGoal: dailyGoal ?? 100 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch daily goal' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { dailyGoal } = await request.json()
    if (typeof dailyGoal !== 'number' || isNaN(dailyGoal) || dailyGoal < 1) {
      return NextResponse.json({ error: 'Invalid daily goal' }, { status: 400 })
    }
    await redis.set('daily_goal', dailyGoal)
    return NextResponse.json({ success: true, dailyGoal })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update daily goal' }, { status: 500 })
  }
} 