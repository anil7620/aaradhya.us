import Link from 'next/link'
import Image from 'next/image'

export default function Logo({ className }: { className?: string }) {
  // Logo image is 905x408 (aspect ratio ~2.22:1)
  // Use height-based sizing to maintain aspect ratio
  return (
    <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
      <Image
        src="/logos/logo-aaradhya.png"
        alt="Aaradhya Puja & Brass"
        width={905}
        height={408}
        className={className || 'h-10 md:h-12 w-auto'}
        priority
        unoptimized
      />
    </Link>
  )
}

