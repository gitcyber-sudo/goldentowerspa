import React, { useMemo } from 'react';
import { XCircle } from 'lucide-react';
import SelectionGrid from '../SelectionGrid';
import type { Service, Therapist } from '../../types';
import CustomDatePicker from '../ui/CustomDatePicker';
import CustomTimePicker from '../ui/CustomTimePicker';

interface ManualBookingFormData {
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    service_id: string;
    therapist_id: string;
    date: string;
    time: string;
}

interface ManualBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    data: ManualBookingFormData;
    setData: (data: ManualBookingFormData) => void;
    services: Service[];
    therapists: Therapist[];
}

const ManualBookingModal: React.FC<ManualBookingModalProps> = React.memo(({
    isOpen,
    onClose,
    onSubmit,
    data,
    setData,
    services,
    therapists
}) => {
    if (!isOpen) return null;

    const serviceOptions = useMemo(() => services.map(s => ({
        id: s.id,
        title: s.title,
        subtitle: s.category,
        imageUrl: s.image_url,
        price: s.price,
        duration: s.duration
    })), [services]);

    const activeTherapists = useMemo(() => therapists.filter(t => t.active !== false), [therapists]);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-start md:items-center p-4 md:p-6 bg-charcoal/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-charcoal/40 hover:text-gold">
                    <XCircle size={24} />
                </button>
                <h2 className="font-serif text-xl md:text-2xl text-charcoal mb-6">New Guest Reservation</h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gold block mb-1">Guest Name *</label>
                            <input
                                required
                                type="text"
                                className="w-full border border-gold/20 rounded-lg p-3"
                                value={data.guest_name}
                                onChange={e => setData({ ...data, guest_name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-gold block mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full border border-gold/20 rounded-lg p-3"
                                value={data.guest_email}
                                onChange={e => setData({ ...data, guest_email: e.target.value })}
                            />
                        </div>
                    </div>
                    <SelectionGrid
                        label="Select Ritual"
                        options={serviceOptions}
                        selectedId={data.service_id}
                        onSelect={(id) => setData({ ...data, service_id: id })}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gold block mb-1">Assigned Specialist *</label>
                            <select
                                required
                                className="w-full border border-gold/20 rounded-lg p-3"
                                value={data.therapist_id}
                                onChange={e => setData({ ...data, therapist_id: e.target.value })}
                            >
                                {activeTherapists.map(t => {
                                    const isUnavailable = data.date && t.unavailable_blockouts &&
                                        Array.isArray(t.unavailable_blockouts) &&
                                        t.unavailable_blockouts.some(d => {
                                            const blockedDate = new Date(d).toDateString();
                                            const selectedDate = new Date(data.date).toDateString();
                                            return blockedDate === selectedDate;
                                        });

                                    return (
                                        <option key={t.id} value={t.id} disabled={!!isUnavailable}>
                                            {t.name} {isUnavailable ? '(Unavailable)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <CustomDatePicker
                            label="Date *"
                            value={data.date}
                            disabledDates={
                                data.therapist_id
                                    ? activeTherapists.find(t => t.id === data.therapist_id)?.unavailable_blockouts as string[] | undefined
                                    : undefined
                            }
                            onChange={(date) => setData({ ...data, date })}
                        />
                        <CustomTimePicker
                            label="Time *"
                            value={data.time}
                            onChange={(time) => setData({ ...data, time })}
                        />
                    </div>
                    <button type="submit" className="w-full bg-gold text-white font-bold uppercase tracking-widest py-4 rounded-xl mt-4">Confirm Reservation</button>
                </form>
            </div>
        </div>
    );
});

export default ManualBookingModal;
