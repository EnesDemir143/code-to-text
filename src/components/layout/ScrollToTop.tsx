'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button when page is scrolled down 300px
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-3 rounded-full 
                       bg-indigo-600 hover:bg-indigo-500 
                       text-white shadow-lg shadow-indigo-500/30
                       transition-all duration-300 hover:scale-110 active:scale-95
                       animate-in fade-in slide-in-from-bottom-4"
            aria-label="Scroll to top"
        >
            <ArrowUp className="h-5 w-5" />
        </button>
    );
}
