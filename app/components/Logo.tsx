import Link from 'next/link'

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
      <div className="flex flex-col items-start justify-center">
        <span className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary via-sage to-beige bg-clip-text text-transparent font-secondary leading-tight">
          AARADHYA
        </span>
        <span className="text-[10px] md:text-xs text-gray-600 font-medium tracking-wider uppercase">
          Puja & Brass
        </span>
      </div>
    </Link>
  )
}

