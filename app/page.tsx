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
              Experience the best in handcrafted shopping
            </p>
          </div>
          {features.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 items-stretch">
              {features.slice(0, 6).map((feature, index) => {
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
                  return (
                    <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )
                }

                return (
                  <div key={feature.id || index} className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:shadow-sm transition-shadow h-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 flex-shrink-0 text-xl">
                      {getIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 mb-1 leading-tight">{feature.title}</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
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
