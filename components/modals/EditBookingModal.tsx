
import React from 'react';
import { X, Edit3, Save } from 'lucide-react';

interface EditBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    data: any;
    setData: (data: any) => void;
    services: any[];
    therapists: any[];
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    data,
    setData,
    services,
    therapists
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-start md:items-center p-4 md:p-6 bg-charcoal/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-charcoal/40 hover:text-gold"><X size={24} /></button>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gold/10 rounded-xl">
                        <Edit3 className="text-gold" size={24} />
                    </div>
                    <div>
                        <h2 className="font-serif text-xl md:text-2xl text-charcoal">Edit Booking</h2>
                        <p className="text-xs text-charcoal/50">Modify booking details</p>
                    </div>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gold block mb-1">Client Name</label>
                            <input type="text" className="w-full border border-gold/20 rounded-lg p-3" value={data.guest_name} onChange={e => setData({ ...data, guest_name: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-gold block mb-1">Email</label>
                            <input type="email" className="w-full border border-gold/20 rounded-lg p-3" value={data.guest_email} onChange={e => setData({ ...data, guest_email: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-gold block mb-1">Phone</label>
                            <input type="tel" className="w-full border border-gold/20 rounded-lg p-3" value={data.guest_phone} onChange={e => setData({ ...data, guest_phone: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-gold block mb-1">Service</label>
                        <select className="w-full border border-gold/20 rounded-lg p-3" value={data.service_id} onChange={e => setData({ ...data, service_id: e.target.value })}>
                            {services.map(s => <option key={s.id} value={s.id}>{s.title} - ₱{s.price}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-gold block mb-1">Assigned Specialist</label>
                        <select className="w-full border border-gold/20 rounded-lg p-3" value={data.therapist_id} onChange={e => setData({ ...data, therapist_id: e.target.value })}>
                            <option value="">-- Any Available --</option>
                            {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-gold block mb-1">Date</label>
                            <input type="date" className="w-full border border-gold/20 rounded-lg p-3" value={data.booking_date} onChange={e => setData({ ...data, booking_date: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-gold block mb-1">Time</label>
                            <input type="time" className="w-full border border-gold/20 rounded-lg p-3" value={data.booking_time} onChange={e => setData({ ...data, booking_time: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-gold block mb-1">Status</label>
                        <select className="w-full border border-gold/20 rounded-lg p-3" value={data.status} onChange={e => setData({ ...data, status: e.target.value })}>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 border border-gold/20 text-charcoal font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-charcoal/5">Cancel</button>
                        <button type="submit" className="flex-1 bg-gold text-white font-bold uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2">
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBookingModal;
