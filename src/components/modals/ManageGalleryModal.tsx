import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Trash2, Image, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { GalleryPhoto } from '../../types';

interface ManageGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    therapist: { id: string; name: string } | null;
}

const ManageGalleryModal: React.FC<ManageGalleryModalProps> = ({ isOpen, onClose, therapist }) => {
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [deleting, setDeleting] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchPhotos = async () => {
        if (!therapist) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('therapist_gallery')
            .select('*')
            .eq('therapist_id', therapist.id)
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (!error && data) setPhotos(data);
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen && therapist) fetchPhotos();
    }, [isOpen, therapist?.id]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !therapist) return;

        const files = Array.from(e.target.files);
        setUploading(true);
        setUploadProgress(0);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileExt = file.name.split('.').pop();
                const fileName = `gallery/${therapist.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

                // Upload to Storage
                const { error: uploadError } = await supabase.storage
                    .from('therapist-photos')
                    .upload(fileName, file, { cacheControl: '3600', upsert: false });

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    continue;
                }

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('therapist-photos')
                    .getPublicUrl(fileName);

                // Insert into gallery table
                await supabase.from('therapist_gallery').insert({
                    therapist_id: therapist.id,
                    image_url: publicUrl,
                    sort_order: photos.length + i
                });

                setUploadProgress(Math.round(((i + 1) / files.length) * 100));
            }

            await fetchPhotos();
        } catch (err) {
            console.error('Gallery upload failed:', err);
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (photo: GalleryPhoto) => {
        if (!confirm('Remove this photo from the gallery?')) return;
        setDeleting(photo.id);

        try {
            // Extract the storage path from the full URL
            const url = new URL(photo.image_url);
            const pathParts = url.pathname.split('/storage/v1/object/public/therapist-photos/');
            const storagePath = pathParts.length > 1 ? decodeURIComponent(pathParts[1]) : null;

            // Delete from Storage
            if (storagePath) {
                await supabase.storage.from('therapist-photos').remove([storagePath]);
            }

            // Delete from DB
            await supabase.from('therapist_gallery').delete().eq('id', photo.id);

            setPhotos(prev => prev.filter(p => p.id !== photo.id));
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
            setDeleting(null);
        }
    };

    const handleCaptionUpdate = async (photoId: string, caption: string) => {
        await supabase.from('therapist_gallery').update({ caption }).eq('id', photoId);
        setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, caption } : p));
    };

    if (!isOpen || !therapist) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gold/10">
                    <div>
                        <h2 className="font-serif text-xl text-charcoal">Gallery — <span className="italic text-gold-dark">{therapist.name}</span></h2>
                        <p className="text-xs text-charcoal/40 mt-0.5">{photos.length} photo{photos.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={onClose} className="text-charcoal/40 hover:text-charcoal transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Upload Zone */}
                <div className="px-6 py-4 border-b border-gold/5">
                    <div
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${uploading ? 'border-gold/40 bg-gold/5' : 'border-gold/20 hover:border-gold/40 hover:bg-gold/5'}`}
                    >
                        {uploading ? (
                            <div className="space-y-2">
                                <Loader2 className="animate-spin text-gold mx-auto" size={24} />
                                <p className="text-sm text-charcoal/60">Uploading... {uploadProgress}%</p>
                                <div className="w-full bg-charcoal/5 rounded-full h-1.5 max-w-xs mx-auto">
                                    <div
                                        className="bg-gold h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <Upload className="text-gold/40 mx-auto mb-2" size={24} />
                                <p className="text-sm font-bold text-charcoal/60">Click to upload photos</p>
                                <p className="text-[10px] text-charcoal/30 uppercase tracking-wider mt-1">JPG, PNG, WEBP • Multiple files supported</p>
                            </>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleUpload}
                    />
                </div>

                {/* Photo Grid */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gold/20 border-t-gold" />
                        </div>
                    ) : photos.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-gold/5 flex items-center justify-center mx-auto mb-4">
                                <Image className="text-gold/30" size={28} />
                            </div>
                            <p className="text-charcoal/40 text-sm">No gallery photos yet.</p>
                            <p className="text-charcoal/25 text-xs mt-1">Upload photos above to build the gallery.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {photos.map(photo => (
                                <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-gold/5">
                                    <img
                                        src={photo.image_url}
                                        alt={photo.caption || 'Gallery photo'}
                                        className="w-full aspect-square object-cover"
                                    />

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleDelete(photo)}
                                            disabled={deleting === photo.id}
                                            className="p-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-colors disabled:opacity-50 shadow-lg"
                                            title="Delete photo"
                                        >
                                            {deleting === photo.id ? (
                                                <Loader2 className="animate-spin" size={16} />
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
                                        </button>
                                    </div>

                                    {/* Caption Input */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <input
                                            type="text"
                                            placeholder="Add caption..."
                                            className="w-full bg-transparent text-white text-[10px] placeholder-white/40 border-none focus:outline-none"
                                            defaultValue={photo.caption || ''}
                                            onBlur={(e) => handleCaptionUpdate(photo.id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gold/10">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gold text-white rounded-xl font-bold text-sm hover:bg-gold-dark transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ManageGalleryModal;
