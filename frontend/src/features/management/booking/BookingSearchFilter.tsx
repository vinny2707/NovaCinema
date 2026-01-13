import { Search, Filter } from 'lucide-react';
import { SearchableMovieSelect } from '../../../components/common/SearchableMovieSelect';
import { SearchableTheaterSelect } from '../../../components/common/SearchableTheaterSelect';
import type { Movie } from '../../../api/endpoints/movie.api';
import type { Theater } from '../../../api/endpoints/theater.api';

export interface BookingFilterValues {
    search: string;
    status: string;
    movieId: string;
    theaterId: string;
    fromDate: string;
    toDate: string;
}

interface Props {
    filters: BookingFilterValues;
    onFilterChange: (filters: BookingFilterValues) => void;
    movies: Movie[];
    theaters: Theater[];
}

export default function BookingSearchFilter({ filters, onFilterChange, movies, theaters }: Props) {

    const handleClearFilters = () => {
        onFilterChange({
            search: '',
            status: '',
            movieId: '',
            theaterId: '',
            fromDate: '',
            toDate: '',
        });
    };

    const updateFilter = (key: keyof BookingFilterValues, value: string) => {
        onFilterChange({
            ...filters,
            [key]: value,
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Search */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => updateFilter('search', e.target.value)}
                            placeholder="User, Booking ID..."
                            className="w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => updateFilter('status', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                        <option value="">All Statuses</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PENDING_PAYMENT">Pending Payment</option>
                        <option value="DRAFT">Draft</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="EXPIRED">Expired</option>
                    </select>
                </div>

                {/* Movie Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Movie</label>
                    <SearchableMovieSelect
                        movies={movies}
                        value={filters.movieId}
                        onChange={(movieId) => updateFilter('movieId', movieId)}
                        placeholder="All Movies"
                    />
                </div>

                {/* Theater Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Theater</label>
                    <SearchableTheaterSelect
                        theaters={theaters}
                        value={filters.theaterId}
                        onChange={(theaterId) => updateFilter('theaterId', theaterId)}
                        placeholder="All Theaters"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* From Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                    <input
                        type="date"
                        value={filters.fromDate}
                        onChange={(e) => updateFilter('fromDate', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>

                {/* To Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                    <input
                        type="date"
                        value={filters.toDate}
                        onChange={(e) => updateFilter('toDate', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>

                {/* Clear Button */}
                <div className="lg:col-span-2 flex items-end justify-end">
                    <button
                        onClick={handleClearFilters}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium px-4 py-2 transition-colors"
                    >
                        <Filter size={18} />
                        Clear Filters
                    </button>
                </div>
            </div>
        </div>
    );
}
