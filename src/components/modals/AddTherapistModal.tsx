import React, { useState } from 'react';
import { Camera, X, Upload, Copy, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
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
        specialty: '',
        bio: '',
        image_url: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [generatedCredentials, setGeneratedCredentials] = useState<{ name: string, password: string } | null>(null);
    const [copied, setCopied] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleClose = () => {
        if (generatedCredentials) {
            setGeneratedCredentials(null);
            onSuccess();
        }
        onClose();
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

            // Auto-generate credentials
            const generatedEmail = `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@goldentower.internal`;
            const generatedPassword = Math.floor(1000 + Math.random() * 9000).toString();

            const session = await supabase.auth.getSession();
            // 2. Call Edge Function to create user and therapist record
            const { data, error } = await supabase.functions.invoke('create-therapist', {
                body: {
                    ...formData,
                    email: generatedEmail,
                    password: `${generatedPassword}-GTS`,
                    image_url: imageUrl
                },
                headers: {
                    Authorization: `Bearer ${session.data.session?.access_token}`
                }
            });

            if (error) throw error;



            // Show Success State with Credentials
            setGeneratedCredentials({
                name: formData.name,
                password: generatedPassword
            });

            // Reset form (image and preview cleared on close)
            setFormData({ name: '', specialty: '', bio: '', image_url: '' });
            setImageFile(null);
            setImagePreview(null);

        } catch (err: unknown) {
            console.error('Error adding therapist:', err);
            alert('Error adding therapist: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (generatedCredentials) {
            const text = `Specialist: ${generatedCredentials.name}\nPIN Code: ${generatedCredentials.password}`;
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-serif text-2xl text-charcoal">
                        {generatedCredentials ? 'Specialist Added!' : 'Add New Specialist'}
                    </h2>
                    <button onClick={handleClose} className="text-charcoal/40 hover:text-charcoal transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {generatedCredentials ? (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center justify-center text-center p-8 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                                <Check size={32} />
                            </div>
                            <h3 className="text-xl font-serif text-emerald-800 mb-2">Account Created</h3>
                            <p className="text-sm text-emerald-600/80 max-w-xs">
                                Please copy these credentials and share them with the specialist immediately.
                            </p>
                        </div>

                        <div className="bg-charcoal/5 p-6 rounded-xl border border-charcoal/10 space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-charcoal/40">Login Name</label>
                                <p className="text-lg font-medium text-charcoal font-serif">{generatedCredentials.name}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-charcoal/40">4-Digit Access PIN</label>
                                <div className="flex items-center gap-3">
                                    <p className="text-3xl font-bold text-gold tracking-widest font-mono">
                                        {generatedCredentials.password}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={copyToClipboard}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${copied
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'bg-gold text-white hover:bg-gold-dark shadow-lg shadow-gold/20'
                                }`}
                        >
                            {copied ? (
                                <>
                                    <Check size={20} />
                                    <span>Copied to Clipboard</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={20} />
                                    <span>Copy Credentials</span>
                                </>
                            )}
                        </button>
                    </div>
                ) : (
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
                                    placeholder="e.g. Sarah Smith"
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-charcoal/60">Specialty</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-cream/20 border border-gold/20 rounded-lg focus:outline-none focus:border-gold"
                                    value={formData.specialty}
                                    placeholder="e.g. Deep Tissue"
                                    onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="bg-gold/5 p-4 rounded-lg border border-gold/10">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-gold mb-1">
                                <Camera size={16} />
                                Automatic Account Creation
                            </h4>
                            <p className="text-xs text-charcoal/60 leading-relaxed">
                                A login account will be automatically generated for this specialist using their name.
                                You will receive a <strong>One-Time PIN</strong> upon creation to share with them.
                            </p>
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
                                {loading ? 'Creating Account...' : 'Create Specialist'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>,
        document.body
    );
};

export default AddTherapistModal;
