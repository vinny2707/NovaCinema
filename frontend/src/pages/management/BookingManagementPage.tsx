/**
 * BookingManagementPage
 * Admin page for managing bookings
 */

import { useState, useEffect } from 'react';
import BookingHeader from '../../features/management/booking/BookingHeader';
import BookingSearchFilter, { type BookingFilterValues } from '../../features/management/booking/BookingSearchFilter';
import BookingTable from '../../features/management/booking/BookingTable';
import BookingDetailModal from '../../features/management/booking/BookingDetailModal';
import type { Booking } from '../../api/endpoints/booking.api';
import { movieApi, type Movie } from '../../api/endpoints/movie.api';
import { theaterApi, type Theater } from '../../api/endpoints/theater.api';

export default function BookingManagementPage() {
    const [filters, setFilters] = useState<BookingFilterValues>({
        search: '',
        status: '',
        movieId: '',
        theaterId: '',
        fromDate: '',
        toDate: '',
    });
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Dropdown data
    const [movies, setMovies] = useState<Movie[]>([]);
    const [theaters, setTheaters] = useState<Theater[]>([]);

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Load movies and theaters for search filters
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [moviesResponse, theatersData] = await Promise.all([
                    movieApi.getAllMoviesWithFilters({ limit: 1000 }),
                    theaterApi.getList()
                ]);
                setMovies(moviesResponse.items || []);
                setTheaters(theatersData || []);
            } catch (err) {
                console.error("Failed to fetch dropdown data:", err);
            }
        };
        fetchDropdownData();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search]);

    const handleFilterChange = (newFilters: BookingFilterValues) => {
        setFilters(newFilters);
        setPage(1); // Reset to page 1 when filters change
    };

    const handleViewDetail = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowDetailModal(true);
    };

    const handleCloseDetail = () => {
        setShowDetailModal(false);
        setSelectedBooking(null);
    };

    return (
        <div>
            <BookingHeader />
            
            <BookingSearchFilter 
                filters={filters}
                onFilterChange={handleFilterChange}
                movies={movies}
                theaters={theaters}
            />
            
            <BookingTable
                search={debouncedSearch}
                status={filters.status}
                movieId={filters.movieId}
                theaterId={filters.theaterId}
                fromDate={filters.fromDate}
                toDate={filters.toDate}
                page={page}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                }}
                onViewDetail={handleViewDetail}
            />

            <BookingDetailModal
                booking={selectedBooking}
                isOpen={showDetailModal}
                onClose={handleCloseDetail}
            />
        </div>
    );
}
