import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { supabase } from '../lib/supabase';
import { Calendar as CalendarIcon, User, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
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
        if (!selectedDate) return true; // Show all if no date selected
        let isBlocked = false;
        if (t.unavailable_blockouts && Array.isArray(t.unavailable_blockouts)) {
            isBlocked = t.unavailable_blockouts.some(d =>
                new Date(d).toDateString() === selectedDate.toDateString()
            );
        }
        return !isBlocked;
    });

    return (
        <div className="bg-cream min-h-screen flex flex-col pt-24 font-sans">
            <Header onBookClick={() => { }} onLoginClick={() => { }} />

            <main className="flex-1 py-12 md:py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-16 animate-fade-in-up">
                        <p className="text-gold font-bold tracking-widest uppercase text-sm mb-4">Plan Your Visit</p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-charcoal mb-4">Specialist Schedules</h1>
                        <p className="text-charcoal/60 max-w-2xl mx-auto text-lg">Select a date below to see which of our expert therapists are available to guide your wellness journey.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                        {/* Interactive Calendar - Option 1 */}
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
                                .rdp-selected .rdp-day_button {
                                    background-color: #997B3D !important;
                                    color: white !important;
                                    border-radius: 12px !important;
                                }
                                .rdp-selected {
                                    background-color: #997B3D !important;
                                    color: white !important;
                                    border-radius: 12px !important;
                                }
                                .rdp-today .rdp-day_button {
                                    border: 2px solid #C5A059 !important;
                                    border-radius: 12px !important;
                                    font-weight: bold !important;
                                    color: #C5A059 !important;
                                }
                                .rdp-day_button:hover:not([disabled]) {
                                    background-color: rgba(197, 160, 89, 0.1) !important;
                                    border-radius: 12px !important;
                                    color: #997B3D !important;
                                }
                                `
                            }} />

                            <div className="flex justify-center relative z-10">
                                <DayPicker
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => { if (date) setSelectedDate(date) }}
                                    disabled={{ before: new Date() }} // Cannot book past
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {availableTherapists.map((therapist) => (
                                        <div key={therapist.id} className="bg-white rounded-2xl p-4 md:p-5 border border-gold/10 hover:border-gold/30 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col items-center text-center">
                                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-4 border-2 border-gold/20 group-hover:border-gold transition-colors relative">
                                                {therapist.image_url ? (
                                                    <img
                                                        src={therapist.image_url}
                                                        alt={therapist.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-charcoal/5 flex items-center justify-center text-charcoal font-serif text-3xl group-hover:bg-gold transition-colors group-hover:text-white">
                                                        {therapist.name.charAt(0)}
                                                    </div>
                                                )}
                                                {/* Status dot */}
                                                <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full z-10" title="Available"></div>
                                            </div>

                                            <h3 className="font-serif text-xl text-charcoal font-bold mb-1">{therapist.name}</h3>

                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full mt-2">
                                                <CheckCircle2 size={14} />
                                                <span className="text-xs font-bold uppercase tracking-widest">Available</span>
                                            </div>
                                        </div>
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

            <Footer />
        </div>
    );
};

export default Availability;
