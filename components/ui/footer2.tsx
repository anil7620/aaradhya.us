import Link from 'next/link'
import Logo from '@/app/components/Logo'
import { Instagram, Facebook, Youtube } from 'lucide-react'

interface Footer2Props {
  copyright?: string
  bottomLinks?: {
    text: string
    url: string
  }[]
}

const Footer2 = ({
  copyright = "© 2026 AARADHYA. All rights reserved.",
  bottomLinks = [
    { text: "Terms", url: "/terms" },
    { text: "Privacy", url: "/privacy" },
  ],
}: Footer2Props) => {
  const socialLinks = [
    { icon: Instagram, url: "#", label: "Instagram" },
    { icon: Facebook, url: "#", label: "Facebook" },
    { icon: Youtube, url: "#", label: "YouTube" },
  ]

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Copyright and Links */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-sm text-gray-600">
            <span className="whitespace-nowrap">{copyright}</span>
            <div className="flex items-center gap-3">
              {bottomLinks.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.url}
                  className="hover:text-teal-500 transition-colors whitespace-nowrap"
                >
                  {link.text}
                </Link>
              ))}
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social, idx) => {
              const Icon = social.icon
              return (
                <Link
                  key={idx}
                  href={social.url}
                  aria-label={social.label}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-teal-500 hover:text-white flex items-center justify-center transition-colors text-gray-600"
                >
                  <Icon className="w-4 h-4" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}

export { Footer2 }

