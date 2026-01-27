import Link from 'next/link'
import Image from 'next/image'
import ProductImage from './components/ProductImage'
import { getFeaturedProducts, getTrendingProducts, getBestSellers } from '@/lib/products'
import { getHomepageContent } from '@/lib/homepage'
import Footer from './components/Footer'

// Reusable Product Card Component
function ProductCard({ product }: { product: any }) {
  return (
    <Link
      href={`/products/${product._id}`}
      className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Image Container - Better aspect ratio and hover effect */}
      <div className="relative h-56 md:h-72 bg-gradient-to-br from-sage/10 to-sage/20 overflow-hidden">
        <ProductImage
          src={product.images?.[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Overlay on hover - Quick actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
        
        {/* Stock Badge - Better positioning */}
        {product.stock === 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
            Out of Stock
          </div>
        )}
        
        {/* Featured Badge */}
        {product.isFeatured && (
          <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
            ⭐ Featured
          </div>
        )}
        
        {/* Quick View Badge - Appears on hover */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/95 backdrop-blur-sm text-primary px-4 py-2 rounded-lg text-sm font-semibold text-center shadow-lg">
            View Details →
          </div>
        </div>
      </div>
      
      {/* Product Info - Better spacing */}
      <div className="p-6 md:p-8">
        <h3 className="font-semibold text-xl md:text-2xl mb-3 md:mb-4 text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
          {product.name}
        </h3>
        <p className="text-gray-600 text-base md:text-lg mb-4 md:mb-6 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        
        {/* Price & Category - Better hierarchy */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-primary font-bold text-xl md:text-2xl">
              ${product.price.toFixed(2)}
            </p>
            {product.mrp && product.mrp > product.price && (
              <p className="text-gray-400 text-sm line-through">
                ${product.mrp.toFixed(2)}
              </p>
            )}
          </div>
          <span className="text-xs md:text-sm text-gray-600 capitalize bg-gray-50 px-3 py-1.5 rounded-full font-medium">
            {product.category}
          </span>
        </div>
      </div>
    </Link>
  )
}

// Reusable Product Section Component
function ProductSection({ 
  title, 
  description, 
  products, 
  bgColor = 'bg-gray-50' 
}: { 
  title: string
  description: string
  products: any[]
  bgColor?: string
}) {
  if (products.length === 0) return null

  return (
    <section className={`py-10 md:py-14 px-4 sm:px-6 lg:px-8 ${bgColor}`}>
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id?.toString()} product={product} />
          ))}
        </div>

        <div className="text-center mt-8 md:mt-10">
          <Link
            href="/products"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow-md shadow-primary/20 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98]"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  )
}

