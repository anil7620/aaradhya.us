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
  searchParams: { category?: string }
}) {
  const [products, categories] = await Promise.all([
    getProducts({ category: searchParams.category }),
    getCategories(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-sage/10 to-sage/20 py-6 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-1">All Products</h1>
          <p className="text-base text-gray-600">Discover our handcrafted collection</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link
              key={product._id?.toString()}
              href={`/products/${product._id}`}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all group"
            >
              <div className="h-64 bg-gradient-to-br from-sage/10 to-sage/20 relative overflow-hidden">
                <ProductImage
                  src={product.images?.[0]}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
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
              <div className="p-4">
                <h3 className="font-semibold text-base mb-1.5 text-gray-900 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-primary font-bold text-xl">
                    ${product.price.toFixed(2)}
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

