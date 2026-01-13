import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi, type BookingAvailability, type BookingSeat } from '../../api/endpoints/booking.api';
import type { Showtime } from '../../api/endpoints/showtime.api';
import SeatMap from './SeatMap';
import SeatLegend from './SeatLegend';
import BookingSummary from './BookingSummary';

interface SeatSelectionProps {
    showtime: Showtime;
}

export const SeatSelection: React.FC<SeatSelectionProps> = ({
    showtime,
}) => {
    const navigate = useNavigate();
    const [availability, setAvailability] = useState<BookingAvailability | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [orphanWarning, setOrphanWarning] = useState<string | null>(null);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                setIsLoading(true);
                const data = await bookingApi.getAvailability(showtime._id);
                setAvailability(data);
            } catch (error) {
                console.error('Failed to fetch seat availability:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAvailability();
        setSelectedSeats([]); // Reset selected seats when showtime changes
    }, [showtime._id]);

    /**
     * Check if a seat selection/deselection would create orphan seats
     * An orphan seat is an available seat with no adjacent available seats
     */
    const wouldCreateOrphanSeat = (seatCode: string, isSelecting: boolean): boolean => {
        if (!availability) return false;

        // Simulate the future selection state
        const futureSelection = isSelecting
            ? [...selectedSeats, seatCode]
            : selectedSeats.filter(s => s !== seatCode);

        // Find the row of the clicked seat
        let clickedRow = -1;
        for (let r = 0; r < availability.seatMap.length; r++) {
            for (let c = 0; c < availability.seatMap[r].length; c++) {
                const seat = availability.seatMap[r][c];
                if (seat && seat.seatCode === seatCode) {
                    clickedRow = r;
                    break;
                }
            }
            if (clickedRow !== -1) break;
        }

        if (clickedRow === -1) return false;

        // Check all seats in the same row for orphans
        const row = availability.seatMap[clickedRow];
        for (let col = 0; col < row.length; col++) {
            const seat = row[col];

            // Skip null seats (aisles)
            if (!seat) continue;

            // Check if this seat would be orphaned
            const isAvailable = seat.status === 'AVAILABLE' && seat.isAvailable;
            const isInFutureSelection = futureSelection.includes(seat.seatCode);

            // Only check seats that are available and not selected
            if (isAvailable && !isInFutureSelection) {
                // Check left neighbor
                const leftSeat = col > 0 ? row[col - 1] : null;
                const leftAvailable = leftSeat &&
                    leftSeat.status === 'AVAILABLE' &&
                    leftSeat.isAvailable &&
                    !futureSelection.includes(leftSeat.seatCode);

                // Check right neighbor
                const rightSeat = col < row.length - 1 ? row[col + 1] : null;
                const rightAvailable = rightSeat &&
                    rightSeat.status === 'AVAILABLE' &&
                    rightSeat.isAvailable &&
                    !futureSelection.includes(rightSeat.seatCode);

                // If neither neighbor is available, this seat would be orphaned
                if (!leftAvailable && !rightAvailable) {
                    return true;
                }
            }
        }

        return false;
    };

    const handleSeatSelect = (seatCode: string) => {
        // Clear warning when user changes selection
        setOrphanWarning(null);

        setSelectedSeats((prev) => {
            if (prev.includes(seatCode)) {
                return prev.filter((s) => s !== seatCode);
            } else {
                return [...prev, seatCode];
            }
        });
    };

    const calculateTotal = (): number => {
        if (!availability) return 0;

        let total = 0;
        selectedSeats.forEach((seatCode) => {
            const seat = availability.seatMap
                .flat()
                .find((s) => s && s.seatCode === seatCode);

            if (seat) {
                const price = availability.prices.find((p) => p.seatType === seat.seatType);
                if (price) {
                    total += price.price;
                }
            }
        });

        return total;
    };

    const getSelectedSeatsDetails = (): BookingSeat[] => {
        if (!availability) return [];

        return selectedSeats.map((seatCode) => {
            const seat = availability.seatMap
                .flat()
                .find((s) => s && s.seatCode === seatCode);

            const price = seat
                ? availability.prices.find((p) => p.seatType === seat.seatType)
                : null;

            return {
                seatCode,
                seatType: seat?.seatType || 'NORMAL',
                unitPrice: price?.price || 0,
            };
        });
    };

    const handleCheckout = () => {
        if (selectedSeats.length === 0) return;

        // Check for orphan seats before proceeding
        if (!availability) return;

        // Check if current selection would create orphan seats
        for (const seatCode of selectedSeats) {
            if (wouldCreateOrphanSeat(seatCode, true)) {
                setOrphanWarning('Cannot book tickets because your seat selection would create orphan seats (isolated single seats with no available seats next to them). Please reselect your seats!');
                return;
            }
        }

        // Navigate to checkout page with booking data
        navigate('/checkout', {
            state: {
                showtime,
                selectedSeats: getSelectedSeatsDetails(),
                totalAmount: calculateTotal(),
            }
        });
    };

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
                <p className="mt-4 text-gray-400">Loading seat map...</p>
            </div>
        );
    }

    if (!availability) {
        return (
            <div className="text-center py-12 text-gray-400">
                Unable to load seat information
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg p-6 mt-4">
            <h2 className="text-2xl font-bold mb-6 text-white" style={{ fontFamily: 'Anton, sans-serif' }}>
                SELECT SEATS - ROOM {showtime.roomName}
            </h2>

            <SeatLegend />

            {/* Orphan Seat Warning */}
            {orphanWarning && (
                <div className="mb-4 bg-orange-900/50 border border-orange-500 rounded-lg p-4 flex items-start gap-3">
                    <svg className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                        <h3 className="text-orange-400 font-semibold mb-1">Cannot select seat</h3>
                        <p className="text-orange-200 text-sm">{orphanWarning}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <SeatMap
                        seatMap={availability.seatMap}
                        selectedSeats={selectedSeats}
                        onSeatSelect={handleSeatSelect}
                    />
                </div>

                <div>
                    <BookingSummary
                        selectedSeats={selectedSeats}
                        seats={getSelectedSeatsDetails()}
                        totalAmount={calculateTotal()}
                        onCheckout={handleCheckout}
                        isLoading={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default SeatSelection;
