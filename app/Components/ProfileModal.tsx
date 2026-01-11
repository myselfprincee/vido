"use client";

import React, { FC, useState, useEffect } from "react";
import { X, Upload, Link as LinkIcon, Save, Loader2 } from "lucide-react";
import Image from "next/image";
import { updateProfile } from "../lib/userApi";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: {
        name: string;
        image?: string | null;
    };
    onUpdate: () => void; // Callback to refresh session/UI
}

const ProfileModal: FC<ProfileModalProps> = ({ isOpen, onClose, currentUser, onUpdate }) => {
    const [name, setName] = useState(currentUser.name);
    const [imageType, setImageType] = useState<"link" | "upload">("link");
    const [imageUrl, setImageUrl] = useState(currentUser.image || "");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setName(currentUser.name);
            setImageUrl(currentUser.image || "");
            setError(null);
        }
    }, [isOpen, currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const result = await updateProfile({
                name,
                image: imageUrl || undefined,
            });

            if (result.success) {
                onUpdate();
                onClose();
            } else {
                setError(result.error || "Failed to update profile");
            }
        } catch {
            setError("Failed to verify image URL");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200 transition-all">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-black font-geist">Edit Profile</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Input */}
                    <div className="flex flex-col space-y-4">
                        <label className="text-sm font-medium text-slate-700">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-black focus:outline-none focus:ring-2  focus:border-transparent transition-all"
                            placeholder="Your name"
                            required
                        />
                    </div>

                    {/* Profile Picture Section */}
                    <div className="flex flex-col space-y-4">
                        <label className="text-sm font-medium text-slate-700">Profile Picture</label>

                        {/* Tabs */}
                        <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
                            <button
                                type="button"
                                onClick={() => setImageType("link")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${imageType === "link"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                <LinkIcon size={16} />
                                Image Link
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageType("upload")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${imageType === "upload"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                <Upload size={16} />
                                Upload
                            </button>
                        </div>

                        {/* Link Input */}
                        {imageType === "link" && (
                            <div className="space-y-3">
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-black focus:outline-none focus:ring-2  focus:border-transparent transition-all"
                                    placeholder="https://example.com/avatar.jpg"
                                />
                                <div className="text-xs text-slate-500">
                                    Paste a direct link to an image (JPG, PNG, GIF)
                                </div>
                            </div>
                        )}

                        {/* Upload Input (Disabled) */}
                        {imageType === "upload" && (
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Upload size={20} className="text-slate-400" />
                                </div>
                                <p className="text-sm text-slate-500 font-medium mb-1">
                                    File uploads coming soon!
                                </p>
                                <p className="text-xs text-slate-400">
                                    We are working on integrating secure storage.
                                </p>
                            </div>
                        )}

                        {/* Preview */}
                        {(imageUrl && imageType === "link") && (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-200">
                                    <Image
                                        src={imageUrl}
                                        alt="Preview"
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Handling error on next/image is trickier as it doesn't expose DOM element directly in same way
                                            // But for preview we can just let it fail or wrap
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = "none";
                                        }}
                                        onLoad={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = "block";
                                        }}
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Preview</p>
                                    <p className="text-xs text-slate-500">How you&apos;ll look</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileModal;
