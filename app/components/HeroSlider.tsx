'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Check, Shield, Truck } from 'lucide-react'

const heroSlides = [
  {
    title: 'Premium Puja Items',
    subtitle: 'Handcrafted with devotion, delivered with care',
    accent: 'text-teal-500',
    bgGradient: 'from-sky-50 via-cyan-50 to-blue-50',
    image: 'https://images.unsplash.com/photo-1606293926249-ed22e446d476?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fHB1amElMjBpdGVtcyUyMGZvciUyMGhpbmR1fGVufDB8MHwwfHx8Mg%3D%3D',
  },
  {
    title: 'Authentic Indian Craftsmanship',
    subtitle: 'Traditional designs, modern convenience',
    accent: 'text-teal-500',
    bgGradient: 'from-sky-50 via-cyan-50 to-blue-50',
    image: 'https://images.unsplash.com/photo-1590052210004-8935aa660ff2?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzB8fHB1amElMjBpdGVtcyUyMGZvciUyMGhpbmR1fGVufDB8MHwwfHx8Mg%3D%3D',
  },
  {
    title: 'Spiritual Wellness',
    subtitle: 'Bringing divine blessings to your home',
    accent: 'text-teal-500',
    bgGradient: 'from-sky-50 via-cyan-50 to-blue-50',
    image: 'https://media.istockphoto.com/id/2168877442/photo/close-up-of-a-beautifully-decorated-pooja-thali-for-festival-celebration-to-worship.webp?a=1&b=1&s=612x612&w=0&k=20&c=2y8jgnE3dy7ZFapRX9Wni8D2EVsLDBhj35EePVskvMA=',
  },
  {
    title: 'Sacred Traditions',
    subtitle: 'Preserving heritage, one product at a time',
    accent: 'text-teal-500',
    bgGradient: 'from-sky-50 via-cyan-50 to-blue-50',
    image: 'https://media.istockphoto.com/id/1346254741/photo/hands-of-girl-holding-ghanti-bell-clay-diya-deep-dia-lamp-illuminated-in-pooja-thali-for.webp?a=1&b=1&s=612x612&w=0&k=20&c=3_z07FxprOjRdCb6TCtW2XFtgLyp8vbFvGf72kI6gsI=',
  },
]

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const current = heroSlides[currentSlide]

  return (
    <section className={`relative bg-gradient-to-br ${current.bgGradient} py-6 md:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-sky-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-teal-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
          {/* Left Side - Text Content */}
          <div className="text-center md:text-left space-y-4 md:space-y-5">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold shadow-sm">
              <Check className="w-3 h-3 md:w-4 md:h-4 text-teal-500" />
              <span>Trusted by 5000+ Customers</span>
            </div>

            {/* Sliding Title */}
            <div className="relative h-20 md:h-24 lg:h-28 overflow-hidden">
              {heroSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 flex items-center transition-all duration-700 ease-in-out ${
                    index === currentSlide
                      ? 'opacity-100 translate-y-0'
                      : index < currentSlide
                      ? 'opacity-0 -translate-y-full'
                      : 'opacity-0 translate-y-full'
                  }`}
                >
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                    {slide.title.split(' ').map((word, i) => (
                      <span key={i} className={i === 0 ? slide.accent : 'text-gray-900'}>
                        {word}{' '}
                      </span>
                    ))}
                  </h1>
                </div>
              ))}
            </div>

            {/* Sliding Subtitle */}
            <div className="relative h-10 md:h-12 overflow-hidden">
              {heroSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 flex items-center transition-all duration-700 ease-in-out delay-150 ${
                    index === currentSlide
                      ? 'opacity-100 translate-y-0'
                      : index < currentSlide
                      ? 'opacity-0 -translate-y-full'
                      : 'opacity-0 translate-y-full'
                  }`}
                >
                  <p className="text-base md:text-lg text-gray-700">
                    {slide.subtitle}
                  </p>
                </div>
              ))}
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap gap-2 md:gap-3 justify-center md:justify-start pt-2">
              <div className="flex items-center space-x-1.5 text-xs md:text-sm text-gray-700 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Truck className="w-4 h-4 text-teal-500" />
                <span className="font-medium">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs md:text-sm text-gray-700 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Shield className="w-4 h-4 text-teal-500" />
                <span className="font-medium">Quality Guaranteed</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs md:text-sm text-gray-700 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Check className="w-4 h-4 text-teal-500" />
                <span className="font-medium">Fast Delivery</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-3">
              <Link
                href="/products"
                className="group inline-flex items-center justify-center space-x-2 bg-primary text-white px-6 py-2.5 md:px-8 md:py-3 rounded-lg font-semibold text-sm md:text-base shadow-lg shadow-primary/30 hover:bg-primary-600 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 active:scale-[0.98] transform"
              >
                <span>Shop Now</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center space-x-2 border-2 border-primary bg-transparent text-primary px-6 py-2.5 md:px-8 md:py-3 rounded-lg font-semibold text-sm md:text-base hover:bg-primary hover:text-white hover:shadow-md transition-all duration-300 active:scale-[0.98] transform"
              >
                <span>Explore Collection</span>
              </Link>
            </div>

            {/* Slide Indicators */}
            <div className="flex items-center justify-center md:justify-start gap-2 pt-4">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Side - Image Slider */}
          <div className="relative h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-xl">
            {heroSlides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentSlide
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-105'
                }`}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
