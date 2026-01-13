import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { movieApi, type Movie, type CreateMoviePayload } from '../../../api/endpoints/movie.api';
import { useToast } from '../../../components/common/ToastProvider';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    movie?: Movie | null;
}

export default function AddEditMovieModal({ isOpen, onClose, onSuccess, movie }: Props) {
    const [formData, setFormData] = useState<CreateMoviePayload>({
        title: '',
        genres: [],
        duration: 0,
        description: '',
        posterUrl: '',
        trailerUrl: '',
        releaseDate: '',
        endDate: '',
        ratingAge: '',
        country: '',
        language: '',
        actors: [],
        director: '',
        producer: ''
    });
    const [genreInput, setGenreInput] = useState('');
    const [actorInput, setActorInput] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (isOpen && movie) {
            // Debug: log raw endDate from server
            console.log('Movie endDate from server:', movie.endDate, 'Type:', typeof movie.endDate);
            console.log('Movie releaseDate from server:', movie.releaseDate, 'Type:', typeof movie.releaseDate);

            // Helper to extract yyyy-MM-dd from various formats
            const extractDate = (dateValue: string | undefined | null): string => {
                if (!dateValue) return '';
                // If it contains 'T', split by T
                if (dateValue.includes('T')) {
                    return dateValue.split('T')[0];
                }
                // If already in yyyy-MM-dd format
                if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                    return dateValue;
                }
                // Try to parse and format
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                }
                return '';
            };

            setFormData({
                title: movie.title,
                genres: movie.genres,
                duration: movie.duration,
                description: movie.description || '',
                posterUrl: movie.posterUrl || '',
                trailerUrl: movie.trailerUrl || '',
                releaseDate: extractDate(movie.releaseDate),
                endDate: extractDate(movie.endDate),
                ratingAge: movie.ratingAge || '',
                country: movie.country || '',
                language: movie.language || '',
                actors: movie.actors || [],
                director: movie.director || '',
                producer: movie.producer || ''
            });
        } else if (isOpen && !movie) {
            setFormData({
                title: '',
                genres: [],
                duration: 0,
                description: '',
                posterUrl: '',
                trailerUrl: '',
                releaseDate: '',
                endDate: '',
                ratingAge: '',
                country: '',
                language: '',
                actors: [],
                director: '',
                producer: ''
            });
        }
    }, [isOpen, movie]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || formData.genres.length === 0 || !formData.duration) {
            toast.push('Please fill in all required fields', 'error');
            return;
        }

        setLoading(true);
        try {
            // Ensure dates are formatted as yyyy-MM-dd
            const formatDate = (dateStr: string | undefined) => {
                if (!dateStr || dateStr.trim() === '') return undefined;
                // If already in yyyy-MM-dd format, return as is
                if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                    return dateStr;
                }
                // Otherwise try to parse and format
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) return undefined;
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const cleanPayload: any = {
                title: formData.title,
                genres: formData.genres,
                duration: formData.duration,
                description: formData.description || undefined,
                posterUrl: formData.posterUrl || undefined,
                trailerUrl: formData.trailerUrl || undefined,
                releaseDate: formatDate(formData.releaseDate),
                endDate: formatDate(formData.endDate),
                ratingAge: formData.ratingAge || undefined,
                country: formData.country || undefined,
                language: formData.language || undefined,
                actors: formData.actors && formData.actors.length > 0 ? formData.actors : undefined,
                director: formData.director || undefined,
                producer: formData.producer || undefined,
            };

            // Remove undefined and null fields
            Object.keys(cleanPayload).forEach(key => {
                if (cleanPayload[key] === undefined || cleanPayload[key] === null) {
                    delete cleanPayload[key];
                }
            });

            // Debug: log payload
            console.log('Submitting payload:', cleanPayload);
            console.log('Form endDate:', formData.endDate, 'Formatted:', formatDate(formData.endDate));

            if (movie) {
                await movieApi.updateMovie(movie._id, cleanPayload);
                toast.push('Movie updated successfully', 'success');
            } else {
                await movieApi.createMovie(cleanPayload);
                toast.push('Movie created successfully', 'success');
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('API Error:', err);
            console.error('Error response:', err?.response?.data);
            console.error('Errors array:', err?.response?.data?.errors);
            const errorMsg = err?.response?.data?.message || err?.message || 'Failed to save movie';
            toast.push(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddGenre = () => {
        const trimmed = genreInput.trim();
        if (trimmed && !formData.genres.includes(trimmed)) {
            setFormData({ ...formData, genres: [...formData.genres, trimmed] });
            setGenreInput('');
        }
    };

    const handleRemoveGenre = (genre: string) => {
        setFormData({ ...formData, genres: formData.genres.filter(g => g !== genre) });
    };

    const handleAddActor = () => {
        const trimmed = actorInput.trim();
        const currentActors = formData.actors || [];
        if (trimmed && !currentActors.includes(trimmed)) {
            setFormData({ ...formData, actors: [...currentActors, trimmed] });
            setActorInput('');
        }
    };

    const handleRemoveActor = (actor: string) => {
        setFormData({ ...formData, actors: (formData.actors || []).filter(a => a !== actor) });
    };

    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
            <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {movie ? 'Edit Movie' : 'Add New Movie'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                placeholder="Enter movie title"
                                required
                            />
                        </div>

                        {/* Director */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Director
                            </label>
                            <input
                                type="text"
                                value={formData.director}
                                onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                placeholder="Enter director name"
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Duration (minutes) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={formData.duration || ''}
                                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                placeholder="e.g., 120"
                                min="1"
                                required
                            />
                        </div>

                        {/* Producer */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Producer
                            </label>
                            <input
                                type="text"
                                value={formData.producer}
                                onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                placeholder="Enter producer name"
                            />
                        </div>

                        {/* Release Date */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Release Date
                            </label>
                            <input
                                type="date"
                                value={formData.releaseDate}
                                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>

                        {/* Rating Age */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Rating Age
                            </label>
                            <select
                                value={formData.ratingAge}
                                onChange={(e) => setFormData({ ...formData, ratingAge: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            >
                                <option value="">Select rating</option>
                                <option value="P">P - All ages</option>
                                <option value="C13">C13 - 13+</option>
                                <option value="C16">C16 - 16+</option>
                                <option value="C18">C18 - 18+</option>
                            </select>
                        </div>

                        {/* Country */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Country
                            </label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                placeholder="e.g., USA"
                            />
                        </div>

                        {/* Language */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Language
                            </label>
                            <input
                                type="text"
                                value={formData.language}
                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                placeholder="e.g., English"
                            />
                        </div>

                        {/* Poster URL */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Poster URL
                            </label>
                            <input
                                type="url"
                                value={formData.posterUrl}
                                onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                placeholder="https://example.com/poster.jpg"
                            />
                        </div>

                        {/* Trailer URL */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Trailer URL
                            </label>
                            <input
                                type="url"
                                value={formData.trailerUrl}
                                onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                placeholder="https://example.com/trailer.mp4"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            rows={4}
                            placeholder="Enter movie description"
                        />
                    </div>

                    {/* Genres */}
                    <div className="mt-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Genres <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={genreInput}
                                onChange={(e) => setGenreInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGenre())}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                placeholder="Enter genre and press Add"
                            />
                            <button
                                type="button"
                                onClick={handleAddGenre}
                                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-[#10142C] font-semibold rounded-lg transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.genres.map((genre) => (
                                <span
                                    key={genre}
                                    className="inline-flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
                                >
                                    {genre}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveGenre(genre)}
                                        className="text-gray-500 hover:text-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        {formData.genres.length === 0 && (
                            <p className="text-sm text-gray-500 mt-2">No genres added yet</p>
                        )}
                    </div>

                    {/* Actors */}
                    <div className="mt-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Actors
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={actorInput}
                                onChange={(e) => setActorInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddActor())}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                placeholder="Enter actor name and press Add"
                            />
                            <button
                                type="button"
                                onClick={handleAddActor}
                                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-[#10142C] font-semibold rounded-lg transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(formData.actors || []).map((actor) => (
                                <span
                                    key={actor}
                                    className="inline-flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
                                >
                                    {actor}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveActor(actor)}
                                        className="text-gray-500 hover:text-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        {(!formData.actors || formData.actors.length === 0) && (
                            <p className="text-sm text-gray-500 mt-2">No actors added yet</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex gap-4 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-[#10142C] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : movie ? 'Update Movie' : 'Create Movie'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
