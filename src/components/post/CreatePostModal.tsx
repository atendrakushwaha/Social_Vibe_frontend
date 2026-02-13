import React, { useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { closeCreatePostModal } from '../../store/slices/uiSlice';
import { createPost } from '../../store/slices/postSlice';
import { Button } from '../common/Button';
import { X, Image, MapPin, Smile } from 'lucide-react';

export const CreatePostModal: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isCreatePostModalOpen } = useAppSelector((state) => state.ui);
    const [caption, setCaption] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [location, setLocation] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(files);

        // Create previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
    };

    const handleSubmit = async () => {
        if (selectedFiles.length === 0) {
            alert('Please select at least one image or video');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('files', file);
            });
            formData.append('caption', caption);
            if (location) {
                formData.append('location', JSON.stringify({ name: location }));
            }

            await dispatch(createPost(formData)).unwrap();

            // Reset form
            setCaption('');
            setSelectedFiles([]);
            setPreviews([]);
            setLocation('');
            dispatch(closeCreatePostModal());
        } catch (error) {
            console.error('Failed to create post:', error);
            alert('Failed to create post. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    if (!isCreatePostModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Post</h2>
                    <button
                        onClick={() => dispatch(closeCreatePostModal())}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-full transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* File Upload Area */}
                    {previews.length === 0 ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="p-12 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-hover transition"
                        >
                            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-full flex items-center justify-center">
                                <Image className="w-10 h-10 text-primary-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Drag photos and videos here
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                or click to select from your computer
                            </p>
                            <Button>Select Files</Button>
                        </div>
                    ) : (
                        <div className="p-4">
                            {/* Preview Grid */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {previews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <X className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Add More Button */}
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full mb-4"
                            >
                                <Image className="w-4 h-4 mr-2" />
                                Add More Files
                            </Button>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {/* Caption and Details */}
                    <div className="p-4 space-y-4 border-t border-gray-200 dark:border-dark-border">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Caption
                            </label>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Write a caption... (use #hashtags and @mentions)"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                rows={4}
                                maxLength={2200}
                            />
                            <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {caption.length}/2200
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                Add Location
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Enter location"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-dark-border flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => dispatch(closeCreatePostModal())}
                        disabled={isUploading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={selectedFiles.length === 0 || isUploading}
                        isLoading={isUploading}
                    >
                        {isUploading ? 'Posting...' : 'Share Post'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
