import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getTokenFromRequest } from '@/lib/auth-helpers'
import { getHomepageContent, updateHomepageContent } from '@/lib/homepage'
import { logger } from '@/lib/logger'

// Cache homepage content for 5 minutes
export const revalidate = 300

export async function GET() {
  try {
    const content = await getHomepageContent()
    const response = NextResponse.json({ content })
    
    // Cache homepage content for 5 minutes, allow stale-while-revalidate for 1 hour
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=3600'
    )
    
    return response
  } catch (error) {
    logger.error('Error fetching homepage content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const updated = await updateHomepageContent(body.content, payload.userId)

    return NextResponse.json({ content: updated })
  } catch (error) {
    logger.error('Error updating homepage content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

