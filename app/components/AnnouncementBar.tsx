'use client'

import { useEffect, useState } from 'react'
import { contentApi } from '@/lib/api/content'

const AnnouncementBar = () => {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        setLoading(true)
        const content = await contentApi.getHomepage()
        const announcementBar = content.content?.announcementBar
        
        console.log('AnnouncementBar data:', announcementBar) // Debug log
        
        if (announcementBar?.enabled && announcementBar?.announcements && announcementBar.announcements.length > 0) {
          // Filter valid announcements
          const valid = announcementBar.announcements.filter(
            (ann: any) => ann.offerText && ann.offerText.trim() !== '' && ann.offerText.trim() !== 'aa' && ann.offerText.trim().length > 2
          )
          
          console.log('Valid announcements:', valid) // Debug log
          
          if (valid.length > 0) {
            setEnabled(true)
            setAnnouncements(valid)
          } else {
            console.warn('Announcement bar enabled but no valid announcements found')
            setEnabled(false)
            setAnnouncements([])
          }
        } else if (announcementBar?.enabled && announcementBar?.offers && announcementBar.offers.length > 0) {
          // Fallback: handle old structure with 'offers' instead of 'announcements'
          const valid = announcementBar.offers
            .map((offer: any) => ({
              offerText: offer.text || offer.offerText,
              icon: offer.icon,
            }))
            .filter(
              (ann: any) => ann.offerText && ann.offerText.trim() !== '' && ann.offerText.trim() !== 'aa' && ann.offerText.trim().length > 2
            )
          
          if (valid.length > 0) {
            setEnabled(true)
            setAnnouncements(valid)
          } else {
            setEnabled(false)
            setAnnouncements([])
          }
        } else {
          setEnabled(false)
          setAnnouncements([])
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
        className="w-full border-b border-border/30"
        style={{ 
          background: 'linear-gradient(135deg, hsl(145 30% 92%) 0%, hsl(145 25% 94%) 50%, hsl(145 30% 92%) 100%)',
          position: 'relative',
          zIndex: 60
        }}
      >
        <div className="w-full overflow-hidden">
          {shouldAnimate ? (
            // Drop animation for multiple announcements
            <div className="relative overflow-hidden py-3 min-h-[2.5rem] flex items-center justify-center">
              <div key={currentIndex} className="announcement-drop-enter">
                <div className="flex items-center gap-2">
                  {validAnnouncements[currentIndex].icon && (
                    <span className="text-lg leading-none">
                      {validAnnouncements[currentIndex].icon}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-primary leading-tight">
                    {validAnnouncements[currentIndex].offerText}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Static centered display for single announcement
            <div className="flex items-center justify-center py-3">
              <div className="flex items-center gap-2">
                {validAnnouncements[0].icon && (
                  <span className="text-lg leading-none">
                    {validAnnouncements[0].icon}
                  </span>
                )}
                <span className="text-sm font-semibold text-primary leading-tight">
                  {validAnnouncements[0].offerText}
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