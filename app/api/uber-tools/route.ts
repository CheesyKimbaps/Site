import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { auth } from '@clerk/nextjs/server'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Get all Uber Tools data
    const emails = await redis.get('uber_emails') || []
    const vccCards = await redis.get('uber_vcc_cards') || []
    const usedCards = await redis.get('uber_used_cards') || []
    const linkHistory = await redis.get('uber_link_history') || []
    
    const uberToolsData = {
      emails,
      vccCards,
      usedCards,
      linkHistory,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
    
    return NextResponse.json(uberToolsData)
  } catch (error) {
    console.error('Error fetching Uber Tools data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Uber Tools data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const uberToolsData = await request.json()
    
    // Get existing backups
    const existingBackups = await redis.get('uber_tools_backups') || []
    
    // Create new backup entry
    const newBackup = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      data: uberToolsData,
      size: JSON.stringify(uberToolsData).length
    }
    
    // Add to backups array and keep only last 10
    const updatedBackups = Array.isArray(existingBackups) 
      ? [...existingBackups, newBackup].slice(-10)
      : [newBackup]
    
    // Store updated backups
    await redis.set('uber_tools_backups', updatedBackups)
    
    // Update the current data
    if (uberToolsData.emails) {
      await redis.set('uber_emails', uberToolsData.emails)
    }
    if (uberToolsData.vccCards) {
      await redis.set('uber_vcc_cards', uberToolsData.vccCards)
    }
    if (uberToolsData.usedCards) {
      await redis.set('uber_used_cards', uberToolsData.usedCards)
    }
    if (uberToolsData.linkHistory) {
      await redis.set('uber_link_history', uberToolsData.linkHistory)
    }
    
    return NextResponse.json({ 
      success: true, 
      backup_id: newBackup.id,
      total_backups: updatedBackups.length 
    })
  } catch (error) {
    console.error('Error saving Uber Tools data:', error)
    return NextResponse.json(
      { error: 'Failed to save Uber Tools data' },
      { status: 500 }
    )
  }
}

// Get list of available backups
export async function PUT() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const backups = await redis.get('uber_tools_backups') || []
    
    const backupList = Array.isArray(backups) 
      ? backups.map(backup => ({
          id: backup.id,
          timestamp: backup.timestamp,
          size: backup.size
        }))
      : []
    
    return NextResponse.json(backupList)
  } catch (error) {
    console.error('Error fetching Uber Tools backup list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Uber Tools backups' },
      { status: 500 }
    )
  }
}
 