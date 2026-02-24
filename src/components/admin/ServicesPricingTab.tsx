import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Tag,
    History,
    Edit3,
    Trash2,
    Plus,
    Clock,
    DollarSign,
    Save,
    X,
    ChevronRight,
    Search,
    RefreshCcw,
    Layers
} from 'lucide-react';
import type { Service, ServicePriceHistory } from '../../types';
import gsap from 'gsap';
import { formatDuration } from '../../lib/utils';

interface ServicesPricingTabProps {
    services: Service[];
    onRefresh: () => void;
}

const ServicesPricingTab: React.FC<ServicesPricingTabProps> = ({ services, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [showHistory, setShowHistory] = useState<string | null>(null);
    const [priceHistory, setPriceHistory] = useState<ServicePriceHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const filteredServices = services.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchPriceHistory = async (serviceId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('service_price_history')
                .select('*')
                .eq('service_id', serviceId)
                .order('changed_at', { ascending: false });

            if (error) throw error;
            setPriceHistory(data || []);
        } catch (err) {
            console.error('Error fetching price history:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (showHistory) {
            fetchPriceHistory(showHistory);
        }
    }, [showHistory]);

    const handleUpdateService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingService) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('services')
                .update({
                    title: editingService.title,
                    price: editingService.price,
                    duration: editingService.duration,
                    description: editingService.description,
                    category: editingService.category
                })
                .eq('id', editingService.id);

            if (error) throw error;
            setEditingService(null);
            onRefresh();
        } catch (err) {
            console.error('Error updating service:', err);
            alert('Failed to update service.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30" size={18} />
                    <input
                        type="text"
                        placeholder="Search services or categories..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gold/10 rounded-2xl shadow-sm focus:outline-none focus:border-gold transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                    <div key={service.id} className="group bg-white rounded-3xl border border-gold/10 p-6 shadow-sm hover:shadow-xl hover:border-gold/30 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-gold/10 transition-all duration-500" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-gold/10 rounded-2xl text-gold group-hover:bg-gold group-hover:text-white transition-all duration-500">
                                    <Tag size={20} />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowHistory(service.id)}
                                        className="p-2 text-charcoal/40 hover:text-gold hover:bg-gold/5 rounded-lg transition-colors"
                                        title="View Price History"
                                    >
                                        <History size={18} />
                                    </button>
                                    <button
                                        onClick={() => setEditingService(service)}
                                        className="p-2 text-charcoal/40 hover:text-gold hover:bg-gold/5 rounded-lg transition-colors"
                                        title="Edit Service"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-gold/60 mb-1 block">
                                    {service.category}
                                </span>
                                <h3 className="font-serif text-xl text-charcoal mb-2 group-hover:text-gold transition-colors">
                                    {service.title}
                                </h3>
                                <p className="text-sm text-charcoal/50 line-clamp-2 mb-6 italic leading-relaxed">
                                    {service.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gold/5">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-cream rounded-lg text-gold">
                                        <Clock size={14} />
                                    </div>
                                    <span className="text-xs font-bold text-charcoal/60">{formatDuration(service.duration)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                                        <DollarSign size={14} />
                                    </div>
                                    <span className="text-lg font-serif text-charcoal">₱{service.price.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredServices.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gold/20">
                        <Search size={48} className="mx-auto text-gold/20 mb-4" />
                        <p className="text-charcoal/40 font-serif text-xl italic">No services found in this realm...</p>
                    </div>
                )}
            </div>

            {/* History Modal */}
            {showHistory && (
                <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-gold/20 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-gold/10 flex items-center justify-between bg-[#Fdfbf7]">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gold/10 rounded-2xl text-gold">
                                    <History size={24} />
                                </div>
                                <div>
                                    <h3 className="font-serif text-2xl text-charcoal">Price Evolution</h3>
                                    <p className="text-xs text-charcoal/40 uppercase tracking-widest font-black">
                                        {services.find(s => s.id === showHistory)?.title}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowHistory(null)}
                                className="p-2 hover:bg-gold/10 text-charcoal/40 hover:text-gold rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <RefreshCcw className="animate-spin text-gold" size={32} />
                                </div>
                            ) : priceHistory.length > 0 ? (
                                <div className="space-y-6">
                                    {priceHistory.map((entry, i) => (
                                        <div key={entry.id} className="relative flex gap-6 group">
                                            {i !== priceHistory.length - 1 && (
                                                <div className="absolute left-6 top-12 w-0.5 h-full bg-gold/10" />
                                            )}
                                            <div className="w-12 h-12 rounded-2xl bg-cream border border-gold/10 flex items-center justify-center flex-shrink-0 relative z-10 group-hover:bg-gold/10 transition-colors">
                                                <div className="w-2 h-2 rounded-full bg-gold" />
                                            </div>
                                            <div className="flex-1 pb-8">
                                                <div className="bg-white border border-gold/10 rounded-2xl p-4 shadow-sm group-hover:shadow-md transition-all">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="text-xs font-bold text-charcoal/40 uppercase tracking-widest">
                                                            {new Date(entry.changed_at).toLocaleDateString('en-US', {
                                                                month: 'long',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-charcoal/40 line-through text-sm">₱{entry.old_price.toLocaleString()}</div>
                                                        <ChevronRight className="text-gold/30" size={16} />
                                                        <div className="text-lg font-serif text-charcoal">₱{entry.new_price.toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-charcoal/40 italic">
                                    No historical records found for this ritual.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingService && (
                <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-gold/20 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                        <div className="p-8 border-b border-gold/10 flex items-center justify-between bg-[#Fdfbf7]">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gold/10 rounded-2xl text-gold">
                                    <Edit3 size={24} />
                                </div>
                                <h3 className="font-serif text-2xl text-charcoal">Refine Ritual</h3>
                            </div>
                            <button
                                onClick={() => setEditingService(null)}
                                className="p-2 hover:bg-gold/10 text-charcoal/40 hover:text-gold rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateService} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-[10px] uppercase tracking-widest font-black text-charcoal/40 px-2">Ritual Title</span>
                                    <input
                                        type="text"
                                        className="mt-1 w-full bg-cream/30 border border-gold/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-all"
                                        value={editingService.title}
                                        onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                                        required
                                    />
                                </label>

                                <div className="grid grid-cols-2 gap-4">
                                    <label className="block">
                                        <span className="text-[10px] uppercase tracking-widest font-black text-charcoal/40 px-2">Price (₱)</span>
                                        <input
                                            type="number"
                                            className="mt-1 w-full bg-cream/30 border border-gold/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-all"
                                            value={editingService.price}
                                            onChange={(e) => setEditingService({ ...editingService, price: parseFloat(e.target.value) })}
                                            required
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-[10px] uppercase tracking-widest font-black text-charcoal/40 px-2">Duration (Min)</span>
                                        <input
                                            type="number"
                                            className="mt-1 w-full bg-cream/30 border border-gold/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-all"
                                            value={editingService.duration}
                                            onChange={(e) => setEditingService({ ...editingService, duration: parseInt(e.target.value) })}
                                            required
                                        />
                                    </label>
                                </div>

                                <label className="block">
                                    <span className="text-[10px] uppercase tracking-widest font-black text-charcoal/40 px-2">Description</span>
                                    <textarea
                                        rows={3}
                                        className="mt-1 w-full bg-cream/30 border border-gold/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-all italic"
                                        value={editingService.description}
                                        onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                                        required
                                    />
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-charcoal text-white py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gold transition-all duration-300 shadow-lg"
                            >
                                {saving ? <RefreshCcw size={20} className="animate-spin" /> : <Save size={20} />}
                                {saving ? 'Preserving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServicesPricingTab;
