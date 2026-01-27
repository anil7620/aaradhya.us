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
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumbs with better spacing */}
        <nav className="mb-8 md:mb-12 text-sm md:text-base text-gray-600">
          <div className="flex items-center space-x-2">
            <Link href="/" className="hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link 
              href={`/products?category=${product.category}`} 
              className="hover:text-primary transition-colors capitalize font-medium"
            >
              {product.category}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-semibold">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 mb-12 md:mb-16">
          {/* Product Images - Enhanced Gallery */}
          <div>
            {mainImage ? (
              <div className="space-y-4 md:space-y-6">
                {/* Main Image - Better styling */}
                <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 bg-white shadow-lg p-2 group">
                  <ProductImage
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  {/* Discount Badge on Image */}
                  {discountPercent > 0 && (
                    <div className="absolute top-4 left-4 bg-secondary text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-10">
                      {discountPercent}% OFF
                    </div>
                  )}
                  {/* Stock Badge */}
                  {product.stock === 0 && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg z-10">
                      Out of Stock
                    </div>
                  )}
                </div>
                {/* Thumbnail Gallery - Enhanced */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3 md:gap-4">
                    {images.slice(0, 4).map((image: string, index: number) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-white cursor-pointer hover:border-primary hover:shadow-md transition-all duration-200 group"
                      >
                        <ProductImage
                          src={image}
                          alt={`${product.name} - Image ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-gray-200 shadow-lg">
                <div className="text-center">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <span className="text-gray-500 font-medium">No image available</span>
                </div>
              </div>
            )}
          </div>

          {/* Product Information - Enhanced Layout */}
          <div className="bg-white rounded-xl p-6 md:p-8 lg:p-10 shadow-lg border border-gray-100">
            {/* Header with Share Button */}
            <div className="flex items-start justify-between mb-6 md:mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight pr-4 flex-1">
                {product.name}
              </h1>
              <button 
              className="p-2.5 md:p-3 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 border border-gray-200 hover:border-primary"
              aria-label="Share product"
            >
                <Share2 className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
              </button>
            </div>

            {/* Pricing - Enhanced Hierarchy */}
            <div className="mb-8 md:mb-10 pb-6 md:pb-8 border-b border-gray-200">
              <div className="flex flex-wrap items-baseline gap-3 md:gap-4 mb-3 md:mb-4">
                <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary">
                  ${product.price.toFixed(2)}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <>
                    <span className="text-2xl md:text-3xl text-gray-400 line-through">
                      ${product.mrp.toFixed(2)}
                    </span>
                    <span className="text-sm md:text-base font-bold text-white bg-secondary px-4 py-2 rounded-full shadow-md">
                      Save {discountPercent}%
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base text-gray-600">
                <Check className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                <span className="font-medium">All taxes included</span>
              </div>
            </div>

            {/* Stock Status - Prominent */}
            {product.stock > 0 && (
              <div className="mb-6 md:mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">
                    {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left in stock`}
                  </span>
                </div>
              </div>
            )}

            {/* Color and Fragrance Selection with Action Buttons */}
            <div className="mb-8 md:mb-10">
              <ProductSelection
                productId={params.id}
                stock={product.stock}
                price={product.price}
                colors={product.colors}
                fragrances={product.fragrances}
              />
            </div>

            {/* Delivery Details */}
            <div className="mb-8 md:mb-10">
              <DeliveryCheck productPrice={product.price} />
            </div>

            {/* Trust Signals - Enhanced & More Visible */}
            <div className="bg-gradient-to-br from-primary/5 via-sage/5 to-beige/5 rounded-xl p-6 md:p-8 border border-primary/10 mb-8 md:mb-10">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Why Choose Us?</h3>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm md:text-base mb-1">Secure Payments</p>
                    <p className="text-xs md:text-sm text-gray-600">SSL encrypted checkout</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm md:text-base mb-1">Assured Quality</p>
                    <p className="text-xs md:text-sm text-gray-600">100% authentic products</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-primary flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">IN</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm md:text-base mb-1">Handcrafted in India</p>
                    <p className="text-xs md:text-sm text-gray-600">Traditional craftsmanship</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm md:text-base mb-1">Timely Delivery</p>
                    <p className="text-xs md:text-sm text-gray-600">Fast & reliable shipping</p>
                  </div>
                </div>
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
