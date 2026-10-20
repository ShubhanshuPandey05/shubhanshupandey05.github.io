import { useEffect, useRef, useState } from 'react';

// True once the element has scrolled into view (and stays true).
export const useInView = (margin = '-10% 0px') => {
    const ref = useRef(null);
    const [seen, setSeen] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el || seen) return undefined;
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setSeen(true);
                    io.disconnect();
                }
            },
            { rootMargin: margin }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [margin, seen]);
    return [ref, seen];
};
