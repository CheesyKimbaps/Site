import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET() {
  try {
    // Get all data for backup
    const transactions = await redis.get('transactions') || []
    const wipeLogs = await redis.get('wipe_logs') || []
    const stats = await redis.get('stats') || {
      total_profit: 0,
      cashapp_fee: 0,
      other_fee: 0
    }
    
    const backupData = {
      transactions,
      wipe_logs: wipeLogs,
      stats,
      backup_timestamp: new Date().toISOString(),
      version: '1.0'
    }
    
    return NextResponse.json(backupData)
  } catch (error) {
    console.error('Error creating backup:', error)
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const backupData = await request.json()
    
    // Get existing backups
    const existingBackups = await redis.get('backups') || []
    
    // Create new backup entry
    const newBackup = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      data: backupData,
      size: JSON.stringify(backupData).length
    }
    
    // Add to backups array and keep only last 10
    const updatedBackups = Array.isArray(existingBackups) 
      ? [...existingBackups, newBackup].slice(-10)
      : [newBackup]
    
    // Store updated backups
    await redis.set('backups', updatedBackups)
    
    // Also update the current data
    if (backupData.transactions) {
      await redis.set('transactions', backupData.transactions)
    }
    if (backupData.wipe_logs) {
      await redis.set('wipe_logs', backupData.wipe_logs)
    }
    if (backupData.stats) {
      await redis.set('stats', backupData.stats)
    }
    
    return NextResponse.json({ 
      success: true, 
      backup_id: newBackup.id,
      total_backups: updatedBackups.length 
    })
  } catch (error) {
    console.error('Error restoring backup:', error)
    return NextResponse.json(
      { error: 'Failed to restore backup' },
      { status: 500 }
    )
  }
}

// Get list of available backups
export async function PUT() {
  try {
    const backups = await redis.get('backups') || []
    
    const backupList = Array.isArray(backups) 
      ? backups.map(backup => ({
          id: backup.id,
          timestamp: backup.timestamp,
          size: backup.size
        }))
      : []
    
    return NextResponse.json(backupList)
  } catch (error) {
    console.error('Error fetching backup list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch backups' },
      { status: 500 }
    )
  }
}
