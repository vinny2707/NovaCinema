import { useState, useEffect } from 'react';
import TheaterHeader from '../../features/management/theater/TheaterHeader';
import TheaterSearchFilter from '../../features/management/theater/TheaterSearchFilter';
import TheatersTable from '../../features/management/theater/TheatersTable';
import AddEditTheaterModal from '../../features/management/theater/AddEditTheaterModal';

export default function TheatersManagementPage() {
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [isActive, setIsActive] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(9);
    const [showAddModal, setShowAddModal] = useState(false);

    // Debounce search input - wait 500ms after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1); // Reset to page 1 when search changes
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleFilterChange = (next: { q?: string; isActive?: string }) => {
        if (next.q !== undefined) setSearchInput(next.q);
        if (next.isActive !== undefined) {
            setIsActive(next.isActive);
            setPage(1);
        }
    };

    return (
        <div>
            <TheaterHeader onAddClick={() => setShowAddModal(true)} />
            <TheaterSearchFilter
                q={searchInput}
                isActive={isActive}
                onChange={handleFilterChange}
            />
            <TheatersTable
                search={search}
                isActive={isActive}
                page={page}
                limit={limit}
                onPageChange={(p) => setPage(p)}
                onLimitChange={(n) => { setLimit(n); setPage(1); }}
            />

            {/* Add Theater Modal */}
            {showAddModal && (
                <AddEditTheaterModal
                    theater={null}
                    onClose={() => setShowAddModal(false)}
                />
            )}
        </div>
    );
}
