import React, { useState, useEffect, useRef, Suspense } from 'react';

const Spinner = () => (
    <div className="min-h-[200px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
);

/**
 * Renders children only when the section gets near the viewport.
 * Children may be React.lazy components: their chunk starts downloading at that point.
 * rootMargin: how many pixels before the viewport to start loading (default 1000px).
 */
export default function LazySection({ children, placeholder = true, rootMargin = 1000 }) {
    const [isInView, setIsInView] = useState(() => typeof IntersectionObserver === 'undefined');
    const sectionRef = useRef(null);

    useEffect(() => {
        const node = sectionRef.current;
        if (!node || isInView) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: `${rootMargin}px`,
                threshold: 0,
            }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [rootMargin, isInView]);

    if (!isInView) {
        return <div ref={sectionRef}>{placeholder ? <Spinner /> : <div className="min-h-[1px]" />}</div>;
    }

    return (
        <div ref={sectionRef}>
            <Suspense fallback={placeholder ? <Spinner /> : null}>
                {children}
            </Suspense>
        </div>
    );
}
