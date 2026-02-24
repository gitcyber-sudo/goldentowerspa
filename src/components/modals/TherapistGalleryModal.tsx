import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import gsap from 'gsap';
import { supabase } from '../../lib/supabase';
import type { GalleryPhoto } from '../../types';

interface TherapistGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    therapistId: string;
    therapistName: string;
    therapistSpecialty?: string;
}

const TherapistGalleryModal: React.FC<TherapistGalleryModalProps> = ({
    isOpen,
    onClose,
    therapistId,
    therapistName,
    therapistSpecialty
}) => {
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const fetchPhotos = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('therapist_gallery')
                .select('*')
                .eq('therapist_id', therapistId)
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: false });

            if (!error && data) setPhotos(data);
            setLoading(false);
        };
        fetchPhotos();
    }, [isOpen, therapistId]);

    // Stagger-in grid items
    useLayoutEffect(() => {
        if (loading || !gridRef.current || photos.length === 0) return;

        const items = gridRef.current.querySelectorAll('.gallery-item');
        const ctx = gsap.context(() => {
            gsap.fromTo(items,
                { opacity: 0, y: 40, scale: 0.92, filter: 'blur(6px)' },
                {
                    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
                    duration: 0.6, stagger: 0.08, ease: 'power3.out'
                }
            );
        });
        return () => ctx.revert();
    }, [loading, photos]);

    // Animate overlay entry
    useLayoutEffect(() => {
        if (!isOpen || !overlayRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(overlayRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.35, ease: 'power2.out' }
            );
        });
        return () => ctx.revert();
    }, [isOpen]);

    // Keyboard navigation for lightbox
    useEffect(() => {
        if (selectedIndex === null) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedIndex(null);
            if (e.key === 'ArrowRight') setSelectedIndex(prev => prev !== null ? Math.min(prev + 1, photos.length - 1) : 0);
            if (e.key === 'ArrowLeft') setSelectedIndex(prev => prev !== null ? Math.max(prev - 1, 0) : 0);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [selectedIndex, photos.length]);

    if (!isOpen) return null;

    return createPortal(
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[90] flex flex-col bg-charcoal/95 backdrop-blur-xl"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5">
                <div>
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] block mb-1">
                        {therapistSpecialty || 'Wellness Specialist'}
                    </span>
                    <h2 className="font-serif text-2xl md:text-3xl text-white italic">
                        {therapistName}
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
                    aria-label="Close gallery"
                >
                    <X size={20} />
                </button>
            </div>

            {/* ─── Content ─── */}
            <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-gold/20 border-t-gold" />
                    </div>
                ) : photos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <Camera className="text-gold/40" size={32} />
                        </div>
                        <h3 className="font-serif text-xl text-white/80 mb-2">Gallery Coming Soon</h3>
                        <p className="text-white/30 text-sm max-w-xs">
                            Photos for {therapistName} will be available shortly.
                        </p>
                    </div>
                ) : (
                    <div
                        ref={gridRef}
                        className="columns-2 md:columns-3 gap-3 md:gap-4 space-y-3 md:space-y-4"
                    >
                        {photos.map((photo, i) => (
                            <div
                                key={photo.id}
                                className="gallery-item break-inside-avoid cursor-pointer group relative rounded-2xl overflow-hidden"
                                onClick={() => setSelectedIndex(i)}
                            >
                                <img
                                    src={photo.image_url}
                                    alt={photo.caption || `${therapistName} photo ${i + 1}`}
                                    loading="lazy"
                                    className="w-full h-auto object-cover rounded-2xl transition-all duration-500 group-hover:scale-[1.03] group-hover:brightness-110"
                                />
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                                {photo.caption && (
                                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <p className="text-white text-xs font-light">{photo.caption}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ─── Lightbox ─── */}
            {selectedIndex !== null && photos[selectedIndex] && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
                    onClick={() => setSelectedIndex(null)}
                >
                    {/* Nav: Previous */}
                    {selectedIndex > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex - 1); }}
                            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-10"
                            aria-label="Previous photo"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    {/* Photo */}
                    <img
                        src={photos[selectedIndex].image_url}
                        alt={photos[selectedIndex].caption || ''}
                        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Nav: Next */}
                    {selectedIndex < photos.length - 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex + 1); }}
                            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-10"
                            aria-label="Next photo"
                        >
                            <ChevronRight size={24} />
                        </button>
                    )}

                    {/* Caption + Counter */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
                        {photos[selectedIndex].caption && (
                            <p className="text-white/80 text-sm mb-2 max-w-md">{photos[selectedIndex].caption}</p>
                        )}
                        <span className="text-white/30 text-xs font-bold uppercase tracking-widest">
                            {selectedIndex + 1} / {photos.length}
                        </span>
                    </div>

                    {/* Close */}
                    <button
                        onClick={() => setSelectedIndex(null)}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                        aria-label="Close lightbox"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>,
        document.body
    );
};

export default TherapistGalleryModal;
