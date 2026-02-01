import { getProductById } from '@/lib/products'
import { notFound } from 'next/navigation'
import ProductImage from '@/app/components/ProductImage'
import Link from 'next/link'
import { ChevronRight, Check, Truck, Shield, Award, Package } from 'lucide-react'
import DeliveryCheck from './DeliveryCheck'
import ProductDetails from './ProductDetails'
import CustomerRatings from './CustomerRatings'
import ProductSelection from './ProductSelection'
import ShareButton from './ShareButton'

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
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 md:py-5 lg:py-6">
        {/* Breadcrumbs with better spacing */}
        <nav className="mb-3 md:mb-4 lg:mb-5 text-xs md:text-sm text-gray-600">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10 mb-6 md:mb-8">
          {/* Product Images - Enhanced Gallery */}
          <div>
            {mainImage ? (
              <div className="space-y-2 md:space-y-3">
                {/* Main Image - Better styling */}
                <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white shadow-md p-1 group">
                  <ProductImage
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  {/* Discount Badge on Image */}
                  {discountPercent > 0 && (
                    <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-secondary text-white px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-xs font-bold shadow-lg z-10">
                      {discountPercent}% OFF
                    </div>
                  )}
                </div>
                {/* Thumbnail Gallery - Enhanced */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
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
          <div className="bg-white rounded-lg p-4 md:p-5 lg:p-6 shadow-md border border-gray-100">
            {/* Header with Share Button */}
            <div className="flex items-start justify-between mb-3 md:mb-4 gap-3">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight flex-1">
                {product.name}
              </h1>
              <ShareButton 
                productName={product.name}
                productId={params.id}
              />
            </div>

            {/* Pricing - Enhanced Hierarchy */}
            <div className="mb-4 md:mb-5 pb-3 md:pb-4 border-b border-gray-200">
              <div className="flex flex-wrap items-baseline gap-2 md:gap-3 mb-2">
                <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary">
                  ${product.price.toFixed(2)}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <>
                    <span className="text-lg md:text-xl lg:text-2xl text-gray-400 line-through">
                      ${product.mrp.toFixed(2)}
                    </span>
                    <span className="text-xs md:text-sm font-bold text-white bg-secondary px-2.5 py-1 md:px-3 md:py-1.5 rounded-full shadow-md">
                      Save {discountPercent}%
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="font-medium">All taxes included</span>
              </div>
            </div>

            {/* Color and Fragrance Selection with Action Buttons */}
            <div className="mb-4 md:mb-5">
              <ProductSelection
                productId={params.id}
                stock={product.stock}
                price={product.price}
                colors={product.colors}
                fragrances={product.fragrances}
              />
            </div>

            {/* Delivery Details */}
            <div className="mb-4 md:mb-5">
              <DeliveryCheck productPrice={product.price} />
            </div>

            {/* Trust Signals - Enhanced & More Visible */}
            <div className="bg-gradient-to-br from-primary/5 via-sage/5 to-beige/5 rounded-lg p-3 md:p-4 border border-primary/10">
              <h3 className="text-sm md:text-base font-bold text-gray-900 mb-2 md:mb-3">Why Choose Us?</h3>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 md:w-9 md:h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-xs md:text-sm mb-0.5 leading-tight">Secure Payments</p>
                    <p className="text-xs text-gray-600 leading-snug">SSL encrypted checkout</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 md:w-9 md:h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-xs md:text-sm mb-0.5 leading-tight">Assured Quality</p>
                    <p className="text-xs text-gray-600 leading-snug">100% authentic products</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 md:w-9 md:h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary">IN</span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-xs md:text-sm mb-0.5 leading-tight">Handcrafted in India</p>
                    <p className="text-xs text-gray-600 leading-snug">Traditional craftsmanship</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 md:w-9 md:h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-xs md:text-sm mb-0.5 leading-tight">Timely Delivery</p>
                    <p className="text-xs text-gray-600 leading-snug">Fast & reliable shipping</p>
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
