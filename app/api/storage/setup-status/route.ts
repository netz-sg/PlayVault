import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.appSettings.findUnique({
      where: { id: 'default' }
    })
    return NextResponse.json({ 
      setupCompleted: settings?.setupCompleted || false 
    })
  } catch (error) {
    console.error('Error fetching setup status:', error)
    return NextResponse.json({ setupCompleted: false }, { status: 500 })
  }
} 