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
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 md:py-6 lg:py-8 xl:py-12">
        {/* Breadcrumbs with better spacing */}
        <nav className="mb-4 md:mb-6 lg:mb-8 xl:mb-12 text-xs md:text-sm lg:text-base text-gray-600">
          <div className="flex items-center space-x-1 md:space-x-2 flex-wrap">
            <Link href="/" className="hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <Link 
              href={`/products?category=${product.category}`} 
              className="hover:text-primary transition-colors capitalize font-medium truncate max-w-[120px] md:max-w-none"
            >
              {product.category}
            </Link>
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span className="text-gray-900 font-semibold truncate">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 mb-8 md:mb-12 lg:mb-16">
          {/* Product Images - Enhanced Gallery */}
          <div>
            {mainImage ? (
              <div className="space-y-3 md:space-y-4 lg:space-y-6">
                {/* Main Image - Better styling */}
                <div className="relative aspect-square rounded-lg md:rounded-xl overflow-hidden border border-gray-200 md:border-2 bg-white shadow-md md:shadow-lg p-1 md:p-2 group">
                  <ProductImage
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  {/* Discount Badge on Image */}
                  {discountPercent > 0 && (
                    <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-secondary text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold shadow-lg z-10">
                      {discountPercent}% OFF
                    </div>
                  )}
                </div>
                {/* Thumbnail Gallery - Enhanced */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 md:gap-3 lg:gap-4">
                    {images.slice(0, 4).map((image: string, index: number) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-md md:rounded-lg overflow-hidden border border-gray-200 md:border-2 bg-white cursor-pointer hover:border-primary hover:shadow-md transition-all duration-200 group"
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
          <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 lg:p-8 xl:p-10 shadow-md md:shadow-lg border border-gray-100">
            {/* Header with Share Button */}
            <div className="flex items-start justify-between mb-4 md:mb-6 lg:mb-8 gap-3">
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight flex-1">
                {product.name}
              </h1>
              <button 
                className="p-2 md:p-2.5 lg:p-3 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 border border-gray-200 hover:border-primary"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-600" />
              </button>
            </div>

            {/* Pricing - Enhanced Hierarchy */}
            <div className="mb-6 md:mb-8 lg:mb-10 pb-4 md:pb-6 lg:pb-8 border-b border-gray-200">
              <div className="flex flex-wrap items-baseline gap-2 md:gap-3 lg:gap-4 mb-2 md:mb-3 lg:mb-4">
                <span className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary">
                  ${product.price.toFixed(2)}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <>
                    <span className="text-xl md:text-2xl lg:text-3xl text-gray-400 line-through">
                      ${product.mrp.toFixed(2)}
                    </span>
                    <span className="text-xs md:text-sm lg:text-base font-bold text-white bg-secondary px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-md">
                      Save {discountPercent}%
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm lg:text-base text-gray-600">
                <Check className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-green-600 flex-shrink-0" />
                <span className="font-medium">All taxes included</span>
              </div>
            </div>

            {/* Color and Fragrance Selection with Action Buttons */}
            <div className="mb-6 md:mb-8 lg:mb-10">
              <ProductSelection
                productId={params.id}
                stock={product.stock}
                price={product.price}
                colors={product.colors}
                fragrances={product.fragrances}
              />
            </div>

            {/* Delivery Details */}
            <div className="mb-6 md:mb-8 lg:mb-10">
              <DeliveryCheck productPrice={product.price} />
            </div>

            {/* Trust Signals - Enhanced & More Visible */}
            <div className="bg-gradient-to-br from-primary/5 via-sage/5 to-beige/5 rounded-lg md:rounded-xl p-4 md:p-6 lg:p-8 border border-primary/10">
              <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-3 md:mb-4 lg:mb-6">Why Choose Us?</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-6">
                <div className="flex items-start gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-xs md:text-sm lg:text-base mb-0.5 md:mb-1 leading-tight">Secure Payments</p>
                    <p className="text-xs md:text-sm text-gray-600 leading-snug">SSL encrypted checkout</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-xs md:text-sm lg:text-base mb-0.5 md:mb-1 leading-tight">Assured Quality</p>
                    <p className="text-xs md:text-sm text-gray-600 leading-snug">100% authentic products</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full border-2 border-primary flex items-center justify-center">
                      <span className="text-[10px] md:text-xs font-bold text-primary">IN</span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-xs md:text-sm lg:text-base mb-0.5 md:mb-1 leading-tight">Handcrafted in India</p>
                    <p className="text-xs md:text-sm text-gray-600 leading-snug">Traditional craftsmanship</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-xs md:text-sm lg:text-base mb-0.5 md:mb-1 leading-tight">Timely Delivery</p>
                    <p className="text-xs md:text-sm text-gray-600 leading-snug">Fast & reliable shipping</p>
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
