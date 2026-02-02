import Link from 'next/link'
import ProductCard from './components/ProductCard'
import HeroSlider from './components/HeroSlider'
import { getFeaturedProducts, getTrendingProducts, getBestSellers, getNewArrivals, getRecommendedProducts } from '@/lib/products'
import { getHomepageContent } from '@/lib/homepage'
import { serializeProducts } from '@/lib/utils'
import { Truck, Shield, RotateCcw, Star, ArrowRight } from 'lucide-react'

// Reusable Product Section Component
function ProductSection({ 
  title, 
  label,
  products, 
  bgColor = 'bg-gray-50',
  viewAllLink = '/products'
}: { 
  title: string
  label?: string
  products: any[]
  bgColor?: string
  viewAllLink?: string
}) {
  if (products.length === 0) return null

  return (
    <section className={`py-6 lg:py-8 px-4 lg:px-6 ${bgColor}`}>
      <div className="container mx-auto">
        <div className="mb-6 lg:mb-14">
          {label && (
            <p className="text-xs lg:text-sm font-medium uppercase tracking-wider text-teal-500 mb-2 lg:mb-3 text-center lg:text-left">
              {label}
            </p>
          )}
          <div className="flex flex-row items-center justify-between gap-4">
            <h2 className="font-serif font-bold text-gray-900 text-xl lg:text-[30px]">
              {title}
            </h2>
            <Link href={viewAllLink} className="text-primary hover:text-primary-600 text-xs lg:text-sm font-medium whitespace-nowrap flex-shrink-0">
              View All
            </Link>
          </div>
        </div>

        {/* Mobile: Horizontal Scroll */}
        <div className="lg:hidden overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-3" style={{ width: 'max-content' }}>
            {products.slice(0, 6).map((product) => (
              <div key={product._id} className="flex-shrink-0 w-[240px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
        {/* Desktop: Grid - 6 columns (1 row for 6 products) */}
        <div className="hidden lg:grid gap-4 grid-cols-6">
          {products.slice(0, 6).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default async function Home() {
  const [featuredProducts, trendingProducts, bestSellers, newArrivals, recommendedProducts, homepageContent] = await Promise.all([
    getFeaturedProducts(8),
    getTrendingProducts(8),
    getBestSellers(8),
    getNewArrivals(8),
    getRecommendedProducts(8),
    getHomepageContent(),
  ])

  // Serialize products for client components
  const serializedFeatured = serializeProducts(featuredProducts)
  const serializedTrending = serializeProducts(trendingProducts)
  const serializedBestSellers = serializeProducts(bestSellers)
  const serializedNewArrivals = serializeProducts(newArrivals)
  const serializedRecommended = serializeProducts(recommendedProducts)

  const features = homepageContent?.features || []
  const announcementBar = homepageContent?.announcementBar

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Text Slider */}
      <HeroSlider />

      {/* New Arrivals Section */}
      <ProductSection
        label="Just Added"
        title="New Arrivals"
        products={serializedNewArrivals}
        bgColor="bg-background"
        viewAllLink="/products?sort=newest"
      />

      {/* Featured Products Section */}
      <ProductSection
        label="Handpicked for You"
        title="Featured Products"
        products={serializedFeatured}
        bgColor="bg-background"
        viewAllLink="/products?type=featured"
      />

      {/* Recommended Products Section */}
      <ProductSection
        label="Handpicked for You"
        title="Recommended Products"
        products={serializedRecommended}
        bgColor="bg-gray-50"
        viewAllLink="/products?type=featured"
      />

      {/* Trending Products Section */}
      <ProductSection
        label="Hot Right Now"
        title="Trending Now"
        products={serializedTrending}
        bgColor="bg-white"
        viewAllLink="/products?type=trending"
      />

      {/* Top Selling Products Section */}
      <ProductSection
        label="Customer Favorites"
        title="Top Selling"
        products={serializedBestSellers}
        bgColor="bg-gray-50"
        viewAllLink="/products?type=best-sellers"
      />

      {/* Feature Cards / Trust Signals */}
      <section className="bg-background border-b border-border py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="mb-8 text-center">
            <h2 className="font-serif text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl">
              Why Choose Us
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-gray-600">
              Trusted by thousands of Indian families across America for authentic puja essentials
            </p>
          </div>
          {features.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 items-stretch">
              {features.map((feature, index) => {
                // Map feature icons to SVG icons
                const getIcon = () => {
                  if (feature.icon?.includes('🕉️') || feature.title?.toLowerCase().includes('artisan') || feature.title?.toLowerCase().includes('direct')) {
                    return (
                      <div className="text-3xl">🕉️</div>
                    )
                  }
                  if (feature.icon?.includes('🙏') || feature.title?.toLowerCase().includes('temple') || feature.title?.toLowerCase().includes('quality')) {
                    return (
                      <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    )
                  }
                  if (feature.icon?.includes('🚚') || feature.title?.toLowerCase().includes('shipping') || feature.title?.toLowerCase().includes('delivery')) {
                    return (
                      <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                    )
                  }
                  if (feature.icon?.includes('🛡️') || feature.title?.toLowerCase().includes('guarantee') || feature.title?.toLowerCase().includes('money-back')) {
                    return (
                      <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    )
                  }
                  if (feature.icon?.includes('💬') || feature.title?.toLowerCase().includes('support') || feature.title?.toLowerCase().includes('bilingual')) {
                    return (
                      <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    )
                  }
                  if (feature.icon?.includes('👨‍👩‍👧‍👦') || feature.title?.toLowerCase().includes('family') || feature.title?.toLowerCase().includes('owned')) {
                    return (
                      <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )
                  }
                  return (
                    <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )
                }

                return (
                  <div key={feature.id || index} className="flex flex-col p-6 rounded-xl bg-white border border-gray-200 hover:shadow-lg hover:border-teal-200 transition-all duration-300 h-full">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 mb-4 flex-shrink-0 text-xl shadow-sm">
                      {getIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 mb-2 leading-tight">{feature.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 text-center md:text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 flex-shrink-0">
                  <Truck className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Free Shipping</p>
                  <p className="text-xs text-gray-600">On orders above $50</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-center md:text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 flex-shrink-0">
                  <RotateCcw className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Easy Returns</p>
                  <p className="text-xs text-gray-600">7-day return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-center md:text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 flex-shrink-0">
                  <Shield className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Secure Payment</p>
                  <p className="text-xs text-gray-600">100% secure checkout</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-center md:text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 flex-shrink-0">
                  <Star className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Authentic Products</p>
                  <p className="text-xs text-gray-600">Handcrafted & verified</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
