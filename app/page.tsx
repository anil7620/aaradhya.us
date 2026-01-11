import Link from 'next/link'
import Image from 'next/image'
import { getProducts } from '@/lib/products'
import { getHomepageContent } from '@/lib/homepage'
import Footer from './components/Footer'
import InstagramReels from './components/InstagramReels'

export default async function Home() {
  const [products, homepageContent] = await Promise.all([
    getProducts({ limit: 8 }),
    getHomepageContent(),
  ])

  const hero = homepageContent?.hero || {
    id: 'hero',
    title: '',
    subtitle: '',
    description: '',
    buttonText: '',
    buttonLink: '',
  }
  const features = homepageContent?.features || []

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-sage/20 to-beige/10 py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-6">
              {/* Badge */}
              {hero.badge && (
                <div className="inline-flex items-center space-x-2 bg-sage/20 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  {hero.badge.icon && <span>{hero.badge.icon}</span>}
                  <span>{hero.badge.text}</span>
                </div>
              )}

              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="text-gray-900">{hero.title || 'Premium'}</span>{' '}
                <span className="text-primary">{hero.subtitle || 'Puja Items'}</span>{' '}
                <span className="text-gray-900">& Brass Products</span>
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-600 leading-relaxed">
                {hero.description || 'Discover our exquisite collection of premium puja items and handcrafted brass products. Perfect for worship, home decor, and spiritual occasions.'}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href={hero.buttonLink || '/products'}
                  className="inline-flex items-center space-x-2 bg-primary text-white px-8 py-4 rounded-lg font-semibold shadow-md shadow-primary/20 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98]"
                >
                  <span>{hero.buttonText || 'Shop Now'}</span>
                  <span>⭐</span>
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center space-x-2 border-2 border-primary bg-transparent text-primary px-8 py-4 rounded-lg font-semibold shadow-sm hover:bg-primary hover:text-white hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                >
                  <span>View Collection</span>
                </Link>
              </div>
            </div>

            {/* Right Side - Hero Image */}
            <div className="relative">
              <div className="relative w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://media.istockphoto.com/id/2168877442/photo/close-up-of-a-beautifully-decorated-pooja-thali-for-festival-celebration-to-worship.webp?a=1&b=1&s=612x612&w=0&k=20&c=2y8jgnE3dy7ZFapRX9Wni8D2EVsLDBhj35EePVskvMA="
                  alt="Premium Puja Items & Brass Products"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* Gradient overlay for better text readability if needed */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10"></div>
              </div>
              
              {/* Floating Badge - Premium Quality */}
              <div className="absolute bottom-6 right-6 bg-sage/20 text-primary px-4 py-2 rounded-full shadow-lg z-10">
                <div className="flex items-center space-x-2">
                  <span>❤️</span>
                  <span className="text-sm font-medium">Premium Quality</span>
                </div>
              </div>

              {/* Customer Count Badge */}
              {hero.stats && hero.stats[0] && (
                <div className="absolute top-6 left-6 bg-sage/20 text-primary px-5 py-3 rounded-full shadow-lg z-10">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{hero.stats[0].number}</div>
                    <div className="text-xs font-medium">{hero.stats[0].label}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={feature.id || index} className="bg-gradient-to-br from-sage/10 to-sage/20 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">{feature.icon || '✨'}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600">Handpicked favorites from our collection</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product._id?.toString()}
                href={`/products/${product._id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all group"
              >
                <div className="h-64 bg-gradient-to-br from-sage/10 to-sage/20 flex items-center justify-center relative overflow-hidden">
                  <div className="w-24 h-24 bg-sage/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-4xl">
                      {product.category === 'puja' ? '🪔' : product.category === 'brass' ? '🔔' : '🙏'}
                    </span>
                  </div>
                  {product.stock === 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Out of Stock
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-primary font-bold text-xl">
                      ₹{product.price}
                    </p>
                    <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="text-6xl mb-4">🪔</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Available</h3>
                <p className="text-gray-600 text-lg">Come back soon! We're preparing something special for you.</p>
              </div>
            </div>
          )}

          {products.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/products"
                className="inline-block bg-primary text-white px-8 py-4 rounded-lg font-semibold shadow-md shadow-primary/20 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98]"
              >
                View All Products
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Instagram Reels Section */}
      <InstagramReels username="house_of_arushi" limit={6} />

    </div>
  )
}
