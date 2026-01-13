import React, { useEffect, useState, useMemo } from 'react';
import { theaterApi, type Theater } from '../../api/endpoints/theater.api';
import { MapPin } from 'lucide-react';

interface TheaterSelectorProps {
    selectedTheaterId: string;
    onTheaterSelect: (theaterId: string) => void;
}

/**
 * Extract city/province from address
 * Vietnamese addresses typically end with: "..., District, City/Province"
 */
const extractCityFromAddress = (address: string): string => {
    const parts = address.split(',').map(s => s.trim());
    // Get the last part (usually the city/province)
    return parts[parts.length - 1] || 'Khác';
};

export const TheaterSelector: React.FC<TheaterSelectorProps> = ({
    selectedTheaterId,
    onTheaterSelect,
}) => {
    const [allTheaters, setAllTheaters] = useState<Theater[]>([]);
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    // Dynamically extract unique cities from theater addresses
    const cities = useMemo(() => {
        const uniqueCities = new Set<string>();
        allTheaters.forEach((theater) => {
            const city = extractCityFromAddress(theater.address);
            uniqueCities.add(city);
        });
        return Array.from(uniqueCities).sort();
    }, [allTheaters]);

    // Filter theaters by selected city
    const filteredTheaters = useMemo(() => {
        if (!selectedCity) return allTheaters;
        return allTheaters.filter((theater) => {
            const city = extractCityFromAddress(theater.address);
            return city === selectedCity;
        });
    }, [selectedCity, allTheaters]);

    useEffect(() => {
        const fetchTheaters = async () => {
            try {
                setIsLoading(true);
                const data = await theaterApi.getList();
                setAllTheaters(data);

                // Auto-select first city if available
                if (data.length > 0 && !selectedCity) {
                    const firstCity = extractCityFromAddress(data[0].address);
                    setSelectedCity(firstCity);
                }
            } catch (error) {
                console.error('Failed to fetch theaters:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTheaters();
    }, []);

    if (isLoading) {
        return (
            <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Anton, sans-serif' }}>
                CHỌN RẠP
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* City Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        <MapPin className="inline w-4 h-4 mr-1" />
                        Tỉnh/Thành phố
                    </label>
                    <select
                        value={selectedCity}
                        onChange={(e) => {
                            setSelectedCity(e.target.value);
                            onTheaterSelect(''); // Reset theater selection when city changes
                        }}
                        className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-lg text-white cursor-pointer hover:border-yellow-400 focus:border-yellow-400 focus:outline-none transition-all"
                    >
                        {cities.map((city) => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Theater Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Rạp chiếu ({filteredTheaters.length})
                    </label>
                    <select
                        value={selectedTheaterId}
                        onChange={(e) => onTheaterSelect(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-lg text-white cursor-pointer hover:border-yellow-400 focus:border-yellow-400 focus:outline-none transition-all"
                        disabled={filteredTheaters.length === 0}
                    >
                        <option value="">-- Chọn rạp --</option>
                        {filteredTheaters.map((theater) => (
                            <option key={theater._id} value={theater._id}>
                                {theater.theaterName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Selected Theater Info */}
            {selectedTheaterId && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg border-l-4 border-yellow-400">
                    {(() => {
                        const selectedTheater = allTheaters.find(t => t._id === selectedTheaterId);
                        if (!selectedTheater) return null;
                        return (
                            <div>
                                <h3 className="font-bold text-white">{selectedTheater.theaterName}</h3>
                                <p className="text-sm text-gray-400 mt-1">{selectedTheater.address}</p>
                                {selectedTheater.hotline && (
                                    <p className="text-xs text-gray-500 mt-2">📞 {selectedTheater.hotline}</p>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default TheaterSelector;
