import React from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Scrolls to top on route change — but respects hash anchors
const ScrollToTop: React.FC = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (!hash) {
            // Normal route change — go to top
            window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        } else {
            // Hash anchor (e.g. /#about) — scroll to that element after short delay
            const timer = setTimeout(() => {
                const id = hash.replace('#', '');
                const el = document.getElementById(id);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 120); // small delay lets the page render first
            return () => clearTimeout(timer);
        }
    }, [pathname, hash]);

    return null;
};

export default ScrollToTop;
