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
            const errorMessage = 
                (error as { message?: string })?.message || 
                (error instanceof Error ? error.message : 'Failed to load pricing configuration');
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
            const errorMessage = 
                (error as { message?: string })?.message || 
                (error instanceof Error ? error.message : 'Failed to update pricing configuration');
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
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-indigo-600" size={56} />
                    <p className="text-gray-600 font-medium">Loading pricing configuration...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Ticket Pricing Configuration</h1>
                    <p className="text-gray-500 mt-2">Manage base price and pricing modifiers</p>
                </div>
                {!editMode ? (
                    <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <DollarSign size={20} />
                        Edit Pricing
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 transform hover:scale-105"
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
                <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-100 text-sm font-medium">Base Price</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(basePrice)}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <DollarSign size={32} className="opacity-90" />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-sm font-medium">Min Price</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(calculateExamplePrice('NORMAL', '2D', 'MON'))}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <Calendar size={32} className="opacity-90" />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-violet-100 text-sm font-medium">VIP Weekend</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(calculateExamplePrice('VIP', '3D', 'SUN'))}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <Users size={32} className="opacity-90" />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-rose-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-rose-100 text-sm font-medium">Max Price</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(calculateExamplePrice('COUPLE', 'VIP', 'SUN'))}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <Film size={32} className="opacity-90" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Base Price Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                        <DollarSign size={24} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Base Price</h2>
                </div>
                <div className="max-w-md">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Ticket Price (VND)
                    </label>
                    <input
                        type="number"
                        value={basePrice}
                        onChange={(e) => setBasePrice(Number(e.target.value))}
                        onFocus={(e) => e.target.select()}
                        disabled={!editMode}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed text-lg font-semibold transition-all"
                        min="0"
                        step="1000"
                    />
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                        <span className="text-indigo-600">ℹ️</span>
                        This is the base price before any modifiers are applied
                    </p>
                </div>
            </div>

            {/* Seat Type Modifiers */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                        <Users size={24} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Seat Type Modifiers</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(seatModifiers).map(([type, delta]) => (
                        <div key={type} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {type} Seat
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-emerald-600 font-semibold">+</span>
                                <input
                                    type="number"
                                    value={delta}
                                    onChange={(e) => setSeatModifiers({ ...seatModifiers, [type]: Number(e.target.value) })}
                                    onFocus={(e) => e.target.select()}
                                    disabled={!editMode}
                                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-white disabled:cursor-not-allowed transition-all"
                                    min="0"
                                    step="1000"
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-2 font-medium">
                                Final: <span className="text-emerald-700">{formatCurrency(basePrice + delta)}</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Room Type Modifiers */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-lg">
                        <Film size={24} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Room Type Modifiers</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(roomModifiers).map(([type, delta]) => (
                        <div key={type} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {type} Room
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-violet-600 font-semibold">+</span>
                                <input
                                    type="number"
                                    value={delta}
                                    onChange={(e) => setRoomModifiers({ ...roomModifiers, [type]: Number(e.target.value) })}
                                    onFocus={(e) => e.target.select()}
                                    disabled={!editMode}
                                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-white disabled:cursor-not-allowed transition-all"
                                    min="0"
                                    step="1000"
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-2 font-medium">
                                Final: <span className="text-violet-700">{formatCurrency(basePrice + delta)}</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Day of Week Modifiers */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg">
                        <Calendar size={24} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Day of Week Modifiers</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                    {Object.entries(dayModifiers).map(([day, delta]) => (
                        <div key={day} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {day}
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-rose-600 font-semibold">+</span>
                                <input
                                    type="number"
                                    value={delta}
                                    onChange={(e) => setDayModifiers({ ...dayModifiers, [day]: Number(e.target.value) })}
                                    onFocus={(e) => e.target.select()}
                                    disabled={!editMode}
                                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-white disabled:cursor-not-allowed transition-all"
                                    min="0"
                                    step="1000"
                                />
                            </div>
                            <p className="text-sm text-gray-600 mt-2 font-medium text-rose-700">
                                {formatCurrency(basePrice + delta)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pricing Formula Info */}
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    <span>Pricing Formula</span>
                </h3>
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 mb-3 border border-indigo-100">
                    <p className="text-indigo-900 font-semibold text-center">
                        <span className="text-indigo-600">Final Price</span> = 
                        <span className="text-purple-600"> Base Price</span> + 
                        <span className="text-emerald-600"> Seat Modifier</span> + 
                        <span className="text-violet-600"> Room Modifier</span> + 
                        <span className="text-rose-600"> Day Modifier</span>
                    </p>
                </div>
                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-4 border border-indigo-200">
                    <p className="text-indigo-900 font-medium mb-2">Example Calculation:</p>
                    <p className="text-indigo-800 text-sm leading-relaxed">
                        VIP seat in 3D room on Sunday = 
                        <span className="font-bold text-purple-700"> {formatCurrency(basePrice)}</span> + 
                        <span className="font-bold text-emerald-700"> {formatCurrency(seatModifiers.VIP)}</span> + 
                        <span className="font-bold text-violet-700"> {formatCurrency(roomModifiers['3D'])}</span> + 
                        <span className="font-bold text-rose-700"> {formatCurrency(dayModifiers.SUN)}</span> = 
                        <span className="font-bold text-lg text-indigo-900"> {formatCurrency(calculateExamplePrice('VIP', '3D', 'SUN'))}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
