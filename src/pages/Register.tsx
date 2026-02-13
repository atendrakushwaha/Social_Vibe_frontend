import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';

export const Register: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 dark:from-dark-bg dark:via-dark-bg dark:to-dark-bg px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-4 shadow-glow">
                        <span className="text-white font-bold text-3xl">S</span>
                    </div>
                    <h1 className="text-4xl font-display font-bold gradient-text mb-2">
                        SocialVibe
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Join our community today
                    </p>
                </div>

                {/* Register Form Card */}
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-dark-border">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Create your account
                    </h2>
                    <RegisterForm />
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
                    © 2026 SocialVibe. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Register;
