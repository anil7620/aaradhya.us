import { getProductById } from '@/lib/products'
import { notFound } from 'next/navigation'
import ProductImage from '@/app/components/ProductImage'
import Link from 'next/link'
import { ChevronRight, Share2, Check, Truck, ShoppingCart, Shield, Award, Package } from 'lucide-react'
import DeliveryCheck from './DeliveryCheck'
import ProductDetails from './ProductDetails'
import CustomerRatings from './CustomerRatings'
import ProductSelection from './ProductSelection'

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await getProductById(params.id)

  if (!product || !product.isActive) {
    notFound()
  }

  const images = product.images || []
  const mainImage = images[0] || null
  const discountPercent = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link 
              href={`/products?category=${product.category}`} 
              className="hover:text-primary transition-colors capitalize"
            >
              {product.category}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            {mainImage ? (
              <div className="space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
                  <ProductImage
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(0, 4).map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white cursor-pointer hover:border-primary transition-colors"
                      >
                        <ProductImage
                          src={image}
                          alt={`${product.name} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Pricing */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ${product.mrp.toFixed(2)}
                    </span>
                    <span className="text-sm font-semibold text-white bg-secondary px-3 py-1.5 rounded-full shadow-sm">
                      {discountPercent}% Off
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">Incl. of all taxes</p>
            </div>

            {/* Color and Fragrance Selection with Action Buttons */}
            <ProductSelection
              productId={params.id}
              stock={product.stock}
              price={product.price}
              colors={product.colors}
              fragrances={product.fragrances}
            />

            {/* Delivery Details */}
            <DeliveryCheck productPrice={product.price} />

            {/* Feature Icons */}
            <div className="mt-8 grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-5 h-5 text-primary" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Award className="w-5 h-5 text-primary" />
                <span>Assured Quality</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">IN</span>
                </div>
                <span>Made In India</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="w-5 h-5 text-primary" />
                <span>Timely Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <ProductDetails product={product} />

        {/* Customer Ratings Section */}
        <CustomerRatings productId={params.id} />
      </div>
    </div>
  )
}
