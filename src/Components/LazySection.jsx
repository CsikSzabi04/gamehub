import React, { useState, useEffect, useRef } from 'react';

export default function LazySection({ children, placeholder = true }) {
    const [isInView, setIsInView] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '300px',
                threshold: 0.01
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    if (!isInView && placeholder) {
        return (
            <div ref={sectionRef} className="min-h-[200px] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div ref={sectionRef}>
            {children}
        </div>
    );
}
