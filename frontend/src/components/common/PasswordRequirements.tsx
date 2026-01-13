import React from 'react';

interface PasswordRequirementsProps {
    password: string;
    className?: string;
}

/**
 * PasswordRequirements Component
 * Displays password requirements with visual feedback
 * - Shows green checkmark (✓) when requirement is met
 * - Shows gray bullet (•) when requirement is not met
 */
export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password, className = '' }) => {
    // Live validation checks
    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    const requirements = [
        { met: hasMinLength, text: 'At least 8 characters' },
        { met: hasUpper, text: 'Contains uppercase letter (A-Z)' },
        { met: hasLower, text: 'Contains lowercase letter (a-z)' },
        { met: hasNumber, text: 'Contains number (0-9)' },
        { met: hasSpecial, text: 'Contains special character' },
    ];

    return (
        <div className={`mt-2 text-xs ${className}`}>
            <p className="font-semibold mb-1 text-gray-700">Password requirements:</p>
            <ul className="space-y-1">
                {requirements.map((req, index) => (
                    <li
                        key={index}
                        className={req.met ? 'text-green-600 font-medium' : 'text-gray-500'}
                    >
                        {req.met ? '✓' : '•'} {req.text}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PasswordRequirements;
