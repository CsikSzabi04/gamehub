import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook: runs fetchFn only when the returned ref's element enters the viewport.
 * Data is fetched at most once per component lifetime.
 * @param {Function} fetchFn - async function that returns the fetched data
 * @param {number}   rootMargin - px before viewport where fetch is triggered (default 400)
 */
export function useFetchOnVisible(fetchFn, rootMargin = 400) {
    const ref = useRef(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetched = useRef(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !fetched.current) {
                    fetched.current = true;
                    observer.disconnect();

                    setLoading(true);
                    Promise.resolve(fetchFn())
                        .then(result => {
                            setData(result);
                            setLoading(false);
                        })
                        .catch(err => {
                            console.error('useFetchOnVisible error:', err);
                            setError(err);
                            setLoading(false);
                        });
                }
            },
            { rootMargin: `${rootMargin}px`, threshold: 0 }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return { ref, data, loading, error };
}
