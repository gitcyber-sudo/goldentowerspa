import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import Logo from './Logo';
import SelectionGrid from './SelectionGrid';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialServiceId?: string;
    onAuthRequired: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, initialServiceId, onAuthRequired }) => {
    const { user, profile } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [services, setServices] = useState<any[]>([]);
    const [therapists, setTherapists] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        service_id: initialServiceId || '',
        therapist_id: '',
        date: '',
        time: ''
    });

    useEffect(() => {
        if (isOpen && initialServiceId) {
            setFormData(prev => ({ ...prev, service_id: initialServiceId }));
        }
    }, [isOpen, initialServiceId]);

    useEffect(() => {
        if (isOpen) {
            // Check if user is authenticated
            if (!user) {
                onAuthRequired();
                onClose();
                return;
            }

            document.body.style.overflow = 'hidden';
            fetchData();
            gsap.fromTo('.modal-content',
                { opacity: 0, scale: 0.9, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' }
            );
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen, user]);

    const fetchData = async () => {
        const { data: s } = await supabase.from('services').select('*');
        const { data: t } = await supabase.from('therapists').select('*').eq('active', true).order('name');

        if (s) {
            const sortedServices = [...s].sort((a, b) => {
                const aTitle = a.title.toUpperCase();
                const bTitle = b.title.toUpperCase();

                const getPriority = (item: any, title: string) => {
                    if (item.category === 'signature' || title.includes('SIGNATURE')) return 1;
                    if (title.includes('PACKAGE')) return 4;
                    if (item.category === 'express' || title.includes('EXPRESS')) return 3;
                    return 2; // Regular treatments
                };

                const pA = getPriority(a, aTitle);
                const pB = getPriority(b, bTitle);

                if (pA !== pB) return pA - pB;
                if (pA === 4) return aTitle.localeCompare(bTitle, undefined, { numeric: true });
                return aTitle.localeCompare(bTitle);
            });
            setServices(sortedServices);
        }
        if (t) setTherapists(t);
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert('Please sign in to book');
            onAuthRequired();
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.from('bookings').insert([{
                user_id: user.id,
                user_email: user.email,
                service_id: formData.service_id,
                therapist_id: formData.therapist_id || null,
                booking_date: formData.date,
                booking_time: formData.time,
                status: 'pending'
            }]);

            if (error) throw error;
            setSuccess(true);
        } catch (err) {
            console.error('Booking failed:', err);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto flex items-start md:items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-charcoal/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Content */}
            <div className="modal-content relative bg-cream w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-gold/20 my-auto">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-charcoal/50 hover:text-gold transition-colors z-50"
                >
                    <X size={24} />
                </button>

                {success ? (
                    <div className="p-12 text-center py-24">
                        <div className="flex justify-center mb-6">
                            <CheckCircle2 className="text-gold" size={80} />
                        </div>
                        <h2 className="font-serif text-4xl text-charcoal mb-4">Reservation Confirmed</h2>
                        <p className="text-charcoal-light mb-8 max-w-sm mx-auto">
                            Your ritual at Golden Tower Spa has been requested. We will send a confirmation to {user?.email} shortly.
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-gold text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-gold-dark transition-all"
                        >
                            Return to Journey
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row h-full">
                        {/* Left Decor */}
                        <div className="hidden md:flex w-full md:w-[300px] bg-gold/5 p-10 border-r border-gold/10 flex-col justify-center">
                            <Logo className="h-10 w-10 mb-6" color="#997B3D" />
                            <h3 className="font-serif text-3xl text-charcoal mb-4 italic leading-tight">Tailor Your Ritual</h3>
                            <p className="text-charcoal-light leading-relaxed">
                                Experience the heritage of Hilot and the luxury of gold in a sanctuary designed for your rebirth.
                            </p>
                            <div className="mt-8 pt-8 border-t border-gold/10">
                                <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-gold">Premium Care</p>
                                <p className="text-xs text-charcoal/50 mt-1">Our specialists are dedicated to your holistic wellness.</p>
                            </div>
                        </div>

                        {/* Form Side */}
                        <div className="flex-1 p-8 md:p-12">
                            <form onSubmit={handleBooking} className="space-y-6">
                                <div className="bg-gold/10 border border-gold/20 rounded-lg p-4 mb-6">
                                    <div className="flex items-center gap-2 text-charcoal">
                                        <User size={16} className="text-gold" />
                                        <div>
                                            <p className="text-xs uppercase tracking-widest font-bold text-gold">Booking for</p>
                                            <p className="text-sm font-medium">{profile?.full_name || user?.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
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
                                        onSelect={(id) => setFormData({ ...formData, service_id: id })}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs uppercase tracking-widest font-bold text-gold mb-2 block">Specialist Preference</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full bg-white border border-gold/20 p-4 rounded-xl focus:outline-none focus:border-gold appearance-none custom-select"
                                                    value={formData.therapist_id}
                                                    onChange={(e) => setFormData({ ...formData, therapist_id: e.target.value })}
                                                >
                                                    <option value="">Any Specialist (Fastest Availability)</option>
                                                    {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gold">
                                                    <ArrowLeft className="-rotate-90" size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest font-bold text-gold mb-2 flex items-center">
                                            <Calendar size={14} className="mr-2" /> Date
                                        </label>
                                        <input
                                            required
                                            type="date"
                                            className="w-full bg-white border border-gold/20 p-4 rounded-lg focus:outline-none focus:border-gold"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest font-bold text-gold mb-2 flex items-center">
                                            <Clock size={14} className="mr-2" /> Time
                                        </label>
                                        <input
                                            required
                                            type="time"
                                            className="w-full bg-white border border-gold/20 p-4 rounded-lg focus:outline-none focus:border-gold"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full bg-charcoal text-white py-5 rounded-lg flex items-center justify-center font-bold uppercase tracking-widest hover:bg-gold transition-all disabled:opacity-50 group"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" />
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
