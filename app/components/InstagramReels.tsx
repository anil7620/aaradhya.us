'use client'

import { useState, useEffect } from 'react'
import { Instagram } from 'lucide-react'

interface InstagramReel {
  id: string
  media_url?: string
  permalink: string
  caption?: string
  timestamp: string
  thumbnail_url?: string
}

interface InstagramReelsProps {
  username?: string
  limit?: number
}

export default function InstagramReels({ username = 'house_of_aaradhya', limit = 6 }: InstagramReelsProps) {
  const [reels, setReels] = useState<InstagramReel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReels()
  }, [])

  const fetchReels = async () => {
    try {
      const res = await fetch('/api/instagram/reels')
      if (res.ok) {
        const data = await res.json()
        setReels(data.reels || [])
      } else {
        // If API fails, show manual embeds or fallback
        setError('Unable to load Instagram reels')
      }
    } catch (err) {
      console.error('Error fetching Instagram reels:', err)
      setError('Unable to load Instagram reels')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Follow Us on Instagram</h2>
            <p className="text-lg text-gray-600">Loading our latest reels...</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="aspect-[9/16] bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || reels.length === 0) {
    return (
      <div className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Follow Us on Instagram</h2>
            <p className="text-lg text-gray-600 mb-6">
              Check out our latest reels and updates
            </p>
            <a
              href={`https://www.instagram.com/${username}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Instagram className="w-5 h-5" />
              <span>Follow @{username}</span>
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Follow Us on Instagram</h2>
          <p className="text-lg text-gray-600 mb-6">
            Check out our latest reels and updates
          </p>
          <a
            href={`https://www.instagram.com/${username}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all mb-8"
          >
            <Instagram className="w-5 h-5" />
            <span>Follow @{username}</span>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reels.slice(0, limit).map((reel) => (
            <div
              key={reel.id}
              className="group relative aspect-[9/16] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <a
                href={reel.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full"
              >
                {reel.thumbnail_url || reel.media_url ? (
                  <img
                    src={reel.thumbnail_url || reel.media_url}
                    alt={reel.caption || 'Instagram Reel'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <Instagram className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 rounded-full p-4">
                      <Instagram className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
