import React, { useState } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AddTherapistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddTherapistModal: React.FC<AddTherapistModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        specialty: '',
        bio: '',
        image_url: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = '';

            // 1. Upload Image if exists
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const { error: uploadError, data } = await supabase.storage
                    .from('therapist-photos')
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('therapist-photos')
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            }

            // 2. Call Edge Function to create user and therapist record
            const { data, error } = await supabase.functions.invoke('create-therapist', {
                body: {
                    ...formData,
                    image_url: imageUrl
                }
            });

            if (error) throw error;

            onSuccess();
            onClose();
            // Reset form
            setFormData({ name: '', email: '', password: '', specialty: '', bio: '', image_url: '' });
            setImageFile(null);
            setImagePreview(null);
        } catch (err: any) {
            alert('Error adding therapist: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-serif text-2xl text-charcoal">Add New Specialist</h2>
                    <button onClick={onClose} className="text-charcoal/40 hover:text-charcoal transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Photo Upload */}
                    <div className="flex justify-center mb-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center overflow-hidden border-2 border-dashed border-gold/30">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera className="text-gold/40" size={32} />
                                )}
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                                <Upload size={20} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-charcoal/60">Full Name</label>
                            <input
                                required
                                type="text"
                                className="w-full p-3 bg-cream/20 border border-gold/20 rounded-lg focus:outline-none focus:border-gold"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-charcoal/60">Specialty</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-cream/20 border border-gold/20 rounded-lg focus:outline-none focus:border-gold"
                                value={formData.specialty}
                                onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-charcoal/60">Email (For Sign In)</label>
                        <input
                            required
                            type="email"
                            className="w-full p-3 bg-cream/20 border border-gold/20 rounded-lg focus:outline-none focus:border-gold"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-charcoal/60">Password</label>
                        <input
                            required
                            type="password"
                            className="w-full p-3 bg-cream/20 border border-gold/20 rounded-lg focus:outline-none focus:border-gold"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-charcoal/60">Bio</label>
                        <textarea
                            className="w-full p-3 bg-cream/20 border border-gold/20 rounded-lg focus:outline-none focus:border-gold h-20 resize-none"
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-charcoal/10 rounded-xl font-bold text-charcoal/60 hover:bg-charcoal/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-gold text-white rounded-xl font-bold hover:bg-gold-dark transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Specialist'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTherapistModal;
