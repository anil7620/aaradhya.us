import { getProducts } from '@/lib/products'
import Link from 'next/link'
import ProductImage from '@/app/components/ProductImage'
import clientPromise from '@/lib/mongodb'
import { Category } from '@/lib/models/Category'

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
  searchParams: { category?: string; search?: string }
}) {
  const [products, categories] = await Promise.all([
    getProducts({ category: searchParams.category, search: searchParams.search }),
    getCategories(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-sage/10 to-sage/20 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          {searchParams.search ? (
            <>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                Search Results
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                Found {products.length} {products.length === 1 ? 'product' : 'products'} for "{searchParams.search}"
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">All Products</h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">Discover our handcrafted collection</p>
            </>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Category Filter */}
        {!searchParams.search && (
          <div className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-8">
            <Link
              href="/products"
              className={`px-4 py-1.5 rounded-full font-medium transition text-sm ${
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
                className={`px-4 py-1.5 rounded-full font-medium transition text-sm ${
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
          <div className="mb-6 md:mb-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors text-sm md:text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to all products</span>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <Link
              key={product._id?.toString()}
              href={`/products/${product._id}`}
              className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Image Container - Better aspect ratio and hover effect */}
              <div className="relative h-64 md:h-72 bg-gradient-to-br from-sage/10 to-sage/20 overflow-hidden">
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
                
                {/* Inactive Badge */}
                {!product.isActive && (
                  <div className="absolute top-3 left-3 bg-gray-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                    Inactive
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
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 md:py-16">
            {searchParams.search ? (
              <>
                <svg className="w-16 h-16 md:w-20 md:h-20 text-gray-300 mx-auto mb-6 md:mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-500 text-lg md:text-xl mb-2 md:mb-3">No products found</p>
                <p className="text-gray-400 text-sm md:text-base mb-6 md:mb-8">
                  No products match "{searchParams.search}"
                </p>
                <Link
                  href="/products"
                  className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow-md shadow-primary/20 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
                >
                  View All Products
                </Link>
              </>
            ) : (
              <>
                <div className="text-6xl mb-6 md:mb-8">🛍️</div>
                <p className="text-gray-500 text-lg md:text-xl mb-4 md:mb-6">No products available yet.</p>
                <p className="text-gray-400 text-sm md:text-base">Check back soon for new products!</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

