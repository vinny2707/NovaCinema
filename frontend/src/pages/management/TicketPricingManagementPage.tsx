/**
 * TicketPricingManagementPage
 * Admin page for managing ticket pricing configuration
 */

import { useState, useEffect } from 'react';
import { Save, DollarSign, Calendar, Users, Film, Loader2 } from 'lucide-react';
import { pricingConfigApi } from '../../api/endpoints/ticket.api';
import type { PricingConfig, UpdatePricingConfigDto } from '../../api/endpoints/ticket.api';
import { useToast } from '../../components/common/ToastProvider';

export default function TicketPricingManagementPage() {
    const toast = useToast();
    const [config, setConfig] = useState<PricingConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // Form state
    const [basePrice, setBasePrice] = useState(0);
    const [seatModifiers, setSeatModifiers] = useState({
        NORMAL: 0,
        VIP: 0,
        COUPLE: 0,
    });
    const [roomModifiers, setRoomModifiers] = useState({
        '2D': 0,
        '3D': 0,
        'VIP': 0,
    });
    const [dayModifiers, setDayModifiers] = useState({
        MON: 0,
        TUE: 0,
        WED: 0,
        THU: 0,
        FRI: 0,
        SAT: 0,
        SUN: 0,
    });

    useEffect(() => {
        loadPricingConfig();
    }, []);

    const loadPricingConfig = async () => {
        try {
            setLoading(true);
            const data = await pricingConfigApi.getPricingConfig();
            setConfig(data);

            // Populate form
            setBasePrice(data.basePrice);

            // Populate seat modifiers
            const seatMods = { NORMAL: 0, VIP: 0, COUPLE: 0 };
            data.modifiers.seatTypes.forEach(mod => {
                seatMods[mod.seatType] = mod.deltaPrice;
            });
            setSeatModifiers(seatMods);

            // Populate room modifiers
            const roomMods = { '2D': 0, '3D': 0, 'VIP': 0 };
            data.modifiers.roomTypes.forEach(mod => {
                roomMods[mod.roomType] = mod.deltaPrice;
            });
            setRoomModifiers(roomMods);

            // Populate day modifiers
            const dayMods = { MON: 0, TUE: 0, WED: 0, THU: 0, FRI: 0, SAT: 0, SUN: 0 };
            data.modifiers.daysOfWeek.forEach(mod => {
                dayMods[mod.dayOfWeek] = mod.deltaPrice;
            });
            setDayModifiers(dayMods);
        } catch (error: unknown) {
            console.error('Failed to load pricing config:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to load pricing configuration';
            toast.push(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const updateData: UpdatePricingConfigDto = {
                basePrice,
                modifiers: {
                    seatTypes: [
                        { seatType: 'NORMAL', deltaPrice: seatModifiers.NORMAL },
                        { seatType: 'VIP', deltaPrice: seatModifiers.VIP },
                        { seatType: 'COUPLE', deltaPrice: seatModifiers.COUPLE },
                    ],
                    roomTypes: [
                        { roomType: '2D', deltaPrice: roomModifiers['2D'] },
                        { roomType: '3D', deltaPrice: roomModifiers['3D'] },
                        { roomType: 'VIP', deltaPrice: roomModifiers['VIP'] },
                    ],
                    daysOfWeek: [
                        { dayOfWeek: 'MON', deltaPrice: dayModifiers.MON },
                        { dayOfWeek: 'TUE', deltaPrice: dayModifiers.TUE },
                        { dayOfWeek: 'WED', deltaPrice: dayModifiers.WED },
                        { dayOfWeek: 'THU', deltaPrice: dayModifiers.THU },
                        { dayOfWeek: 'FRI', deltaPrice: dayModifiers.FRI },
                        { dayOfWeek: 'SAT', deltaPrice: dayModifiers.SAT },
                        { dayOfWeek: 'SUN', deltaPrice: dayModifiers.SUN },
                    ],
                },
            };

            const updated = await pricingConfigApi.updatePricingConfig(updateData);
            setConfig(updated);
            setEditMode(false);
            toast.push('Pricing configuration updated successfully!', 'success');
        } catch (error: unknown) {
            console.error('Failed to update pricing config:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to update pricing configuration';
            toast.push(errorMessage, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (config) {
            // Reset form to original values
            setBasePrice(config.basePrice);

            const seatMods = { NORMAL: 0, VIP: 0, COUPLE: 0 };
            config.modifiers.seatTypes.forEach(mod => {
                seatMods[mod.seatType] = mod.deltaPrice;
            });
            setSeatModifiers(seatMods);

            const roomMods = { '2D': 0, '3D': 0, 'VIP': 0 };
            config.modifiers.roomTypes.forEach(mod => {
                roomMods[mod.roomType] = mod.deltaPrice;
            });
            setRoomModifiers(roomMods);

            const dayMods = { MON: 0, TUE: 0, WED: 0, THU: 0, FRI: 0, SAT: 0, SUN: 0 };
            config.modifiers.daysOfWeek.forEach(mod => {
                dayMods[mod.dayOfWeek] = mod.deltaPrice;
            });
            setDayModifiers(dayMods);
        }
        setEditMode(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const calculateExamplePrice = (seatType: keyof typeof seatModifiers, roomType: keyof typeof roomModifiers, day: keyof typeof dayModifiers) => {
        return basePrice + seatModifiers[seatType] + roomModifiers[roomType] + dayModifiers[day];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-yellow-400" size={48} />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Ticket Pricing Configuration</h1>
                    <p className="text-gray-600 mt-2">Manage base price and pricing modifiers</p>
                </div>
                {!editMode ? (
                    <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-[#10142C] font-semibold px-6 py-3 rounded-lg transition-colors shadow-md"
                    >
                        <DollarSign size={20} />
                        Edit Pricing
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-[#10142C] font-semibold px-6 py-3 rounded-lg transition-colors shadow-md disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Base Price</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(basePrice)}</p>
                        </div>
                        <DollarSign size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Min Price</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(calculateExamplePrice('NORMAL', '2D', 'MON'))}</p>
                        </div>
                        <Calendar size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">VIP Weekend</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(calculateExamplePrice('VIP', '3D', 'SUN'))}</p>
                        </div>
                        <Users size={40} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm">Max Price</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(calculateExamplePrice('COUPLE', 'VIP', 'SUN'))}</p>
                        </div>
                        <Film size={40} className="opacity-80" />
                    </div>
                </div>
            </div>

            {/* Base Price Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Base Price</h2>
                <div className="max-w-md">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Ticket Price (VND)
                    </label>
                    <input
                        type="number"
                        value={basePrice}
                        onChange={(e) => setBasePrice(Number(e.target.value))}
                        disabled={!editMode}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100 disabled:cursor-not-allowed text-lg font-semibold"
                        min="0"
                        step="1000"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                        This is the base price before any modifiers are applied
                    </p>
                </div>
            </div>

            {/* Seat Type Modifiers */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Seat Type Modifiers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(seatModifiers).map(([type, delta]) => (
                        <div key={type}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {type} Seat
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500">+</span>
                                <input
                                    type="number"
                                    value={delta}
                                    onChange={(e) => setSeatModifiers({ ...seatModifiers, [type]: Number(e.target.value) })}
                                    disabled={!editMode}
                                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    min="0"
                                    step="1000"
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Final: {formatCurrency(basePrice + delta)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Room Type Modifiers */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Room Type Modifiers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(roomModifiers).map(([type, delta]) => (
                        <div key={type}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {type} Room
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500">+</span>
                                <input
                                    type="number"
                                    value={delta}
                                    onChange={(e) => setRoomModifiers({ ...roomModifiers, [type]: Number(e.target.value) })}
                                    disabled={!editMode}
                                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    min="0"
                                    step="1000"
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Final: {formatCurrency(basePrice + delta)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Day of Week Modifiers */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Day of Week Modifiers</h2>
                <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                    {Object.entries(dayModifiers).map(([day, delta]) => (
                        <div key={day}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {day}
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500">+</span>
                                <input
                                    type="number"
                                    value={delta}
                                    onChange={(e) => setDayModifiers({ ...dayModifiers, [day]: Number(e.target.value) })}
                                    disabled={!editMode}
                                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    min="0"
                                    step="1000"
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {formatCurrency(basePrice + delta)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pricing Formula Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-2">💡 Pricing Formula</h3>
                <p className="text-blue-800">
                    <strong>Final Price</strong> = Base Price + Seat Type Modifier + Room Type Modifier + Day of Week Modifier
                </p>
                <p className="text-blue-700 mt-2 text-sm">
                    Example: For a VIP seat in a 3D room on Sunday = {formatCurrency(basePrice)} + {formatCurrency(seatModifiers.VIP)} + {formatCurrency(roomModifiers['3D'])} + {formatCurrency(dayModifiers.SUN)} = <strong>{formatCurrency(calculateExamplePrice('VIP', '3D', 'SUN'))}</strong>
                </p>
            </div>
        </div>
    );
}
