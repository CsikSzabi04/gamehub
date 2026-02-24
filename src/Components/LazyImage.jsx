import React, { useState, useEffect, useRef } from 'react';

export default function LazyImage({ src, alt, className, placeholderClassName }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '200px',
                threshold: 0.01
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={imgRef} className={`relative ${placeholderClassName || ''}`} style={{ minHeight: '100px' }}>
            {!isLoaded && !hasError && isInView && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
            
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <span className="text-gray-500 text-xs">No image</span>
                </div>
            )}
            
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasError(true)}
                />
            )}
        </div>
    );
}
