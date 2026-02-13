import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { register } from '../../store/slices/authSlice';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const RegisterForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        fullName: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9._]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain letters, numbers, dots, and underscores';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);
        try {
            const { confirmPassword, ...registerData } = formData;
            await dispatch(register(registerData)).unwrap();
            toast.success('Account created successfully!');
            navigate('/');
        } catch (error: any) {
            toast.error(error || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                type="email"
                name="email"
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={<EnvelopeIcon className="w-5 h-5" />}
                fullWidth
                autoComplete="email"
            />

            <Input
                type="text"
                name="username"
                label="Username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
                icon={<UserIcon className="w-5 h-5" />}
                fullWidth
                autoComplete="username"
            />

            <Input
                type="text"
                name="fullName"
                label="Full Name (Optional)"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                icon={<UserIcon className="w-5 h-5" />}
                fullWidth
                autoComplete="name"
            />

            <Input
                type="password"
                name="password"
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                icon={<LockClosedIcon className="w-5 h-5" />}
                fullWidth
                autoComplete="new-password"
            />

            <Input
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                icon={<LockClosedIcon className="w-5 h-5" />}
                fullWidth
                autoComplete="new-password"
            />

            <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
                Sign Up
            </Button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                    to="/login"
                    className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                >
                    Log in
                </Link>
            </p>
        </form>
    );
};
