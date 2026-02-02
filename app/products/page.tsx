import { getProducts, getFeaturedProducts, getTrendingProducts, getBestSellers, getNewArrivals } from '@/lib/products'
import Link from 'next/link'
import ProductCard from '@/app/components/ProductCard'
import clientPromise from '@/lib/mongodb'
import { Category } from '@/lib/models/Category'
import { serializeProducts } from '@/lib/utils'

async function getCategories() {
  const client = await clientPromise
  const db = client.db()
  const categories = await db
    .collection<Category>('categories')
    .find({})
    .sort({ createdAt: -1 })
    .toArray()
  return categories
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string; type?: string }
}) {
  let products
  const categories = await getCategories()

  // Handle type-based filtering
  // Note: When type is specified (featured, trending, etc.), search is ignored
  // When type is not specified, search parameter is used for filtering
  if (searchParams.type) {
    switch (searchParams.type) {
      case 'featured':
        products = await getFeaturedProducts(100)
        break
      case 'trending':
        products = await getTrendingProducts(100)
        break
      case 'best-sellers':
        products = await getBestSellers(100)
        break
      case 'new-arrivals':
        products = await getNewArrivals(100)
        break
      default:
        // Default case: use search and category filters
        products = await getProducts({ category: searchParams.category, search: searchParams.search })
    }
  } else {
    // No type specified: use search and category filters
    products = await getProducts({ category: searchParams.category, search: searchParams.search })
  }

  // Serialize products for client components
  const serializedProducts = serializeProducts(products)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-sage/10 to-sage/20 py-3 md:py-4 lg:py-6 px-3 sm:px-4 lg:px-6">
        <div className="container mx-auto max-w-7xl">
          {searchParams.search ? (
            <>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2 leading-tight">
                Search Results
              </h1>
              <p className="text-xs md:text-sm text-gray-600">
                Found {products.length} {products.length === 1 ? 'product' : 'products'} for "{searchParams.search}"
              </p>
            </>
          ) : searchParams.type ? (
            <>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2 leading-tight">
                {searchParams.type === 'featured' && 'Featured Products'}
                {searchParams.type === 'trending' && 'Trending Now'}
                {searchParams.type === 'best-sellers' && 'Top Selling'}
                {searchParams.type === 'new-arrivals' && 'New Arrivals'}
              </h1>
              <p className="text-xs md:text-sm text-gray-600">
                {products.length} {products.length === 1 ? 'product' : 'products'} available
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2 leading-tight">All Products</h1>
              <p className="text-xs md:text-sm text-gray-600">Discover our handcrafted collection</p>
            </>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-3 md:py-4 lg:py-6">
        {/* Category Filter */}
        {!searchParams.search && !searchParams.type && (
          <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
            <Link
              href="/products"
              className={`px-3 py-1.5 rounded-full font-medium transition text-xs ${
                !searchParams.category
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-sage/10'
              }`}
            >
              All
            </Link>
            {categories.map((category) => (
              <Link
                key={category._id?.toString()}
                href={`/products?category=${category.slug}`}
                className={`px-3 py-1.5 rounded-full font-medium transition text-xs ${
                  searchParams.category === category.slug
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-sage/10'
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
        
        {/* Search Results Header */}
        {searchParams.search && (
          <div className="mb-3 md:mb-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-500 transition-colors text-xs md:text-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to all products</span>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          {serializedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-8 md:py-12">
            {searchParams.search ? (
              <>
                <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4 md:mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-500 text-base md:text-lg mb-2">No products found</p>
                <p className="text-gray-400 text-sm mb-4 md:mb-6">
                  No products match "{searchParams.search}"
                </p>
                <Link
                  href="/products"
                  className="inline-block bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md shadow-primary/20 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
                >
                  View All Products
                </Link>
              </>
            ) : (
              <>
                <div className="text-4xl md:text-5xl mb-4 md:mb-6">🛍️</div>
                <p className="text-gray-500 text-base md:text-lg mb-2 md:mb-3">No products available yet.</p>
                <p className="text-gray-400 text-sm">Check back soon for new products!</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

