import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { CreatePostModal } from '../post/CreatePostModal';
import { CreateStoryModal } from '../story/CreateStoryModal';
import { CreateReelModal } from '../reel/CreateReelModal';

export const Layout: React.FC = () => {
    const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
    const [isReelModalOpen, setIsReelModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
            {/* Navbar */}
            <Navbar />

            {/* Sidebar */}
            <Sidebar />


            {/* Main Content */}
            <main className="pt-16 lg:pl-64 pb-16 lg:pb-0">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Navigation */}
            <MobileNav />

            {/* Global Modals */}
            <CreatePostModal />
            <CreateStoryModal
                isOpen={isStoryModalOpen}
                onClose={() => setIsStoryModalOpen(false)}
            />
            <CreateReelModal
                isOpen={isReelModalOpen}
                onClose={() => setIsReelModalOpen(false)}
            />
        </div>
    );
};
