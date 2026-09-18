import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname, state } = useLocation();

    useEffect(() => {
        // If the route change includes a specific 'scrollTo' state (used by Footer Quick Links),
        // we do NOT want to force a scroll to the top. The receiving page will handle the scroll.
        if (state && (state as any).scrollTo) {
            return;
        }

        window.scrollTo(0, 0);
    }, [pathname, state]);

    return null;
};

export default ScrollToTop;
