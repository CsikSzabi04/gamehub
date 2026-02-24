import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function ImageLoader({ src, alt, className }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
        <div className={`relative ${className}`}>
            {/* Loading spinner */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full"
                    />
                </div>
            )}
            
            {/* Error state */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <span className="text-gray-500 text-sm">Failed to load</span>
                </div>
            )}
            
            <img
                src={src}
                alt={alt}
                loading="lazy"
                className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
            />
        </div>
    );
}
