import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import gsap from 'gsap';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialServiceId?: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, initialServiceId }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [services, setServices] = useState<any[]>([]);
    const [therapists, setTherapists] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        email: '',
        service_id: initialServiceId || '',
        therapist_id: '',
        date: '',
        time: ''
    });

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            fetchData();
            gsap.fromTo('.modal-content',
                { opacity: 0, scale: 0.9, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' }
            );
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const fetchData = async () => {
        const { data: s } = await supabase.from('services').select('*');
        const { data: t } = await supabase.from('therapists').select('*');
        if (s) setServices(s);
        if (t) setTherapists(t);
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.from('bookings').insert([{
                user_email: formData.email,
                service_id: formData.service_id,
                therapist_id: formData.therapist_id,
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-charcoal/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Content */}
            <div className="modal-content relative bg-cream w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-gold/20">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-charcoal/50 hover:text-gold transition-colors z-10"
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
                            Your ritual at Golden Tower Spa has been requested. We will send a confirmation to {formData.email} shortly.
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
                        <div className="hidden md:block w-1/3 bg-gold/10 p-8 border-r border-gold/10">
                            <Sparkles className="text-gold mb-6" size={32} />
                            <h3 className="font-serif text-2xl text-charcoal mb-4 italic">Tailor Your Ritual</h3>
                            <p className="text-sm text-charcoal-light leading-relaxed">
                                Experience the heritage of Hilot and the luxury of gold in a sanctuary designed for your rebirth.
                            </p>
                        </div>

                        {/* Form Side */}
                        <div className="flex-1 p-8 md:p-12 max-h-[90vh] overflow-y-auto">
                            <form onSubmit={handleBooking} className="space-y-6">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest font-bold text-gold mb-2 flex items-center">
                                        <User size={14} className="mr-2" /> Your Email
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="name@example.com"
                                        className="w-full bg-white border border-gold/20 p-4 rounded-lg focus:outline-none focus:border-gold transition-colors"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest font-bold text-gold mb-2">Service</label>
                                        <select
                                            required
                                            className="w-full bg-white border border-gold/20 p-4 rounded-lg focus:outline-none focus:border-gold"
                                            value={formData.service_id}
                                            onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                                        >
                                            <option value="">Select Ritual</option>
                                            {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest font-bold text-gold mb-2">Therapist</label>
                                        <select
                                            required
                                            className="w-full bg-white border border-gold/20 p-4 rounded-lg focus:outline-none focus:border-gold"
                                            value={formData.therapist_id}
                                            onChange={(e) => setFormData({ ...formData, therapist_id: e.target.value })}
                                        >
                                            <option value="">Any Specialist</option>
                                            {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
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
                                        <>Request Booking <Sparkles className="ml-2 group-hover:animate-pulse" size={18} /></>
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
