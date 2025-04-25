import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const username = url.searchParams.get('username')
  
  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { username }
    })
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(null, { status: 500 })
  }
} 