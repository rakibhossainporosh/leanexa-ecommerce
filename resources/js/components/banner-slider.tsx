import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from '@inertiajs/react';

type Slide = {
    id: number;
    image: string;
};

const DEFAULT_BANNERS: Slide[] = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1200&auto=format&fit=crop',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=1200&auto=format&fit=crop',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop',
    },
];

type BannerRecord = {
    id: number;
    title: string;
    subtitle: string | null;
    image: string | null;
    button_text: string | null;
    link: string | null;
};

export default function BannerSlider({ banners }: { banners?: BannerRecord[] }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const mapped: Slide[] = (banners ?? [])
        .filter((b) => b.image)
        .map((b) => ({
            id: b.id,
            image: b.image as string,
        }));
    const BANNERS: Slide[] = mapped.length > 0 ? mapped : DEFAULT_BANNERS;

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);

    return (
        <div className="relative w-full aspect-video sm:aspect-[21/9] md:aspect-auto md:h-[500px] lg:h-[550px] overflow-hidden group rounded-2xl shadow-xl border border-border/50">
            {/* Slides Container */}
            <div 
                className="flex transition-transform duration-700 ease-in-out h-full w-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {BANNERS.map((banner, index) => (
                    <div key={banner.id} className="relative min-w-full h-full flex-shrink-0">
                        {/* Background Image */}
                        <img 
                            src={banner.image} 
                            alt={`Banner ${index + 1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Subtle overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button 
                onClick={prevSlide}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer border border-white/30 hover:scale-110 shadow-lg"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
                onClick={nextSlide}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer border border-white/30 hover:scale-110 shadow-lg"
            >
                <ChevronRight className="h-6 w-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
                {BANNERS.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`transition-all duration-300 rounded-full cursor-pointer shadow-sm ${
                            idx === currentSlide 
                                ? 'w-10 h-2.5 bg-white' 
                                : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
