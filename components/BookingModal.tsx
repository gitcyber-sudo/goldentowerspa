
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Sparkles, CheckCircle2, Loader2, ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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
        time: '',
        guest_name: '',
        guest_phone: ''
    });

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            fetchData();
            if (initialServiceId) {
                setFormData(prev => ({ ...prev, service_id: initialServiceId }));
                setStep(2); // Jump to step 2 if service already selected
            }
        } else {
            document.body.style.overflow = 'unset';
            setStep(1);
            setSuccess(false);
        }
    }, [isOpen]);

    const fetchData = async () => {
        const { data: s } = await supabase.from('services').select('*');
        const { data: t } = await supabase.from('therapists').select('*');
        if (s) setServices(s);
        if (t) setTherapists(t);
    };

    const handleBooking = async () => {
        setLoading(true);
        try {
            const visitorId = localStorage.getItem('gt_visitor_id');
            const { error } = await supabase.from('bookings').insert([{
                user_id: user?.id || null,
                user_email: user?.email || null,
                guest_name: formData.guest_name || null,
                guest_phone: formData.guest_phone || null,
                visitor_id: visitorId,
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

    const selectedService = services.find(s => s.id === formData.service_id);
    const selectedTherapist = therapists.find(t => t.id === formData.therapist_id);

    if (!isOpen) return null;

    const stepVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-charcoal/40 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-cream w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] md:rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/20 flex flex-col md:flex-row"
                    >
                        {/* Status Bar (Mobile) */}
                        <div className="md:hidden flex h-1 bg-gold/10">
                            <motion.div
                                className="h-full bg-gold"
                                animate={{ width: `${(step / 3) * 100}%` }}
                            />
                        </div>

                        {/* Sidebar Decor */}
                        <div className="hidden md:flex w-1/3 bg-charcoal p-12 flex-col justify-between relative overflow-hidden">
                            <div className="relative z-10">
                                <Sparkles className="text-gold mb-8" size={32} />
                                <h2 className="text-luxury text-4xl text-white italic mb-6">Your Sacred <span className="block not-italic font-bold text-gold">Ritual</span></h2>
                                <p className="text-white/60 text-sm leading-relaxed font-light">
                                    Every moment at Golden Tower is a step towards harmony. Tailor your journey to perfection.
                                </p>
                            </div>

                            <div className="relative z-10 space-y-6">
                                <div className={`flex items-center gap-4 transition-opacity ${step >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                                    <div className="w-8 h-8 rounded-full border border-gold flex items-center justify-center text-gold text-[10px] font-bold">01</div>
                                    <span className="text-[10px] uppercase tracking-widest text-white font-bold">Select Service</span>
                                </div>
                                <div className={`flex items-center gap-4 transition-opacity ${step >= 2 ? 'opacity-100' : 'opacity-30'}`}>
                                    <div className="w-8 h-8 rounded-full border border-gold flex items-center justify-center text-gold text-[10px] font-bold">02</div>
                                    <span className="text-[10px] uppercase tracking-widest text-white font-bold">Timing & Details</span>
                                </div>
                                <div className={`flex items-center gap-4 transition-opacity ${step >= 3 ? 'opacity-100' : 'opacity-30'}`}>
                                    <div className="w-8 h-8 rounded-full border border-gold flex items-center justify-center text-gold text-[10px] font-bold">03</div>
                                    <span className="text-[10px] uppercase tracking-widest text-white font-bold">Confirmation</span>
                                </div>
                            </div>

                            {/* Decorative Blur */}
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gold/10 rounded-full blur-[80px]" />
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 flex flex-col relative bg-cream">
                            {/* Header */}
                            <div className="p-8 border-b border-gold/5 flex justify-between items-center">
                                <div>
                                    <span className="text-gold text-[10px] uppercase tracking-[0.4em] font-bold mb-1 block">Step {step} of 3</span>
                                    <h3 className="text-luxury text-2xl text-charcoal">
                                        {step === 1 && "The Selection"}
                                        {step === 2 && "The Preparation"}
                                        {step === 3 && "The Final Ritual"}
                                    </h3>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gold/5 rounded-full transition-colors text-charcoal/40 hover:text-charcoal">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 md:p-12">
                                <AnimatePresence mode="wait">
                                    {success ? (
                                        <motion.div
                                            key="success"
                                            variants={stepVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="h-full flex flex-col items-center justify-center text-center py-12"
                                        >
                                            <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mb-8">
                                                <CheckCircle2 size={48} className="text-gold" />
                                            </div>
                                            <h2 className="text-luxury text-4xl text-charcoal mb-4 italic">Inner Radiance Awaits</h2>
                                            <p className="text-charcoal/60 max-w-sm mb-12 font-light italic">
                                                Your request has been received. We are preparing the sanctuary for your arrival.
                                                A confirmation has been sent to your device.
                                            </p>
                                            <button onClick={onClose} className="btn-gold px-12 py-5">
                                                Close & Return
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <>
                                            {step === 1 && (
                                                <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                                                    <p className="text-charcoal/40 text-[10px] uppercase tracking-widest mb-6">Choose your therapeutic path</p>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {services.map(s => (
                                                            <button
                                                                key={s.id}
                                                                onClick={() => { setFormData({ ...formData, service_id: s.id }); setStep(2); }}
                                                                className={`flex items-center justify-between p-6 rounded-2xl border transition-all text-left group ${formData.service_id === s.id ? 'bg-gold border-gold' : 'bg-white border-gold/10 hover:border-gold/30 shadow-sm'}`}
                                                            >
                                                                <div className="flex items-center gap-6">
                                                                    <div className={`w-12 h-12 rounded-xl overflow-hidden ${formData.service_id === s.id ? 'opacity-80' : ''}`}>
                                                                        <img src={s.image_url} className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className={`text-luxury text-lg ${formData.service_id === s.id ? 'text-white' : 'text-charcoal'}`}>{s.title}</h4>
                                                                        <p className={`text-[10px] uppercase tracking-widest ${formData.service_id === s.id ? 'text-white/70' : 'text-charcoal/40'}`}>{s.duration}</p>
                                                                    </div>
                                                                </div>
                                                                <ChevronRight size={18} className={formData.service_id === s.id ? 'text-white' : 'text-gold'} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {step === 2 && (
                                                <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                                                    {!user && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            <div className="space-y-4">
                                                                <label className="text-[10px] uppercase tracking-widest font-black text-gold">Name of the Soul</label>
                                                                <input
                                                                    type="text"
                                                                    required
                                                                    placeholder="Enter your name"
                                                                    className="w-full bg-white border border-gold/10 p-5 rounded-2xl outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm"
                                                                    value={formData.guest_name}
                                                                    onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="space-y-4">
                                                                <label className="text-[10px] uppercase tracking-widest font-black text-gold">Phone Number</label>
                                                                <input
                                                                    type="tel"
                                                                    required
                                                                    placeholder="For confirmation"
                                                                    className="w-full bg-white border border-gold/10 p-5 rounded-2xl outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm"
                                                                    value={formData.guest_phone}
                                                                    onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-4">
                                                            <label className="text-[10px] uppercase tracking-widest font-black text-gold">The Specialist</label>
                                                            <select
                                                                className="w-full bg-white border border-gold/10 p-5 rounded-2xl outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm appearance-none"
                                                                value={formData.therapist_id}
                                                                onChange={(e) => setFormData({ ...formData, therapist_id: e.target.value })}
                                                            >
                                                                <option value="">Any Specialist</option>
                                                                {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <label className="text-[10px] uppercase tracking-widest font-black text-gold">The Date</label>
                                                            <input
                                                                type="date"
                                                                required
                                                                className="w-full bg-white border border-gold/10 p-5 rounded-2xl outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm"
                                                                value={formData.date}
                                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="space-y-4">
                                                            <label className="text-[10px] uppercase tracking-widest font-black text-gold">The Hour</label>
                                                            <input
                                                                type="time"
                                                                required
                                                                className="w-full bg-white border border-gold/10 p-5 rounded-2xl outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-sm"
                                                                value={formData.time}
                                                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="p-6 bg-gold/5 rounded-[2rem] border border-gold/10 flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center">
                                                                <Tag size={16} className="text-gold" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] uppercase font-bold text-gold">Ritual Value</p>
                                                                <p className="text-xl text-charcoal italic font-serif">P{selectedService?.price || 0}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setStep(3)}
                                                            disabled={!formData.date || !formData.time || (!user && (!formData.guest_name || !formData.guest_phone))}
                                                            className="btn-gold py-3 px-8 text-[10px]"
                                                        >
                                                            Review Details
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {step === 3 && (
                                                <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                                                    <div className="bg-white p-8 rounded-[2.5rem] border border-gold/10 shadow-sm space-y-6">
                                                        <div className="flex justify-between items-center pb-6 border-b border-gold/5">
                                                            <span className="text-[10px] uppercase tracking-widest text-gold font-black">Ritual Summary</span>
                                                            <Star size={16} className="text-gold" />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-y-8">
                                                            <div>
                                                                <p className="text-[9px] uppercase tracking-widest text-charcoal/40 mb-1">Ritual</p>
                                                                <p className="text-luxury text-xl text-charcoal italic">{selectedService?.title}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] uppercase tracking-widest text-charcoal/40 mb-1">Specialist</p>
                                                                <p className="text-luxury text-xl text-charcoal italic">{selectedTherapist?.name || "Any Available"}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] uppercase tracking-widest text-charcoal/40 mb-1">Time & Date</p>
                                                                <p className="text-luxury text-xl text-charcoal italic">{formData.date} at {formData.time}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] uppercase tracking-widest text-charcoal/40 mb-1">Total Exchange</p>
                                                                <p className="text-luxury text-2xl text-gold font-bold">P{selectedService?.price}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={handleBooking}
                                                        disabled={loading}
                                                        className="w-full btn-gold py-6 text-sm flex items-center justify-center gap-3 disabled:opacity-50"
                                                    >
                                                        {loading ? <Loader2 className="animate-spin" /> : <>Request Experience <ArrowRight size={16} /></>}
                                                    </button>
                                                </motion.div>
                                            )}
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Footer / Navigation */}
                            {!success && (
                                <div className="p-8 border-t border-gold/5 flex justify-between items-center">
                                    {step > 1 ? (
                                        <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-charcoal/40 hover:text-gold transition-colors">
                                            <ArrowLeft size={14} /> Back
                                        </button>
                                    ) : <div />}

                                    <div className="text-[9px] uppercase tracking-[0.4em] text-gold-dark/40 font-bold italic">
                                        Golden Tower Spa &middot; Manila
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BookingModal;
