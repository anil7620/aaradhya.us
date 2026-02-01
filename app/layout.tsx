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
  description: 'Discover our exquisite collection of premium puja items and handcrafted brass products. Perfect for worship, home decor, and spiritual occasions.',
  icons: {
    icon: [
      { url: '/icons/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icons/favicon.svg',
    apple: '/icons/favicon.svg',
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

