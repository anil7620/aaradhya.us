import type { Metadata } from 'next'
import { Inter, Playfair_Display, Dancing_Script } from 'next/font/google'
import './globals.css'
import ConditionalLayout from './components/ConditionalLayout'
import { getHomepageContent } from '@/lib/homepage'

// Primary font: body text
const primaryFont = Inter({
  subsets: ['latin'],
  variable: '--font-primary',
  display: 'swap',
})

// Secondary font: headings / emphasis
const secondaryFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-secondary',
  display: 'swap',
})

// Tertiary font: decorative / script accents
const tertiaryFont = Dancing_Script({ 
  subsets: ['latin'],
  variable: '--font-tertiary',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Aaradhya - Premium Puja Items & Brass Products',
  description: 'Authentic Indian puja items and handcrafted brass products, delivered to your doorstep in the USA. Bring divine blessings to your home with our premium collection.',
  keywords: ['puja items', 'brass products', 'Indian puja', 'spiritual products', 'handcrafted brass', 'USA delivery'],
  authors: [{ name: 'Aaradhya' }],
  creator: 'Aaradhya',
  publisher: 'Aaradhya',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aaradhya.us'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.aaradhya.us',
    siteName: 'Aaradhya',
    title: 'Aaradhya - Premium Puja Items & Brass Products',
    description: 'Authentic Indian puja items and handcrafted brass products, delivered to your doorstep in the USA. Bring divine blessings to your home with our premium collection.',
    images: [
      {
        url: '/logos/logo-aaradhya.png',
        width: 1200,
        height: 630,
        alt: 'Aaradhya - Premium Puja Items & Brass Products',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aaradhya - Premium Puja Items & Brass Products',
    description: 'Authentic Indian puja items and handcrafted brass products, delivered to your doorstep in the USA.',
    images: ['/logos/logo-aaradhya.png'],
    creator: '@aaradhya',
  },
  icons: {
    icon: [
      { url: '/icons/favicon.svg', type: 'image/svg+xml' },
      { url: '/logos/logo-aaradhya.png', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: '/icons/favicon.svg',
    apple: [
      { url: '/logos/logo-aaradhya.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const homepageContent = await getHomepageContent()

  return (
    <html
      lang="en"
      className={`${primaryFont.variable} ${secondaryFont.variable} ${tertiaryFont.variable}`}
    >
      <body className="font-primary">
        <ConditionalLayout 
          footerContent={homepageContent?.footer}
        >
          <main className="min-h-screen">{children}</main>
        </ConditionalLayout>
      </body>
    </html>
  )
}

