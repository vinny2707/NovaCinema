import { useQuery } from "@tanstack/react-query";
import { movieApi } from "../api/endpoints/movie.api";
import { MovieCard } from "../features/movies/MovieCard";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { MovieListPageSkeleton } from "../features/movies/MovieListPageSkeleton";
import { useSearchParams } from "react-router-dom";

export default function SearchResultsPage() {
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('q') || '';
    const [currentPage, setCurrentPage] = useState(1);
    const moviesPerPage = 12;

    // Reset to page 1 when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const { data: response, isLoading } = useQuery({
        queryKey: ['movies', 'search', searchQuery, currentPage],
        queryFn: () => movieApi.getAllMoviesWithFilters({
            search: searchQuery,
            page: currentPage,
            limit: moviesPerPage
        }),
        enabled: !!searchQuery, // Only run query if there's a search term
    });

    if (isLoading) {
        return (
            <MovieListPageSkeleton
                title={`Search Results for "${searchQuery}"`}
                subtitle="Finding movies that match your search..."
            />
        );
    }

    const movies = response?.items || [];
    const totalPages = response?.totalPages || 0;
    const total = response?.total || 0;

    // Hàm chuyển trang
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    //array các số trang để hiển thị
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 5; i++) pages.push(i);
            } else if (currentPage >= totalPages - 2) {
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
            }
        }
        return pages;
    };

    return (
        <div className="min-h-screen bg-[#0A0E27] py-16">
            <div className="container mx-auto max-w-7xl px-4">
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Search className="text-yellow-400" size={40} />
                        <h1 className="text-5xl font-bold text-white uppercase tracking-wide"
                            style={{ fontFamily: 'Anton, sans-serif' }}>
                            Search Results
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg">
                        {searchQuery ? (
                            <>Showing results for <span className="text-yellow-400 font-semibold">"{searchQuery}"</span></>
                        ) : (
                            'Enter a search term to find movies'
                        )}
                    </p>
                    {response && searchQuery && (
                        <p className="text-gray-500 text-sm mt-2">
                            Found {total} {total === 1 ? 'movie' : 'movies'}
                            {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                        </p>
                    )}
                </div>

                {/* Movies Grid */}
                {movies.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                        {movies.map((movie) => (
                            <MovieCard key={movie._id} movie={movie} />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {movies.length === 0 && searchQuery && (
                    <div className="text-center text-gray-400 py-20">
                        <Search className="mx-auto mb-4 text-gray-600" size={64} />
                        <p className="text-2xl font-semibold mb-2">No movies found</p>
                        <p className="text-lg">
                            No results for <span className="text-yellow-400">"{searchQuery}"</span>
                        </p>
                        <p className="text-sm mt-4">Try searching with different keywords</p>
                    </div>
                )}

                {/* No Search Query State */}
                {!searchQuery && (
                    <div className="text-center text-gray-400 py-20">
                        <Search className="mx-auto mb-4 text-gray-600" size={64} />
                        <p className="text-2xl font-semibold mb-2">Start Your Search</p>
                        <p className="text-lg">
                            Use the search box in the header to find movies
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {/* Previous Button */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition-colors ${currentPage === 1
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-800 text-white hover:bg-yellow-400 hover:text-[#10142C]'
                                }`}
                        >
                            <ChevronLeft size={24} />
                        </button>

                        {/* Page Numbers */}
                        {getPageNumbers().map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${currentPage === pageNum
                                    ? 'bg-yellow-400 text-[#10142C]'
                                    : 'bg-gray-800 text-white hover:bg-gray-700'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        ))}

                        {/* Next Button */}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition-colors ${currentPage === totalPages
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-800 text-white hover:bg-yellow-400 hover:text-[#10142C]'
                                }`}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
