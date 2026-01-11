import { NextRequest, NextResponse } from 'next/server'

/**
 * Instagram Reels API Route
 * 
 * This endpoint fetches Instagram reels using the Instagram Graph API.
 * 
 * Setup Required:
 * 1. Create a Facebook App at https://developers.facebook.com/
 * 2. Add Instagram Basic Display product
 * 3. Get Access Token (requires app review for production)
 * 4. Add INSTAGRAM_ACCESS_TOKEN to .env.local
 * 
 * For now, this returns empty array if token is not configured.
 * You can manually embed reels using Instagram's embed feature as fallback.
 */

interface InstagramMedia {
  id: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REELS'
  media_url?: string
  permalink: string
  caption?: string
  timestamp: string
  thumbnail_url?: string
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
    const instagramUserId = process.env.INSTAGRAM_USER_ID || 'house_of_aaradhya'

    // If no access token, return empty (fallback to manual embeds)
    if (!accessToken) {
      console.log('Instagram access token not configured. Using fallback.')
      return NextResponse.json({ 
        reels: [],
        message: 'Instagram API not configured. Use manual embeds or configure access token.' 
      })
    }

    // Fetch media from Instagram Graph API
    const apiUrl = `https://graph.instagram.com/${instagramUserId}/media?fields=id,media_type,media_url,permalink,caption,timestamp,thumbnail_url&access_token=${accessToken}&limit=12`
    
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      console.error('Instagram API error:', await response.text())
      return NextResponse.json({ 
        reels: [],
        error: 'Failed to fetch from Instagram API' 
      })
    }

    const data = await response.json()
    
    // Filter for reels only
    const reels = (data.data || [])
      .filter((item: InstagramMedia) => item.media_type === 'REELS' || item.media_type === 'VIDEO')
      .map((item: InstagramMedia) => ({
        id: item.id,
        media_url: item.media_url,
        permalink: item.permalink,
        caption: item.caption,
        timestamp: item.timestamp,
        thumbnail_url: item.thumbnail_url,
      }))

    return NextResponse.json({ reels })
  } catch (error) {
    console.error('Error fetching Instagram reels:', error)
    return NextResponse.json(
      { reels: [], error: 'Failed to fetch Instagram reels' },
      { status: 500 }
    )
  }
}
