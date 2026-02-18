import React, { useEffect, useRef, useCallback } from 'react';
import { X, Calendar, Clock, User, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import Logo from './Logo';
import SelectionGrid from './SelectionGrid';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { useBooking } from '../hooks/useBooking';
import CustomDatePicker from './ui/CustomDatePicker';
import CustomTimePicker from './ui/CustomTimePicker';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialServiceId?: string;
    onAuthRequired: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, initialServiceId, onAuthRequired }) => {
    const { user, profile } = useAuth();

    // Use the custom hook for logic
    const {
        formData, setFormData,
        loading, success, errorMessage, validationErrors,
        services, therapists,
        hpField, setHpField,
        submitBooking,
        setValidationErrors
    } = useBooking(initialServiceId, isOpen);

    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    // Focus trap and Escape key
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
            return;
        }

        if (e.key === 'Tab' && modalRef.current) {
            const focusable = modalRef.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last?.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first?.focus();
                }
            }
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement as HTMLElement;
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleKeyDown);

            gsap.fromTo('.modal-content',
                { opacity: 0, scale: 0.9, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' }
            );

            // Focus close button after animation
            setTimeout(() => closeButtonRef.current?.focus(), 550);
        } else {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleKeyDown);
            // Restore focus
            previousFocusRef.current?.focus();
        }

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleKeyDown]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitBooking();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] overflow-y-auto flex items-start md:items-center justify-center p-3 md:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-charcoal/80 backdrop-blur-md"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Content */}
            <div
                ref={modalRef}
                className="modal-content relative bg-cream w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-gold/20 my-auto"
            >
                <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    className="absolute top-4 right-4 md:top-6 md:right-6 text-charcoal/50 hover:text-gold transition-colors z-50 p-1"
                    aria-label="Close booking modal"
                >
                    <X size={24} aria-hidden="true" />
                </button>

                {success ? (
                    <div className="p-8 md:p-12 text-center py-16 md:py-24">
                        <div className="flex justify-center mb-6">
                            <CheckCircle2 className="text-gold" size={64} aria-hidden="true" />
                        </div>
                        <h2 id="booking-modal-title" className="font-serif text-3xl md:text-4xl text-charcoal mb-4">Reservation Confirmed</h2>
                        <p className="text-charcoal-light mb-8 max-w-sm mx-auto text-sm md:text-base">
                            Your ritual at Golden Tower Spa has been requested. {user?.email ? `We will send a confirmation to ${user.email} shortly.` : 'Please arrive on your selected time.'}
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-gold text-white px-8 md:px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-gold-dark transition-all"
                        >
                            Return to Journey
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row h-full">
                        {/* Left Decor */}
                        <div className="hidden md:flex w-full md:w-[300px] bg-gold/5 p-10 border-r border-gold/10 flex-col justify-center">
                            <Logo className="h-10 w-10 mb-6" color="#997B3D" />
                            <h3 id="booking-modal-title" className="font-serif text-3xl text-charcoal mb-4 italic leading-tight">Tailor Your Ritual</h3>
                            <p className="text-charcoal-light leading-relaxed">
                                Experience the heritage of Hilot and the luxury of gold in a sanctuary designed for your rebirth.
                            </p>
                            <div className="mt-8 pt-8 border-t border-gold/10">
                                <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-gold">Premium Care</p>
                                <p className="text-xs text-charcoal/50 mt-1">Our specialists are dedicated to your holistic wellness.</p>
                            </div>
                        </div>

                        {/* Mobile Title (visible on small screens only) */}
                        <h3 id="booking-modal-title-mobile" className="md:hidden font-serif text-2xl text-charcoal px-6 pt-6 pb-2 italic">Tailor Your Ritual</h3>

                        {/* Form Side */}
                        <div className="flex-1 p-6 md:p-12">
                            {/* Inline error message */}
                            {errorMessage && (
                                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 text-sm" role="alert">
                                    {errorMessage}
                                </div>
                            )}

                            <form onSubmit={onSubmit} className="space-y-5 md:space-y-6" noValidate>
                                {/* Honeypot Field (Hidden) */}
                                <div style={{ opacity: 0, position: 'absolute', top: 0, left: 0, height: 0, width: 0, overflow: 'hidden', zIndex: -1 }}>
                                    <label htmlFor="hp-field">Website</label>
                                    <input
                                        id="hp-field"
                                        type="text"
                                        name="website_url"
                                        tabIndex={-1}
                                        autoComplete="off"
                                        value={hpField}
                                        onChange={(e) => setHpField(e.target.value)}
                                    />
                                </div>
                                {user ? (
                                    <div className="bg-gold/10 border border-gold/20 rounded-lg p-4 mb-4 md:mb-6">
                                        <div className="flex items-center gap-2 text-charcoal">
                                            <User size={16} className="text-gold" aria-hidden="true" />
                                            <div>
                                                <p className="text-xs uppercase tracking-widest font-bold text-gold">Booking for</p>
                                                <p className="text-sm font-medium">{profile?.full_name || user?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 mb-4 md:mb-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="guest-name" className="text-xs uppercase tracking-widest font-bold text-gold mb-2 block">Your Name</label>
                                                <input
                                                    id="guest-name"
                                                    required
                                                    type="text"
                                                    placeholder="Enter your name"
                                                    className={`w-full bg-white border p-3.5 md:p-4 rounded-xl focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors ${validationErrors.guest_name ? 'border-rose-400' : 'border-gold/20'}`}
                                                    value={formData.guest_name}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, guest_name: e.target.value });
                                                        if (validationErrors.guest_name) setValidationErrors(prev => ({ ...prev, guest_name: '' }));
                                                    }}
                                                    aria-invalid={!!validationErrors.guest_name}
                                                    aria-describedby={validationErrors.guest_name ? 'guest-name-error' : undefined}
                                                />
                                                {validationErrors.guest_name && (
                                                    <p id="guest-name-error" className="text-rose-500 text-xs mt-1.5" role="alert">{validationErrors.guest_name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label htmlFor="guest-phone" className="text-xs uppercase tracking-widest font-bold text-gold mb-2 block">Phone Number</label>
                                                <input
                                                    id="guest-phone"
                                                    required
                                                    type="tel"
                                                    placeholder="For confirmation"
                                                    className={`w-full bg-white border p-3.5 md:p-4 rounded-xl focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors ${validationErrors.guest_phone ? 'border-rose-400' : 'border-gold/20'}`}
                                                    value={formData.guest_phone}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, guest_phone: e.target.value });
                                                        if (validationErrors.guest_phone) setValidationErrors(prev => ({ ...prev, guest_phone: '' }));
                                                    }}
                                                    aria-invalid={!!validationErrors.guest_phone}
                                                    aria-describedby={validationErrors.guest_phone ? 'guest-phone-error' : undefined}
                                                />
                                                {validationErrors.guest_phone && (
                                                    <p id="guest-phone-error" className="text-rose-500 text-xs mt-1.5" role="alert">{validationErrors.guest_phone}</p>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-charcoal/40 italic">We use your device ID to track your booking. No account required.</p>
                                    </div>
                                )}

                                <div className="space-y-5 md:space-y-6">
                                    <div>
                                        <SelectionGrid
                                            label="Select Treatment"
                                            options={services.map(s => ({
                                                id: s.id,
                                                title: s.title,
                                                subtitle: s.category === 'signature' ? 'Signature Treatment' : undefined,
                                                description: s.description,
                                                imageUrl: s.image_url,
                                                price: s.price,
                                                duration: s.duration
                                            }))}
                                            selectedId={formData.service_id}
                                            onSelect={(id) => {
                                                setFormData({ ...formData, service_id: id });
                                                if (validationErrors.service) setValidationErrors(prev => ({ ...prev, service: '' }));
                                            }}
                                        />
                                        {validationErrors.service && (
                                            <p className="text-rose-500 text-xs mt-1.5" role="alert">{validationErrors.service}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="therapist-select" className="text-xs uppercase tracking-widest font-bold text-gold mb-2 block">Specialist Preference</label>
                                            <div className="relative">
                                                <select
                                                    id="therapist-select"
                                                    className="w-full bg-white border border-gold/20 p-3.5 md:p-4 rounded-xl focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 appearance-none transition-colors"
                                                    value={formData.therapist_id}
                                                    onChange={(e) => setFormData({ ...formData, therapist_id: e.target.value })}
                                                >
                                                    <option value="">Any Specialist (Fastest Availability)</option>
                                                    {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gold" aria-hidden="true">
                                                    <ArrowLeft className="-rotate-90" size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <CustomDatePicker
                                        label="Date"
                                        value={formData.date}
                                        minDate={new Date().toISOString().split('T')[0]}
                                        onChange={(date) => {
                                            setFormData({ ...formData, date });
                                            if (validationErrors.date) setValidationErrors(prev => ({ ...prev, date: '' }));
                                        }}
                                    />
                                    <CustomTimePicker
                                        label="Time"
                                        value={formData.time}
                                        onChange={(time) => {
                                            setFormData({ ...formData, time });
                                            if (validationErrors.time) setValidationErrors(prev => ({ ...prev, time: '' }));
                                        }}
                                    />
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full bg-charcoal text-white py-4 md:py-5 rounded-lg flex items-center justify-center font-bold uppercase tracking-widest hover:bg-gold transition-all disabled:opacity-50 group"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" aria-label="Submitting booking" />
                                    ) : (
                                        <>Request Booking <Logo className="h-4 w-4 ml-2 mt-1 group-hover:animate-pulse" color="white" /></>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingModal;
