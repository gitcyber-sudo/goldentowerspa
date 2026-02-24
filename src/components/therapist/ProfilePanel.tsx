import React from 'react';
import { UserCircle } from 'lucide-react';
import { Therapist } from '../../types';

interface ProfilePanelProps {
    therapistInfo: Therapist & { created_at?: string };
    completedCount: number;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ therapistInfo, completedCount }) => {
    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl border border-gold/10 overflow-hidden shadow-sm">
                {/* Cover */}
                <div className="h-36 md:h-44 bg-gradient-to-br from-charcoal via-charcoal to-charcoal-light relative overflow-hidden">
                    <div className="absolute inset-0 bg-gold/5" aria-hidden="true" />
                    <div className="absolute bottom-4 right-6 flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${therapistInfo.active ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                        <span className="text-white/70 text-[10px] uppercase font-bold tracking-widest">{therapistInfo.active ? 'Active' : 'Inactive'}</span>
                    </div>
                </div>
                {/* Content */}
                <div className="px-6 md:px-8 pb-8">
                    <div className="relative -mt-16 md:-mt-20 mb-6 flex justify-between items-end">
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white bg-white overflow-hidden shadow-xl ring-4 ring-gold/10">
                            {therapistInfo.image_url ? (
                                <img src={therapistInfo.image_url} alt={therapistInfo.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center">
                                    <UserCircle size={56} className="text-gold/40" />
                                </div>
                            )}
                        </div>
                    </div>

                    <h2 className="font-serif text-2xl md:text-3xl text-charcoal mb-1">{therapistInfo.name}</h2>
                    <p className="text-gold font-bold uppercase tracking-[0.3em] text-xs mb-6">{therapistInfo.specialty || 'Master Specialist'}</p>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-2">About Me</h3>
                            <p className="text-charcoal/70 leading-relaxed text-sm">{therapistInfo.bio || 'No bio available.'}</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-4 rounded-xl bg-cream/50 border border-gold/10">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-1">Sessions</h3>
                                <p className="text-xl font-serif text-charcoal">{completedCount}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-cream/50 border border-gold/10">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-1">Status</h3>
                                <p className="text-xl font-serif text-gold">{therapistInfo.active ? 'Active' : 'Offline'}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-cream/50 border border-gold/10 col-span-2 md:col-span-1 border-t-4 border-t-gold/20">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-1">Joined</h3>
                                <p className="text-sm text-charcoal">
                                    {therapistInfo.created_at
                                        ? new Date(therapistInfo.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                                        : 'N/A'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePanel;
