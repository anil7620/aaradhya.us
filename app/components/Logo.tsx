import Image from 'next/image'

export default function Logo({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <div className={className} style={{ position: 'relative' }}>
      <Image
        src="/logos/aaradhya.jpeg"
        alt="AARADHYA Logo"
        fill
        className="object-contain"
        priority
        sizes="(max-width: 768px) 64px, 128px"
      />
    </div>
  )
}

