import React from 'react';
import { X, Star } from 'lucide-react';
import type { Booking } from '../../types';

interface ReviewsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    review: {
        booking: Booking;
        feedback: any;
    } | null;
}

const ReviewsPanel: React.FC<ReviewsPanelProps> = ({ isOpen, onClose, review }) => {
    if (!isOpen || !review) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div>
                        <h2 className="font-serif text-2xl text-charcoal">Treatment Review</h2>
                        <p className="text-xs text-charcoal/40 uppercase font-black tracking-widest mt-1">Feedback from {review.booking.guest_name || review.booking.user_email}</p>
                    </div>
                    <button onClick={onClose} className="text-charcoal/40 hover:text-charcoal transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6 relative z-10">
                    {/* Current Review */}
                    <div className="bg-gold/5 p-6 rounded-2xl border border-gold/10">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} size={16} className={s <= review.feedback.rating ? 'text-gold fill-gold' : 'text-gold/20'} />
                                ))}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gold/60">Current Review</span>
                        </div>
                        <p className="text-charcoal leading-relaxed italic">"{review.feedback.comment}"</p>
                        <div className="mt-4 flex justify-between items-end">
                            <p className="text-[10px] text-charcoal/40">Therapist: <span className="font-bold">{review.booking.therapists?.name}</span></p>
                            <p className="text-[10px] text-charcoal/40">{new Date(review.feedback.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* History if edited */}
                    {review.feedback.edit_count > 0 && (
                        <div className="opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-[1px] flex-1 bg-gold/10" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-charcoal/40">Original Review (Past)</span>
                                <div className="h-[1px] flex-1 bg-gold/10" />
                            </div>
                            <div className="p-5 border border-dashed border-gold/20 rounded-xl bg-cream/20">
                                <div className="flex gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star key={s} size={12} className={s <= review.feedback.previous_rating ? 'text-gold fill-gold' : 'text-gold/10'} />
                                    ))}
                                </div>
                                <p className="text-sm text-charcoal/60 italic">"{review.feedback.previous_comment}"</p>
                                <p className="text-[9px] text-charcoal/30 mt-3">Modified on {new Date(review.feedback.edited_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    )}

                    <button onClick={onClose} className="w-full py-4 bg-charcoal text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors">Close Review</button>
                </div>
            </div>
        </div>
    );
};

export default ReviewsPanel;
