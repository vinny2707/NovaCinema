import React, { useState } from 'react';
import { authApi, type LoginParams } from '../../api/endpoints/auth.api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
    onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState<LoginParams>({
        email: '',
        password: '',
    });
    const [keepSignedIn, setKeepSignedIn] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof LoginParams, string>>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string>('');

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof LoginParams, string>> = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await authApi.login(formData);

            // Use AuthContext login function to update global state
            login(response.user, response.accessToken, response.refreshToken);

            // Handle "Keep me signed in"
            if (keepSignedIn) {
                localStorage.setItem('keepSignedIn', 'true');
            }

            onSuccess?.();
        } catch (error: unknown) {
            // Handle API error object from apiClient (contains message property)
            const apiError = error as { message?: string };
            const message = apiError?.message || 'Login failed. Please check your credentials.';
            setApiError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof LoginParams) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <Input
                label="Email"
                type="email"
                required
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange('email')}
                error={errors.email}
                autoComplete="email"
            />

            <Input
                label="Password"
                type="password"
                required
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange('password')}
                error={errors.password}
                showPasswordToggle
                autoComplete="current-password"
            />

            {apiError && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                    {apiError}
                </div>
            )}

            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={keepSignedIn}
                        onChange={(e) => setKeepSignedIn(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 cursor-pointer focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Keep me signed in</span>
                </label>

                <button
                    type="button"
                    onClick={() => window.location.href = '/forgot-password'}
                    className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
                >
                    Forgot Password?
                </button>
            </div>

            <Button
                type="submit"
                intent="primary"
                disabled={isLoading}
                className="w-full !bg-yellow-400 hover:!bg-yellow-500 font-bold text-base py-3"
            >
                {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
            </Button>


        </form>
    );
};
