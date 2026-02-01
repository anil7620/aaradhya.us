'use client'

import { useEffect, useState } from 'react'

const AnnouncementBar = () => {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/homepage', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to fetch homepage content')
        }
        const data = await response.json()
        const announcementBar = data.content?.announcementBar
        
        if (!announcementBar) {
          setEnabled(false)
          setAnnouncements([])
          setLoading(false)
          return
        }
        
        // Check if enabled
        if (!announcementBar.enabled) {
          setEnabled(false)
          setAnnouncements([])
          setLoading(false)
          return
        }
        
        // Handle both 'announcements' and 'offers' structures
        let rawAnnouncements: any[] = []
        
        if (announcementBar.announcements && Array.isArray(announcementBar.announcements) && announcementBar.announcements.length > 0) {
          // New structure: announcements array
          rawAnnouncements = announcementBar.announcements
        } else if (announcementBar.offers && Array.isArray(announcementBar.offers) && announcementBar.offers.length > 0) {
          // Old structure: offers array (map to announcements format)
          rawAnnouncements = announcementBar.offers.map((offer: any) => ({
            offerText: offer.text || offer.offerText || '',
            icon: offer.icon || '',
          }))
        }
        
        // Filter valid announcements (non-empty, meaningful text)
        const valid = rawAnnouncements
          .map((ann: any) => ({
            offerText: ann.offerText || ann.text || '',
            icon: ann.icon || '',
          }))
          .filter(
            (ann: any) => 
              ann.offerText && 
              ann.offerText.trim() !== '' && 
              ann.offerText.trim().length > 2
          )
        
        if (valid.length > 0) {
          setEnabled(true)
          setAnnouncements(valid)
        } else {
          setEnabled(false)
          setAnnouncements([])
          setLoading(false)
        }
      } catch (error) {
        console.error('Error loading announcements:', error)
        setEnabled(false)
        setAnnouncements([])
      } finally {
        setLoading(false)
      }
    }
    loadAnnouncements()
  }, [])

  // Filter out invalid announcements (empty or just "aa")
  const validAnnouncements = announcements.filter(
    (ann) => ann.offerText && ann.offerText.trim() !== '' && ann.offerText.trim() !== 'aa' && ann.offerText.trim().length > 2
  )

  // If only 1 announcement, show it statically centered
  // If 2+ announcements, show them with drop animation
  const shouldAnimate = validAnnouncements.length > 1

  useEffect(() => {
    if (!shouldAnimate || validAnnouncements.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validAnnouncements.length)
    }, 4000) // Change every 4 seconds

    return () => clearInterval(interval)
  }, [shouldAnimate, validAnnouncements.length])

  if (loading) {
    return null
  }

  if (!enabled || validAnnouncements.length === 0) {
    return null
  }

  return (
    <>
      <style jsx global>{`
        @keyframes announcement-drop {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          60% {
            opacity: 1;
            transform: translateY(2px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .announcement-drop-enter {
          animation: announcement-drop 0.5s ease-out forwards;
        }
        .announcement-drop-exit {
          animation: announcement-drop 0.3s ease-in reverse;
        }
        @media (prefers-reduced-motion: reduce) {
          .announcement-drop-enter,
          .announcement-drop-exit {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
      <div 
        data-announcement-bar
        className="w-full border-b border-teal-200/50 bg-gradient-to-r from-teal-50 via-sky-50 to-teal-50"
        style={{ 
          
          position: 'relative',
          zIndex: 60
        }}
      >
        <div className="w-full overflow-hidden">
          {shouldAnimate ? (
            // Drop animation for multiple announcements
            <div className="relative overflow-hidden py-2.5 min-h-[2.5rem] flex items-center justify-center">
              <div key={currentIndex} className="announcement-drop-enter">
                <div className="flex items-center gap-2">
                  {validAnnouncements[currentIndex]?.icon && (
                    <span className="text-base leading-none">
                      {validAnnouncements[currentIndex].icon}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-teal-700 leading-tight">
                    {validAnnouncements[currentIndex]?.offerText || ''}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Static centered display for single announcement
            <div className="flex items-center justify-center py-2.5">
              <div className="flex items-center gap-2">
                {validAnnouncements[0]?.icon && (
                    <span className="text-base leading-none">
                      {validAnnouncements[0].icon}
                    </span>
                )}
                <span className="text-sm font-semibold text-teal-700 leading-tight">
                  {validAnnouncements[0]?.offerText || ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default AnnouncementBar