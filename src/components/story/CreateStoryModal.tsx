import React, { useState, useRef } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { createStory } from '../../store/slices/storySlice';
import { storyService } from '../../services/storyService';
import { Button } from '../common/Button';
import { X, Image, Type, Palette } from 'lucide-react';

interface CreateStoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [text, setText] = useState('');
    const [backgroundColor, setBackgroundColor] = useState('#6366f1');
    const [isUploading, setIsUploading] = useState(false);
    const [storyType, setStoryType] = useState<'media' | 'text'>('media');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const colors = [
        '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
        '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'
    ];

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setStoryType('media');
        }
    };

    const handleSubmit = async () => {
        setIsUploading(true);
        try {
            if (storyType === 'media' && selectedFile) {
                // Upload media first
                const { url } = await storyService.uploadStoryMedia(selectedFile);
                const mediaType = selectedFile.type.startsWith('video') ? 'video' : 'image';
                await dispatch(createStory({ mediaUrl: url, mediaType })).unwrap();
            } else if (storyType === 'text') {
                // For text stories, pass text as caption with a placeholder media
                await dispatch(createStory({ mediaUrl: '', mediaType: 'image', caption: text })).unwrap();
            }

            // Reset form
            setSelectedFile(null);
            setPreview('');
            setText('');
            setBackgroundColor('#6366f1');
            onClose();
        } catch (error) {
            console.error('Failed to create story:', error);
            alert('Failed to create story. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Story</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-full transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Story Type Selector */}
                <div className="flex border-b border-gray-200 dark:border-dark-border">
                    <button
                        onClick={() => setStoryType('media')}
                        className={`flex-1 py-3 font-medium transition ${storyType === 'media'
                            ? 'text-primary-600 border-b-2 border-primary-600'
                            : 'text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        <Image className="w-5 h-5 inline mr-2" />
                        Photo/Video
                    </button>
                    <button
                        onClick={() => setStoryType('text')}
                        className={`flex-1 py-3 font-medium transition ${storyType === 'text'
                            ? 'text-primary-600 border-b-2 border-primary-600'
                            : 'text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        <Type className="w-5 h-5 inline mr-2" />
                        Text
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                    {storyType === 'media' ? (
                        preview ? (
                            <div className="relative aspect-[9/16] bg-black">
                                {selectedFile?.type.startsWith('video') ? (
                                    <video src={preview} className="w-full h-full object-contain" controls />
                                ) : (
                                    <img src={preview} alt="Story preview" className="w-full h-full object-contain" />
                                )}
                                <button
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreview('');
                                    }}
                                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-[9/16] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-hover transition p-8"
                            >
                                <div className="w-20 h-20 mb-4 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-full flex items-center justify-center">
                                    <Image className="w-10 h-10 text-primary-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Add Photo or Video
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                                    Click to select from your computer
                                </p>
                                <Button>Select File</Button>
                            </div>
                        )
                    ) : (
                        <div
                            className="aspect-[9/16] flex items-center justify-center p-8"
                            style={{ backgroundColor }}
                        >
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type your story..."
                                className="w-full h-full bg-transparent text-white text-2xl font-bold text-center resize-none focus:outline-none placeholder-white/50"
                                maxLength={200}
                            />
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {/* Text Story Color Picker */}
                    {storyType === 'text' && (
                        <div className="p-4 border-t border-gray-200 dark:border-dark-border">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                <Palette className="w-4 h-4 inline mr-1" />
                                Background Color
                            </label>
                            <div className="flex gap-2">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setBackgroundColor(color)}
                                        className={`w-10 h-10 rounded-full transition ${backgroundColor === color ? 'ring-4 ring-primary-500 ring-offset-2' : ''
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-dark-border flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isUploading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            (storyType === 'media' && !selectedFile) ||
                            (storyType === 'text' && !text.trim()) ||
                            isUploading
                        }
                        isLoading={isUploading}
                    >
                        {isUploading ? 'Sharing...' : 'Share Story'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
