import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Search, Edit3, User, RefreshCw } from 'lucide-react';
import AddTherapistModal from './modals/AddTherapistModal';
import EditTherapistModal from './modals/EditTherapistModal';
import ManageAvailabilityModal from './modals/ManageAvailabilityModal';
import { Calendar } from 'lucide-react';

const TherapistManagement: React.FC = () => {
    const [therapists, setTherapists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTherapist, setEditingTherapist] = useState<any>(null);
    const [availabilityTherapist, setAvailabilityTherapist] = useState<any>(null);

    const fetchTherapists = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('therapists')
            .select('*')
            .order('name');

        if (error) console.error('Error fetching therapists:', error);
        if (data) setTherapists(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchTherapists();
    }, [fetchTherapists]);

    const filteredTherapists = useMemo(() => therapists.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.specialty && t.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [therapists, searchTerm]);

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30" size={16} />
                    <input
                        type="text"
                        placeholder="Search specialists..."
                        className="pl-9 pr-4 py-2 border rounded-xl w-full text-sm focus:border-gold focus:outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="ml-4 bg-gold text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gold-dark transition-colors"
                >
                    <Plus size={18} /> Add Specialist
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gold/20 border-t-gold" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTherapists.map(therapist => (
                        <div key={therapist.id} className={`bg-white rounded-xl border p-6 transition-all hover:shadow-lg relative group ${therapist.active ? 'border-gold/10' : 'border-gray-200 opacity-75'}`}>
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-full bg-gold/10 overflow-hidden flex-shrink-0 border-2 border-white ring-2 ring-gold/20">
                                    {therapist.image_url ? (
                                        <img src={therapist.image_url} alt={therapist.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gold">
                                            <User size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-serif text-lg text-charcoal">{therapist.name}</h3>
                                    <p className="text-xs text-charcoal/60 uppercase tracking-wide mb-2">{therapist.specialty || 'General Therapist'}</p>
                                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${therapist.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {therapist.active ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => setEditingTherapist(therapist)}
                                        className="p-2 text-gold hover:bg-gold/5 rounded-lg transition-colors"
                                        title="Edit Profile"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => setAvailabilityTherapist(therapist)}
                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                        title="Manage Availability"
                                    >
                                        <Calendar size={18} />
                                    </button>
                                </div>
                            </div>
                            {therapist.bio && (
                                <p className="mt-4 text-sm text-charcoal/60 line-clamp-2">{therapist.bio}</p>
                            )}
                        </div>
                    ))}

                    {filteredTherapists.length === 0 && (
                        <div className="col-span-full text-center py-12 text-charcoal/40">
                            <p>No specialists found matching your search.</p>
                        </div>
                    )}
                </div>
            )}

            <AddTherapistModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchTherapists}
            />

            <EditTherapistModal
                isOpen={!!editingTherapist}
                therapist={editingTherapist}
                onClose={() => setEditingTherapist(null)}
                onSuccess={fetchTherapists}
            />

            <ManageAvailabilityModal
                isOpen={!!availabilityTherapist}
                therapist={availabilityTherapist}
                onClose={() => setAvailabilityTherapist(null)}
                onSuccess={fetchTherapists}
            />
        </div>
    );
};

export default TherapistManagement;
