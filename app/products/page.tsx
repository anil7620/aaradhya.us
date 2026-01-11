import { getProducts } from '@/lib/products'
import Link from 'next/link'
import Image from 'next/image'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const products = await getProducts({ category: searchParams.category })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-sage/10 to-sage/20 py-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">All Products</h1>
          <p className="text-lg text-gray-600">Discover our handcrafted collection</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/products"
            className={`px-6 py-2 rounded-full font-medium transition ${
              !searchParams.category
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-sage/10'
            }`}
          >
            All
          </Link>
          <Link
            href="/products?category=candles"
            className={`px-6 py-2 rounded-full font-medium transition ${
              searchParams.category === 'candles'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-sage/10'
            }`}
          >
            Candles
          </Link>
          <Link
            href="/products?category=crochets"
            className={`px-6 py-2 rounded-full font-medium transition ${
              searchParams.category === 'crochets'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-sage/10'
            }`}
          >
            Crochets
          </Link>
          <Link
            href="/products?category=other"
            className={`px-6 py-2 rounded-full font-medium transition ${
              searchParams.category === 'other'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-sage/10'
            }`}
          >
            Other
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product._id?.toString()}
              href={`/products/${product._id}`}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all group"
            >
              <div className="h-64 bg-gradient-to-br from-sage/10 to-sage/20 relative overflow-hidden">
                {product.images && product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-24 h-24 bg-sage/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-4xl">
                        {product.category === 'candles' ? '🕯️' : product.category === 'crochets' ? '🧶' : '🎁'}
                      </span>
                    </div>
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Out of Stock
                  </div>
                )}
                {!product.isActive && (
                  <div className="absolute top-2 left-2 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Inactive
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
            <div className="text-6xl mb-4">🛍️</div>
            <p className="text-gray-500 text-lg mb-4">No products available yet.</p>
            <p className="text-gray-400 text-sm">Check back soon for new products!</p>
          </div>
        )}
      </div>
    </div>
  )
}

