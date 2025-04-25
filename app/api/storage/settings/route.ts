import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.appSettings.findUnique({
      where: { id: 'default' }
    })
    
    if (!settings) {
      return NextResponse.json(null)
    }
    
    return NextResponse.json({
      libraryName: settings.libraryName,
      setupCompleted: settings.setupCompleted,
      theme: settings.theme,
      language: settings.language,
      autoBackup: settings.autoBackup,
      lastAutoBackup: settings.lastAutoBackup?.toISOString()
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(null, { status: 500 })
  }
} 