export default async function Home() {
  const [featuredProducts, trendingProducts, bestSellers, homepageContent] = await Promise.all([
    getFeaturedProducts(8),
    getTrendingProducts(8),
    getBestSellers(8),
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
      {/* Hero Section - Premium & Culturally Resonant */}
      <section className="relative bg-gradient-to-br from-primary/10 via-sage/20 to-beige/10 py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative elements - subtle traditional touch */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-primary rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-sage rounded-full"></div>
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-3 md:space-y-4 text-center md:text-left">
              {/* Badge - Trust Signal */}
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-primary/20 text-primary px-4 py-2 rounded-full text-sm font-semibold shadow-sm mb-3">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 .723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Authentic Indian Craftsmanship</span>
              </div>

              {/* Main Heading - Emotional & Clear */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-4 md:mb-6">
                <span className="text-gray-900">Bringing</span>{' '}
                <span className="text-primary">Divine Blessings</span>{' '}
                <span className="text-gray-900">to Your Home</span>
              </h1>

              {/* Subheading - Value Proposition */}
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto md:mx-0 mb-4 md:mb-6">
                Premium puja items & handcrafted brass products, <span className="font-semibold text-primary">authentically crafted in India</span>, delivered to your doorstep in the USA.
              </p>

              {/* Trust Signals - Quick Stats */}
              <div className="flex flex-wrap gap-3 md:gap-4 justify-center md:justify-start pt-1">
                <div className="flex items-center space-x-1.5 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Free Shipping</span>
                </div>
                <div className="flex items-center space-x-1.5 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-medium">Quality Guaranteed</span>
                </div>
                <div className="flex items-center space-x-1.5 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Fast Delivery</span>
                </div>
              </div>

              {/* CTA Buttons - Premium Styling */}
              <div className="flex flex-wrap gap-3 pt-3 justify-center md:justify-start">
                <Link
                  href={hero.buttonLink || '/products'}
                  className="group inline-flex items-center justify-center space-x-2 bg-primary text-white px-6 py-3 md:px-8 md:py-3.5 rounded-lg font-semibold text-base shadow-lg shadow-primary/30 hover:bg-primary-600 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 active:scale-[0.98] transform"
                >
                  <span>Shop Premium Collection</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center space-x-2 border-2 border-primary bg-transparent text-primary px-6 py-3 md:px-8 md:py-3.5 rounded-lg font-semibold text-base hover:bg-primary hover:text-white hover:shadow-md transition-all duration-300 active:scale-[0.98] transform"
                >
                  <span>Explore Collection</span>
                </Link>
              </div>
            </div>

            {/* Right Side - Hero Image - Improved */}
            <div className="relative mt-6 md:mt-0">
              <div className="relative w-full h-[350px] md:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://media.istockphoto.com/id/2168877442/photo/close-up-of-a-beautifully-decorated-pooja-thali-for-festival-celebration-to-worship.webp?a=1&b=1&s=612x612&w=0&k=20&c=2y8jgnE3dy7ZFapRX9Wni8D2EVsLDBhj35EePVskvMA="
                  alt="Premium Puja Items & Brass Products"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5"></div>
              </div>
              
              {/* Floating Badge - Premium Quality - Remove emoji */}
              <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-white/95 backdrop-blur-sm border border-primary/20 text-primary px-4 py-2 rounded-full shadow-xl z-10">
                <div className="flex items-center space-x-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.75c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs md:text-sm font-semibold">Premium Quality</span>
                </div>
              </div>

              {/* Customer Count Badge - Improved */}
              {hero.stats && hero.stats[0] && (
                <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/95 backdrop-blur-sm border border-sage/20 text-primary px-4 py-2.5 rounded-full shadow-xl z-10">
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-primary">{hero.stats[0].number}+</div>
                    <div className="text-xs font-medium text-gray-700">{hero.stats[0].label}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals Section - After Hero */}
      <section className="py-10 md:py-12 bg-white border-y border-gray-100">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {/* Trust Item 1 - Free Shipping */}
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-1 md:mb-2">Free Shipping</h3>
              <p className="text-xs md:text-sm text-gray-600">On orders over $50</p>
            </div>
            
            {/* Trust Item 2 - Quality Guaranteed */}
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-1 md:mb-2">Quality Guaranteed</h3>
              <p className="text-xs md:text-sm text-gray-600">100% authentic products</p>
            </div>
            
            {/* Trust Item 3 - Fast Delivery */}
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-1 md:mb-2">Fast Delivery</h3>
              <p className="text-xs md:text-sm text-gray-600">5-7 business days</p>
            </div>
            
            {/* Trust Item 4 - Secure Payment */}
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-1 md:mb-2">Secure Payment</h3>
              <p className="text-xs md:text-sm text-gray-600">SSL encrypted</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-8 md:py-10 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature, index) => {
              // Map feature icons to SVG icons
              const getIcon = () => {
                if (feature.icon?.includes('🚚') || feature.title?.toLowerCase().includes('delivered')) {
                  return (
                    <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                }
                if (feature.icon?.includes('📦') || feature.title?.toLowerCase().includes('delivery')) {
                  return (
                    <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )
                }
                if (feature.icon?.includes('🙏') || feature.title?.toLowerCase().includes('handcrafted') || feature.title?.toLowerCase().includes('devotion')) {
                  return (
                    <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )
                }
                // Default icon
                return (
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )
              }

              return (
                <div key={feature.id || index} className="group bg-white rounded-2xl p-6 md:p-8 lg:p-10 shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary/10 to-sage/10 rounded-2xl flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                    {getIcon()}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">{feature.title}</h3>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <ProductSection
        title="Featured Products"
        description="Handpicked favorites from our collection"
        products={featuredProducts}
        bgColor="bg-gray-50"
      />

      {/* Trending Products */}
      <ProductSection
        title="Trending Now"
        description="Popular items customers are loving right now"
        products={trendingProducts}
        bgColor="bg-white"
      />

      {/* Best Sellers */}
      <ProductSection
        title="Best Sellers"
        description="Our most popular products of all time"
        products={bestSellers}
        bgColor="bg-gray-50"
      />

    </div>
  )
}
