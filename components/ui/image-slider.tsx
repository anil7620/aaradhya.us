import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ImageSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  images: string[];
  interval?: number;
}

const ImageSlider = React.forwardRef<HTMLDivElement, ImageSliderProps>(
  ({ images, interval = 5000, className, ...props }, ref) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    // Safety check: if no images, return null or placeholder
    if (!images || images.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            "relative w-full h-full overflow-hidden bg-gray-200 flex items-center justify-center",
            className
          )}
          {...props}
        >
          <div className="text-gray-400 text-sm">No images available</div>
        </div>
      );
    }

    // Ensure currentIndex is within bounds
    const safeIndex = Math.min(currentIndex, images.length - 1);

    // Effect to handle the interval-based image transition
    React.useEffect(() => {
      if (images.length === 0) return;
      
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, interval);

      // Cleanup the interval on component unmount
      return () => clearInterval(timer);
    }, [images.length, interval]);

    // Reset currentIndex if it's out of bounds
    React.useEffect(() => {
      if (currentIndex >= images.length) {
        setCurrentIndex(0);
      }
    }, [images.length, currentIndex]);

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full h-full overflow-hidden bg-background",
          className
        )}
        {...props}
      >
        <AnimatePresence initial={false}>
          {images[safeIndex] && (
            <motion.img
              key={safeIndex}
              src={images[safeIndex]}
              alt={`Slide ${safeIndex + 1}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full h-full object-cover"
              onError={(e) => {
                console.error('Image failed to load:', images[safeIndex]);
                // You could set a fallback image here
              }}
            />
          )}
        </AnimatePresence>
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors duration-300",
                  safeIndex === index ? "bg-white" : "bg-white/50 hover:bg-white"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

ImageSlider.displayName = "ImageSlider";

export { ImageSlider };

