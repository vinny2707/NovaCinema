import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { theaterApi } from '../../../api/endpoints/theater.api';
import type { Theater, CreateTheaterDto, UpdateTheaterDto } from '../../../api/endpoints/theater.api';
import { useToast } from '../../../components/common/ToastProvider';

interface Props {
    theater: Theater | null;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddEditTheaterModal({ theater, onClose, onSuccess }: Props) {
    const [formData, setFormData] = useState<CreateTheaterDto>({
        theaterName: '',
        address: '',
        hotline: '',
    });
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    useEffect(() => {
        if (theater) {
            setFormData({
                theaterName: theater.theaterName,
                address: theater.address,
                hotline: theater.hotline,
            });
            setIsActive(theater.isActive);
        } else {
            setFormData({
                theaterName: '',
                address: '',
                hotline: '',
            });
            setIsActive(true);
        }
    }, [theater]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.theaterName.trim() || !formData.address.trim() || !formData.hotline.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        // Validate theater name must contain at least one letter (not only numbers)
        const hasLetters = /[a-zA-Z]/.test(formData.theaterName);
        if (!hasLetters) {
            setError('Theater name must contain at least one letter (cannot be only numbers)');
            return;
        }

        // Validate address must contain at least one letter (not only numbers)
        const hasLettersInAddress = /[a-zA-Z]/.test(formData.address);
        if (!hasLettersInAddress) {
            setError('Address must contain at least one letter (cannot be only numbers)');
            return;
        }

        // Validate hotline must be numbers only
        if (!/^[0-9\s\-+()]+$/.test(formData.hotline)) {
            setError('Hotline must contain only numbers, spaces, and characters: - + ( )');
            return;
        }

        setLoading(true);
        try {
            if (theater) {
                const updateData: UpdateTheaterDto = {
                    ...formData,
                    isActive,
                };
                await theaterApi.update(theater._id, updateData);
                toast.push('Theater updated successfully', 'success');
            } else {
                await theaterApi.create(formData);
                toast.push('Theater created successfully', 'success');
            }
            onSuccess?.();
            onClose();
        } catch (err: any) {
            setError(err?.message || 'Failed to save theater');
            toast.push(err?.message || 'Failed to save theater', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {theater ? 'Edit Theater' : 'Add New Theater'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Theater Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Theater Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="theaterName"
                            value={formData.theaterName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="e.g., CGV Vincom or BHD Star 2"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Must contain at least one letter</p>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="e.g., 2 Hai Trieu, District 1"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Must contain at least one letter</p>
                    </div>

                    {/* Hotline */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hotline <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="hotline"
                            value={formData.hotline}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="1900 2099 or 028-1234-5678"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Only numbers and characters: - + ( ) are allowed</p>
                    </div>

                    {/* Active Status (only for edit) */}
                    {theater && (
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="w-4 h-4 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400"
                                />
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </label>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-[#10142C] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : theater ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
