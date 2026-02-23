import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { supabase } from '../lib/supabase';
import { Calendar as CalendarIcon, User, Clock, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSEO } from '../hooks/useSEO';
import type { Therapist } from '../types';

const Availability: React.FC = () => {
    useSEO({
        title: 'Specialist Schedules | Golden Tower Spa',
        description: 'View the availability of our expert therapists and find the perfect time for your wellness journey.'
    });

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

    useEffect(() => {
        const fetchTherapists = async () => {
            try {
                const { data, error } = await supabase.from('therapists').select('*').eq('active', true);
                if (error) throw error;
                setTherapists(data || []);
            } catch (err) {
                console.error("Failed to fetch therapists", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTherapists();
    }, []);

    const availableTherapists = therapists.filter(t => {
        if (!selectedDate) return true;
        let isBlocked = false;
        if (t.unavailable_blockouts && Array.isArray(t.unavailable_blockouts)) {
            isBlocked = t.unavailable_blockouts.some(d =>
                new Date(d).toDateString() === selectedDate.toDateString()
            );
        }
        return !isBlocked;
    });

    // Helper to get next 14 days of availability for a therapist
    const getAvailableDates = (therapist: Therapist) => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 14; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);

            let isBlocked = false;
            if (therapist.unavailable_blockouts && Array.isArray(therapist.unavailable_blockouts)) {
                isBlocked = therapist.unavailable_blockouts.some(d =>
                    new Date(d).toDateString() === date.toDateString()
                );
            }
            if (!isBlocked) dates.push(date);
        }
        return dates;
    };

    return (
        <div className="bg-cream min-h-screen flex flex-col pt-24 font-sans">
            <Header onBookClick={() => { }} onLoginClick={() => { }} />

            <main className="flex-1 py-12 md:py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-12 md:mb-16 animate-fade-in-up">
                        <p className="text-gold font-bold tracking-widest uppercase text-sm mb-4">Plan Your Visit</p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-charcoal mb-4">Specialist Schedules</h1>
                        <p className="text-charcoal/60 max-w-2xl mx-auto text-lg leading-relaxed">Select a date to see available therapists, or click a therapist to see their full schedule.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                        {/* Interactive Calendar */}
                        <div className="lg:col-span-4 bg-white rounded-3xl p-8 shadow-xl border border-gold/10 relative overflow-hidden group hover:border-gold/30 transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                                    <CalendarIcon className="text-gold" size={20} />
                                </div>
                                <h3 className="font-serif text-xl text-charcoal">Select Date</h3>
                            </div>

                            <style dangerouslySetInnerHTML={{
                                __html: `
                                .rdp { 
                                    --rdp-accent-color: #997B3D;
                                    --rdp-accent-color-dark: #C5A059;
                                    margin: 0 !important;
                                }
                                
                                .rdp-nav_button, .rdp-button_reset, .rdp-button {
                                    color: #997B3D !important;
                                    outline: none !important;
                                }
                                .rdp-nav_button:hover {
                                    background-color: rgba(153, 123, 61, 0.1) !important;
                                }

                                .rdp-day_selected, .rdp-selected, [aria-selected="true"] {
                                    background: none !important;
                                }
                                .rdp-day_selected .rdp-day_button, 
                                .rdp-selected .rdp-day_button, 
                                [aria-selected="true"] .rdp-day_button,
                                .rdp-day_button[aria-selected="true"] {
                                    background-color: #997B3D !important;
                                    color: white !important;
                                    border: 2px solid #000000 !important;
                                    border-radius: 12px !important;
                                    opacity: 1 !important;
                                    box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
                                }

                                .rdp-day_button:focus-visible, .rdp-day_button:focus {
                                    outline: none !important;
                                    box-shadow: 0 0 0 2px #000000 !important;
                                    border-radius: 12px !important;
                                }

                                .rdp-day_today:not(.rdp-day_selected) .rdp-day_button {
                                    color: #997B3D !important;
                                    font-weight: 800 !important;
                                    border: 2px solid #997B3D !important;
                                    border-radius: 12px !important;
                                    background-color: transparent !important;
                                }

                                .rdp-day_button:hover:not([disabled]):not([aria-selected="true"]) {
                                    background-color: rgba(153, 123, 61, 0.1) !important;
                                    border-radius: 12px !important;
                                    color: #997B3D !important;
                                }

                                .rdp-weekday, .rdp-month_caption {
                                    color: #4A4A4A !important;
                                }
                                `
                            }} />

                            <div className="flex justify-center relative z-10">
                                <DayPicker
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => { if (date) setSelectedDate(date) }}
                                    disabled={{ before: new Date() }}
                                />
                            </div>
                        </div>

                        {/* Available Specialists List */}
                        <div className="lg:col-span-8">
                            <div className="flex justify-between items-end mb-8 border-b border-charcoal/10 pb-4">
                                <div>
                                    <h2 className="font-serif text-2xl text-charcoal">
                                        Available on {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select a date'}
                                    </h2>
                                    <p className="text-charcoal/50 text-sm mt-1">
                                        {loading ? 'Checking schedules...' : `${availableTherapists.length} Specialists available`}
                                    </p>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : availableTherapists.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                    {availableTherapists.map((therapist) => (
                                        <button
                                            key={therapist.id}
                                            onClick={() => setSelectedTherapist(therapist)}
                                            className="w-full bg-white rounded-2xl p-3 md:p-5 border border-gold/10 hover:border-gold/40 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-row md:flex-col items-center gap-4 md:gap-0 text-left md:text-center active:scale-[0.98] outline-none"
                                        >
                                            {/* Compact Image */}
                                            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden shrink-0 md:mb-4 border-2 border-gold/20 group-hover:border-gold transition-colors relative">
                                                {therapist.image_url ? (
                                                    <img
                                                        src={therapist.image_url}
                                                        alt={therapist.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-charcoal/5 flex items-center justify-center text-charcoal font-serif text-2xl group-hover:bg-gold transition-colors group-hover:text-white">
                                                        {therapist.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full z-10" title="Available"></div>
                                            </div>

                                            <div className="flex flex-col md:items-center">
                                                <h3 className="font-serif text-lg md:text-xl text-charcoal font-bold mb-1 leading-tight group-hover:text-gold transition-colors">{therapist.name}</h3>
                                                <div className="flex items-center gap-1.5 px-3 py-0.5 bg-emerald-50 text-emerald-700 rounded-full w-fit mb-1.5">
                                                    <CheckCircle2 size={10} className="shrink-0" />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest">Available Today</span>
                                                </div>
                                                <p className="text-[10px] text-gold font-bold uppercase tracking-tighter">
                                                    Click for full schedule
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-12 text-center border border-charcoal/10">
                                    <Clock className="w-16 h-16 text-charcoal/20 mx-auto mb-4" />
                                    <h3 className="font-serif text-2xl text-charcoal mb-2">Fully Booked</h3>
                                    <p className="text-charcoal/60 max-w-sm mx-auto">It looks like all our specialists are currently booked on this date. Please select another date.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Availability Modal */}
            {selectedTherapist && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-md" onClick={() => setSelectedTherapist(null)} />

                    <div className="relative bg-cream w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-gold/20 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                        {/* Modal Header */}
                        <div className="relative h-48 md:h-56">
                            {selectedTherapist.image_url ? (
                                <img src={selectedTherapist.image_url} alt={selectedTherapist.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gold/10 flex items-center justify-center text-6xl font-serif text-gold">
                                    {selectedTherapist.name.charAt(0)}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-black/20" />
                            <button
                                onClick={() => setSelectedTherapist(null)}
                                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/50 text-white flex items-center justify-center hover:bg-white/40 transition-colors active:scale-95"
                            >
                                <span className="text-2xl leading-none">&times;</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 md:p-10 -mt-8 relative bg-cream rounded-t-[2.5rem]">
                            <p className="text-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-2">Specialist Schedule</p>
                            <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-6">{selectedTherapist.name}</h2>

                            <h4 className="text-charcoal/40 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Logo size={14} color="#997B3D" /> Available Dates
                            </h4>

                            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {getAvailableDates(selectedTherapist).map((date, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gold/10 hover:border-gold/30 transition-all shadow-sm group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-colors">
                                            <CalendarIcon size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-charcoal leading-tight">
                                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-[10px] text-charcoal/40 uppercase tracking-wider">
                                                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setSelectedTherapist(null)}
                                className="w-full mt-8 bg-charcoal text-white py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gold transition-colors shadow-lg active:scale-[0.98]"
                            >
                                Close Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default Availability;
