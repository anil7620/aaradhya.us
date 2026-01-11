import Link from 'next/link'

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
      <div className="flex flex-col items-start justify-center">
        <span className="text-xl md:text-2xl lg:text-3xl font-bold font-secondary leading-tight" style={{ color: '#C04000' }}>
          AARADHYA
        </span>
        <span className="text-[10px] md:text-xs text-gray-600 font-medium tracking-wider uppercase">
          Puja & Brass
        </span>
      </div>
    </Link>
  )
}

