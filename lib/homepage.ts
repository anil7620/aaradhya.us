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
  
  // If no content exists, return default content
  return {
      hero: {
        id: 'hero',
        title: 'Premium',
        subtitle: 'Puja Items',
        description: 'Discover our exquisite collection of premium puja items and handcrafted brass products. Perfect for worship, home decor, and spiritual occasions.',
        buttonText: 'Shop Now',
        buttonLink: '/products',
        
        stats: [
          {
            number: '5000+',
            label: 'Happy Customers',
          },
        ],
      },
      features: [
        {
          id: 'feature1',
          title: '5000+ Orders Delivered',
          description: 'Trusted by customers nationwide',
          icon: '🚚',
        },
        {
          id: 'feature2',
          title: 'Nationwide USA Delivery',
          description: 'Fast & secure shipping across all US states',
          icon: '📦',
        },
        {
          id: 'feature3',
          title: 'Handcrafted with Devotion',
          description: 'Premium quality, divine designs',
          icon: '🙏',
        },
      ],
      announcementBar: {
        enabled: true,
        offers: [
          {
            text: 'FREE SHIPPING on orders above $30',
            icon: '🚚',
          },
          {
            text: 'Get 5% OFF on orders above $60',
            icon: '🎉',
          },
        ],
      },
      footer: {
        tagline: 'Creating premium puja items and handcrafted brass products that bring spirituality, elegance, and divine blessings to your home and worship.',
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

