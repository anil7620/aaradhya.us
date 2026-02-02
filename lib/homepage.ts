import clientPromise from './mongodb'
import { HomepageContent } from './models/HomepageContent'
import { ObjectId } from 'mongodb'

export async function getHomepageContent(): Promise<HomepageContent | null> {
  const client = await clientPromise
  const db = client.db()
  
  const content = await db.collection<HomepageContent>('homepage_content').findOne({})
  
  // If content exists, return it
  if (content) {
    return content
  }
  
  // If no content exists, return default content with India-focused messaging
  return {
      hero: {
        id: 'hero',
        title: 'Premium',
        subtitle: 'Puja Items',
        description: 'Authentic Indian puja items and handcrafted brass products, delivered to your doorstep in the USA. Bring divine blessings to your home with our premium collection.',
        buttonText: 'Shop Now',
        buttonLink: '/products',
        
        stats: [
          {
            number: '1K+',
            label: 'Happy Families',
          },
        ],
      },
      features: [
        {
          id: 'feature1',
          title: 'Direct from Indian Artisans',
          description: 'Sourced directly from skilled craftsmen in India, ensuring authenticity and supporting traditional livelihoods',
          icon: '🕉️',
        },
        {
          id: 'feature2',
          title: 'Temple-Quality Products',
          description: 'Same quality items used in temples across India. Blessed and verified for spiritual use',
          icon: '🙏',
        },
        {
          id: 'feature3',
          title: 'Fast USA Shipping',
          description: 'Express delivery to your doorstep in 5-7 business days. No long waits from India',
          icon: '🚚',
        },
        {
          id: 'feature4',
          title: '100% Money-Back Guarantee',
          description: 'Not satisfied? Full refund within 30 days. We stand behind every product',
          icon: '🛡️',
        },
        {
          id: 'feature5',
          title: 'Bilingual Customer Support',
          description: 'Get help in Hindi or English. We understand your needs and cultural requirements',
          icon: '💬',
        },
        {
          id: 'feature6',
          title: 'Family-Owned Business',
          description: 'Run by Indian families who understand the importance of authentic puja items in your home',
          icon: '👨‍👩‍👧‍👦',
        },
      ],
      announcementBar: {
        enabled: true,
        offers: [
          {
            text: 'FREE SHIPPING on orders above $30 | मुफ्त शिपिंग',
            icon: '🚚',
          },
          {
            text: 'Get 5% OFF on orders above $60 | 5% छूट',
            icon: '🎉',
          },
        ],
      },
      footer: {
        tagline: 'Bringing authentic Indian puja items and handcrafted brass products to Indian families across the USA. Experience divine blessings with our premium collection.',
        menuItems: [
          {
            title: 'Quick Links',
            links: [
              { text: 'Home', url: '/' },
              { text: 'Shop All', url: '/products' },
              { text: 'About Us', url: '/about' },
              { text: 'Contact', url: '/contact' },
            ],
          },
          {
            title: 'Categories',
            links: [
              { text: 'Puja Items', url: '/products?category=puja' },
              { text: 'Brass Products', url: '/products?category=brass' },
              { text: 'Gift Sets', url: '/products' },
              { text: 'Bulk Orders', url: '/products' },
            ],
          },
          {
            title: 'Resources',
            links: [
              { text: 'Help', url: '/help' },
              { text: 'Delivery Policy', url: '/delivery-policy' },
              { text: 'Quality Guarantee', url: '/quality-guarantee' },
            ],
          },
          {
            title: 'Social',
            links: [
              { text: 'Instagram', url: '#' },
              { text: 'Facebook', url: '#' },
              { text: 'YouTube', url: '#' },
            ],
          },
        ],
        copyright: '© 2026 Aaradhya. All rights reserved.',
        bottomLinks: [
          { text: 'Terms and Conditions', url: '/terms' },
          { text: 'Privacy Policy', url: '/privacy' },
        ],
      },
      updatedAt: new Date(),
    }
  }

export async function updateHomepageContent(content: Partial<HomepageContent>, userId: string): Promise<HomepageContent> {
  const client = await clientPromise
  const db = client.db()
  
  // Ensure all required fields are present
  const existingContent = await getHomepageContent()
  
  // Build update object, excluding _id (which is immutable)
  const { _id, ...existingWithoutId } = existingContent || {}
  
  const update: Partial<HomepageContent> = {
    ...existingWithoutId,
    ...content,
    updatedAt: new Date(),
    updatedBy: new ObjectId(userId),
  }
  
  // Remove _id if it somehow got included
  delete (update as any)._id
  
  // Ensure required fields are present
  if (!update.hero) {
    update.hero = existingContent?.hero || {
      id: 'hero',
      title: 'Premium',
      subtitle: 'Puja Items',
      description: 'Discover our exquisite collection of premium puja items and handcrafted brass products.',
      buttonText: 'Shop Now',
      buttonLink: '/products',
    }
  }
  
  if (!update.features) {
    update.features = existingContent?.features || []
  }
  
  if (!update.announcementBar) {
    update.announcementBar = existingContent?.announcementBar || {
      enabled: true,
      offers: [],
    }
  }
  
  if (!update.footer) {
    update.footer = existingContent?.footer || {
      tagline: 'Creating premium puja items and handcrafted brass products.',
      menuItems: [],
      copyright: '© 2026 Aaradhya. All rights reserved.',
      bottomLinks: [],
    }
  }
  
  const result = await db.collection<HomepageContent>('homepage_content').findOneAndUpdate(
    {},
    { $set: update },
    { upsert: true, returnDocument: 'after' }
  )
  
  if (!result) {
    throw new Error('Failed to update homepage content')
  }
  
  return result
}

