import { Footer2 } from '@/components/ui/footer2'
import { FooterContent } from '@/lib/models/HomepageContent'

interface FooterProps {
  content?: FooterContent
}

export default function Footer({ content }: FooterProps) {
  return (
    <Footer2
      copyright={content?.copyright}
      bottomLinks={content?.bottomLinks}
    />
  )
}

