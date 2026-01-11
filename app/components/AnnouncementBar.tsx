'use client'

import { useState, useEffect } from 'react'
import { AnnouncementBar as AnnouncementBarType } from '@/lib/models/HomepageContent'

interface AnnouncementBarProps {
  content?: AnnouncementBarType
}

export default function AnnouncementBar({ content }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (content) {
      setIsVisible(content.enabled)
    }
  }, [content])

  if (!isVisible || !content?.offers?.length) return null

  return (
    <div className="bg-sage/20 text-gray-800 py-2 px-4 text-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6 flex-wrap gap-2">
          {content.offers.map((offer, index) => (
            <div key={index} className="flex items-center space-x-2">
              {offer.icon && <span>{offer.icon}</span>}
              <span>{offer.text}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-600 hover:text-gray-800 ml-4"
          aria-label="Close announcement"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

