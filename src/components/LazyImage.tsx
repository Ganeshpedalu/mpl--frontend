import { useState, useRef, useEffect, memo } from 'react';
import { Loader } from 'lucide-react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

const LazyImage = memo(({ src, alt, className = '', placeholder }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' } // Load images earlier (200px before they come into view)
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <Loader className="w-8 h-8 animate-spin text-[#E6B31E]" />
        </div>
      )}
      {hasError ? (
        <div className="flex items-center justify-center bg-gray-100 rounded p-8">
          <p className="text-gray-500 text-sm">Failed to load image</p>
        </div>
      ) : (
        isInView && (
          <img
            src={src}
            alt={alt}
            className={`${className} transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
          />
        )
      )}
      {placeholder && !isInView && (
        <div className="absolute inset-0 bg-gray-100 rounded flex items-center justify-center">
          <p className="text-gray-400 text-xs">{placeholder}</p>
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;

