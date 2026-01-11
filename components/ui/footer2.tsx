import Link from 'next/link'
import Logo from '@/app/components/Logo'

interface MenuItem {
  title: string
  links: {
    text: string
    url: string
  }[]
}

interface Footer2Props {
  tagline?: string
  menuItems?: MenuItem[]
  copyright?: string
  bottomLinks?: {
    text: string
    url: string
  }[]
}

const Footer2 = ({
  tagline = "Creating premium puja items and handcrafted brass products that bring spirituality, elegance, and divine blessings to your home and worship.",
  menuItems = [
    {
      title: "Quick Links",
      links: [
        { text: "Home", url: "/" },
        { text: "Shop All", url: "/products" },
        { text: "About Us", url: "/about" },
        { text: "Contact", url: "/contact" },
      ],
    },
    {
      title: "Categories",
      links: [
        { text: "Puja Items", url: "/products?category=puja" },
        { text: "Brass Products", url: "/products?category=brass" },
        { text: "Gift Sets", url: "/products" },
        { text: "Bulk Orders", url: "/products" },
      ],
    },
    {
      title: "Resources",
      links: [
        { text: "Help", url: "/help" },
        { text: "Delivery Policy", url: "/delivery-policy" },
        { text: "Quality Guarantee", url: "/quality-guarantee" },
      ],
    },
    {
      title: "Social",
      links: [
        { text: "Instagram", url: "#" },
        { text: "Facebook", url: "#" },
        { text: "YouTube", url: "#" },
      ],
    },
  ],
  copyright = "© 2026 AARADHYA. All rights reserved.",
  bottomLinks = [
    { text: "Terms and Conditions", url: "/terms" },
    { text: "Privacy Policy", url: "/privacy" },
  ],
}: Footer2Props) => {
  return (
    <section className="py-16 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <footer>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
            <div className="col-span-2 mb-8 lg:mb-0">
              <div className="flex items-center gap-2 lg:justify-start">
                <Link href="/">
                  <Logo className="w-16 h-16" />
                </Link>
              </div>
              <p className="mt-4 text-gray-600 text-sm">{tagline}</p>
            </div>
            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-bold text-gray-900">{section.title}</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      <Link href={link.url}>{link.text}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col justify-between gap-4 border-t border-gray-200 pt-8 text-sm font-medium text-gray-600 md:flex-row md:items-center">
            <p>{copyright}</p>
            <ul className="flex gap-4">
              {bottomLinks.map((link, linkIdx) => (
                <li key={linkIdx} className="hover:text-primary transition-colors">
                  <Link href={link.url}>{link.text}</Link>
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </div>
    </section>
  )
}

export { Footer2 }

