import React, { useState, useRef } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { createReel } from '../../store/slices/reelSlice';
import { Button } from '../common/Button';
import { X, Video, Music, Type } from 'lucide-react';

interface CreateReelModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateReelModal: React.FC<CreateReelModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [caption, setCaption] = useState('');
    const [audioName, setAudioName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('video')) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        } else {
            alert('Please select a video file');
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            alert('Please select a video');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('caption', caption);
            if (audioName) {
                formData.append('audioName', audioName);
            }

            await dispatch(createReel(formData)).unwrap();

            // Reset form
            setSelectedFile(null);
            setPreview('');
            setCaption('');
            setAudioName('');
            onClose();
        } catch (error) {
            console.error('Failed to create reel:', error);
            alert('Failed to create reel. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Reel</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-full transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="grid grid-cols-2 gap-4 p-4">
                        {/* Video Preview */}
                        <div>
                            {preview ? (
                                <div className="relative aspect-[9/16] bg-black rounded-xl overflow-hidden">
                                    <video
                                        src={preview}
                                        className="w-full h-full object-contain"
                                        controls
                                    />
                                    <button
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setPreview('');
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition"
                                    >
                                        <X className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-[9/16] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-hover transition rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-border"
                                >
                                    <div className="w-16 h-16 mb-4 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-full flex items-center justify-center">
                                        <Video className="w-8 h-8 text-primary-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Add Video
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-center text-sm px-4">
                                        Click to select a video file
                                    </p>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>

                        {/* Details */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Type className="w-4 h-4 inline mr-1" />
                                    Caption
                                </label>
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Write a caption... (use #hashtags and @mentions)"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                    rows={6}
                                    maxLength={2200}
                                />
                                <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {caption.length}/2200
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Music className="w-4 h-4 inline mr-1" />
                                    Audio Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={audioName}
                                    onChange={(e) => setAudioName(e.target.value)}
                                    placeholder="Original Audio"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                    Tips for great Reels:
                                </h4>
                                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                    <li>• Keep it short and engaging (15-60 seconds)</li>
                                    <li>• Use trending audio for more reach</li>
                                    <li>• Add relevant hashtags</li>
                                    <li>• Vertical video works best (9:16)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-dark-border flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isUploading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedFile || isUploading}
                        isLoading={isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Share Reel'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
