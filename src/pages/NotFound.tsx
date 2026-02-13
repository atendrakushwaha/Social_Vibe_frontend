import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg px-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold gradient-text">404</h1>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4 mb-2">
                    Page Not Found
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Sorry, the page you're looking for doesn't exist.
                </p>
                <Link to="/" className="btn-primary">
                    Go Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
