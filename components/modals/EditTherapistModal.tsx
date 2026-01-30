import React, { useState, useEffect } from 'react';
import { Camera, X, Upload, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EditTherapistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    therapist: any;
}

const EditTherapistModal: React.FC<EditTherapistModalProps> = ({ isOpen, onClose, onSuccess, therapist }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        specialty: '',
        bio: '',
        active: true
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Password Reset
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        if (therapist) {
            setFormData({
                name: therapist.name,
                specialty: therapist.specialty || '',
                bio: therapist.bio || '',
                active: therapist.active ?? true
            });
            setImagePreview(therapist.image_url);
            setShowPasswordReset(false);
            setNewPassword('');
        }
    }, [therapist]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = therapist.image_url;

            // 1. Upload new Image if selected
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                // Use timestamp and random string to ensure uniqueness and avoid browser caching of distinct files
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

                console.log('Uploading new image:', fileName);

                const { error: uploadError } = await supabase.storage
                    .from('therapist-photos')
                    .upload(fileName, imageFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    throw uploadError;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('therapist-photos')
                    .getPublicUrl(fileName);

                console.log('New image URL generated:', publicUrl);
                imageUrl = publicUrl;
            }

            // 2. Update Therapist Record
            const { data: updatedData, error: updateError } = await supabase
                .from('therapists')
                .update({
                    name: formData.name,
                    specialty: formData.specialty,
                    bio: formData.bio,
                    active: formData.active,
                    image_url: imageUrl
                })
                .eq('id', therapist.id)
                .select();

            console.log('Update operation result:', { data: updatedData, error: updateError });

            if (updateError) throw updateError;

            // 3. Update Password if requested
            if (showPasswordReset && newPassword) {
                if (!therapist.user_id) {
                    throw new Error("This specialist does not have a login account yet. Please create one by adding them as a 'New Specialist' or contact support to link their account.");
                }

                const { data, error: passError } = await supabase.functions.invoke('update-therapist-password', {
                    body: {
                        therapist_id: therapist.id,
                        new_password: newPassword
                    }
                });

                if (passError) {
                    console.error("Edge Function Error Context:", passError);
                    throw new Error(`Password update failed. ${passError.message || 'Unknown server error'}`);
                }
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Full Error Object:", err);
            alert('Error updating therapist: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !therapist) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-serif text-2xl text-charcoal">Edit Specialist</h2>
                    <button onClick={onClose} className="text-charcoal/40 hover:text-charcoal transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
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
                        <label className="text-xs font-bold uppercase tracking-wider text-charcoal/60">Bio</label>
                        <textarea
                            className="w-full p-3 bg-cream/20 border border-gold/20 rounded-lg focus:outline-none focus:border-gold h-20 resize-none"
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gold/5 rounded-lg border border-gold/10">
                        <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.active ? 'bg-emerald-500' : 'bg-charcoal/20'}`} onClick={() => setFormData({ ...formData, active: !formData.active })}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${formData.active ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-sm font-semibold text-charcoal">
                            {formData.active ? 'Active Specialist' : 'Inactive (Hidden)'}
                        </span>
                    </div>

                    {/* Password Reset Toggle */}
                    <div className="border-t border-gold/10 pt-4 mt-2">
                        {!showPasswordReset ? (
                            <button
                                type="button"
                                onClick={() => setShowPasswordReset(true)}
                                className="text-sm text-gold font-bold flex items-center gap-2 hover:underline"
                            >
                                <RefreshCw size={14} /> Reset Password
                            </button>
                        ) : (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal/60">New Password</label>
                                    {!therapist.user_id && (
                                        <span className="text-[10px] text-rose-500 font-bold uppercase">No login account linked</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder={therapist.user_id ? "Enter new password" : "Cannot reset - no account"}
                                        disabled={!therapist.user_id}
                                        className="flex-1 p-3 bg-cream/20 border border-gold/20 rounded-lg focus:outline-none focus:border-gold disabled:opacity-50"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { setShowPasswordReset(false); setNewPassword(''); }}
                                        className="p-3 text-charcoal/40 hover:text-charcoal"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                {!therapist.user_id && (
                                    <p className="text-[10px] text-charcoal/40 italic">Note: To create a login for this specialist, please re-add them using 'Add Specialist'.</p>
                                )}
                            </div>
                        )}
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
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTherapistModal;
