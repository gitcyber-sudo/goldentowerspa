import React, { useState, useEffect } from 'react';
import { Camera, X, Upload, RefreshCw, Plus, User } from 'lucide-react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';
import type { Therapist } from '../../types';

interface EditTherapistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    therapist: Therapist;
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
            setImagePreview(therapist.image_url || null);
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



            if (updateError) throw updateError;

            // 2.5 Sync Name to Profile (Critical for login)
            if (therapist.user_id && formData.name !== therapist.name) {
                const { error: profileSyncError } = await supabase
                    .from('profiles')
                    .update({ full_name: formData.name })
                    .eq('id', therapist.user_id);

                if (profileSyncError) {
                    console.warn('Profile name sync failed:', profileSyncError);
                    // We don't throw here to avoid blocking the whole update, but it's important to log
                }
            }

            // 3. Update Password or Create Account if requested
            if (showPasswordReset && newPassword) {
                if (newPassword.length < 4) {
                    throw new Error('PIN must be at least 4 digits');
                }

                if (!therapist.user_id) {
                    // Create account for existing specialist
                    const confirmCreate = window.confirm(`Create a new login account for ${formData.name} with PIN ${newPassword}?`);
                    if (!confirmCreate) {
                        setLoading(false);
                        return;
                    }

                    const generatedEmail = `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${therapist.id.substring(0, 4)}@goldentower.internal`;

                    const session = await supabase.auth.getSession();
                    const { data, error: createError } = await supabase.functions.invoke('create-therapist', {
                        body: {
                            ...formData,
                            email: generatedEmail,
                            password: `${newPassword}-GTS`,
                            image_url: imageUrl,
                            existing_therapist_id: therapist.id
                        },
                        headers: {
                            Authorization: `Bearer ${session.data.session?.access_token}`
                        }
                    });

                    if (createError) throw createError;

                    alert(`Login account created successfully for ${formData.name}.\nPIN: ${newPassword}\nPlease ensure the specialist saves this PIN.`);
                } else {
                    // Update existing password
                    const confirmReset = window.confirm(`Are you sure you want to reset the password for ${formData.name}? New PIN will be ${newPassword}`);
                    if (!confirmReset) {
                        setLoading(false);
                        return;
                    }

                    const session = await supabase.auth.getSession();
                    const { data, error: passError } = await supabase.functions.invoke('update-therapist-password', {
                        body: {
                            therapist_id: therapist.id,
                            new_password: `${newPassword}-GTS`
                        },
                        headers: {
                            Authorization: `Bearer ${session.data.session?.access_token}`
                        }
                    });

                    if (passError) {
                        console.error("Edge Function Error Context:", passError);
                        throw new Error(`Password update failed. ${passError.message || 'Unknown server error'}`);
                    }

                    alert(`Password reset successfully for ${formData.name}.\nNew PIN: ${newPassword}`);
                }
            }

            onSuccess();
            onClose();
        } catch (err: unknown) {
            console.error("Full Error Object:", err);
            alert('Error updating therapist: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !therapist) return null;

    return createPortal(
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
                            <label className="text-xs font-bold uppercase tracking-wider text-charcoal/60">Name</label>
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

                    {/* Account Management (Reset Password or Create Account) */}
                    <div className="border-t border-gold/10 pt-4 mt-2">
                        {!therapist.user_id ? (
                            <div className="space-y-3">
                                <div className="bg-gold/5 p-4 rounded-lg border border-gold/10">
                                    <h4 className="flex items-center gap-2 text-sm font-bold text-gold mb-1">
                                        <User size={16} />
                                        No Login Account
                                    </h4>
                                    <p className="text-xs text-charcoal/60 leading-relaxed">
                                        This specialist doesn't have a login account yet. You can create one now.
                                        They will sign in using their <strong>Name</strong> and an <strong>Access PIN</strong>.
                                    </p>
                                </div>

                                {!showPasswordReset ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasswordReset(true);
                                            // Pre-generate a PIN
                                            setNewPassword(Math.floor(1000 + Math.random() * 9000).toString());
                                        }}
                                        className="text-sm bg-gold text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gold-dark transition-colors shadow-sm"
                                    >
                                        <Plus size={14} /> Create Login Account
                                    </button>
                                ) : (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold uppercase tracking-wider text-charcoal/60">Generated Access PIN</label>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                maxLength={4}
                                                className="flex-1 p-3 bg-cream/20 border border-gold/20 rounded-lg focus:outline-none focus:border-gold font-mono font-bold tracking-widest text-center text-lg"
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value.replace(/[^0-9]/g, ''))}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { setShowPasswordReset(false); setNewPassword(''); }}
                                                className="p-3 text-charcoal/40 hover:text-charcoal"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-charcoal/40 italic">Note: Make sure to share this PIN with the specialist after saving.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
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
                                            <label className="text-xs font-bold uppercase tracking-wider text-charcoal/60">New Access PIN</label>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                maxLength={4}
                                                placeholder="Enter new access PIN"
                                                className="flex-1 p-3 bg-cream/20 border border-gold/20 rounded-lg focus:outline-none focus:border-gold font-mono font-bold tracking-widest text-center text-lg"
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value.replace(/[^0-9]/g, ''))}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { setShowPasswordReset(false); setNewPassword(''); }}
                                                className="p-3 text-charcoal/40 hover:text-charcoal"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
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
        </div>,
        document.body
    );
};

export default EditTherapistModal;
