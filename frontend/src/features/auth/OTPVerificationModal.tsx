import { useState, useEffect } from 'react';
import { authApi } from '../../api/endpoints/auth.api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { X, Clock } from 'lucide-react';

interface OTPVerificationModalProps {
    email: string;
    onSuccess: () => void;
    onClose: () => void;
}

export const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
    email,
    onSuccess,
    onClose,
}) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(30);
    const [canResend, setCanResend] = useState(false);

    // OTP validity countdown (5 minutes = 300 seconds)
    const [otpValidityCountdown, setOtpValidityCountdown] = useState(300);
    const [isOtpExpired, setIsOtpExpired] = useState(false);

    // Countdown timer for resend button
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendCountdown]);

    // OTP validity countdown timer
    useEffect(() => {
        if (otpValidityCountdown > 0 && !isOtpExpired) {
            const timer = setTimeout(() => setOtpValidityCountdown(otpValidityCountdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (otpValidityCountdown === 0) {
            setIsOtpExpired(true);
            setError('OTP has expired. Please request a new one.');
        }
    }, [otpValidityCountdown, isOtpExpired]);

    // Format seconds to MM:SS
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!otp.trim()) {
            setError('Please enter OTP code');
            return;
        }

        if (otp.length !== 6) {
            setError('OTP must be 6 digits');
            return;
        }

        if (isOtpExpired) {
            setError('OTP has expired. Please request a new one.');
            return;
        }

        setIsVerifying(true);

        try {
            await authApi.verifyEmail(email, otp);
            console.log('✅ Email verified successfully');
            onSuccess();
        } catch (error: unknown) {
            console.error('❌ OTP verification error:', error);
            // Handle API error object from apiClient (contains message property)
            const apiError = error as { message?: string };
            const message = apiError?.message || 'Invalid OTP. Please try again.';
            setError(message);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setIsResending(true);

        try {
            await authApi.resendOTP(email);
            console.log('✅ OTP resent successfully');

            // Reset both timers
            setResendCountdown(30);
            setOtpValidityCountdown(300); // Reset to 5 minutes
            setIsOtpExpired(false);
            setCanResend(false);
            setOtp('');
        } catch (error: unknown) {
            console.error('❌ Resend OTP error:', error);
            // Handle API error object from apiClient (contains message property)
            const apiError = error as { message?: string };
            const message = apiError?.message || 'Failed to resend OTP. Please try again.';
            setError(message);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
                    <p className="text-sm text-gray-600 mb-3">
                        We've sent a 6-digit verification code to <strong>{email}</strong>
                    </p>

                    {/* OTP Validity Countdown */}
                    <div className={`flex items-center gap-2 text-sm font-medium ${otpValidityCountdown < 60 ? 'text-red-600' : 'text-purple-600'
                        }`}>
                        <Clock size={16} />
                        <span>
                            Code expires in: {formatTime(otpValidityCountdown)}
                        </span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleVerify} className="space-y-4">
                    {error && (
                        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Enter OTP Code"
                        type="text"
                        required
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setOtp(value);
                            setError('');
                        }}
                        maxLength={6}
                        className="text-center text-2xl tracking-widest font-mono"
                        autoFocus
                    />

                    <Button
                        type="submit"
                        intent="primary"
                        disabled={isVerifying || otp.length !== 6 || isOtpExpired}
                        className="w-full !bg-yellow-400 hover:!bg-yellow-500 font-bold text-base py-3 disabled:!bg-gray-300"
                    >
                        {isVerifying ? 'VERIFYING...' : isOtpExpired ? 'OTP EXPIRED' : 'VERIFY EMAIL'}
                    </Button>

                    {/* Resend OTP */}
                    <div className="text-center text-sm">
                        <span className="text-gray-600">Didn't receive the code? </span>
                        {canResend ? (
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={isResending}
                                className="font-semibold text-purple-600 hover:text-purple-700 hover:underline disabled:opacity-50"
                            >
                                {isResending ? 'Sending...' : 'Resend OTP'}
                            </button>
                        ) : (
                            <span className="text-gray-500">
                                Resend in {resendCountdown}s
                            </span>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
