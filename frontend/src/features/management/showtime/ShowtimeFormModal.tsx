/**
 * ShowtimeFormModal Component
 * Modal for creating/editing showtimes
 */

import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { showtimeApi, type Showtime, type CreateShowtimeDto } from "../../../api/endpoints/showtime.api";
import type { Movie } from "../../../api/endpoints/movie.api";
import type { Theater, Room } from "../../../api/endpoints/theater.api";
import { SearchableMovieSelect } from "../../../components/common/SearchableMovieSelect";
import { SearchableTheaterSelect } from "../../../components/common/SearchableTheaterSelect";

const formatDateTimeForInput = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

interface ShowtimeFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  showtime?: Showtime | null;
  movies: Movie[];
  theaters: Theater[];
  onClose: () => void;
  onSuccess: () => void;
  fetchRoomsByTheaterId: (theaterId: string) => Promise<Room[]>;
}

export function ShowtimeFormModal({
  isOpen,
  mode,
  showtime,
  movies,
  theaters,
  onClose,
  onSuccess,
  fetchRoomsByTheaterId,
}: ShowtimeFormModalProps) {
  const [formData, setFormData] = useState<CreateShowtimeDto>({
    movieId: "",
    roomId: "",
    startAt: "",
  });
  const [formTheaterId, setFormTheaterId] = useState("");
  const [formRooms, setFormRooms] = useState<Room[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && showtime) {
        setFormTheaterId(showtime.theaterId);
        setFormData({
          movieId: showtime.movieId,
          roomId: showtime.roomId,
          startAt: formatDateTimeForInput(new Date(showtime.startAt)),
        });
      } else {
        setFormData({
          movieId: "",
          roomId: "",
          startAt: formatDateTimeForInput(new Date()),
        });
        setFormTheaterId("");
      }
      setValidationError(null);
    }
  }, [isOpen, mode, showtime]);

  // Fetch rooms when theater changes
  useEffect(() => {
    if (formTheaterId) {
      setLoadingRooms(true);
      fetchRoomsByTheaterId(formTheaterId)
        .then(setFormRooms)
        .finally(() => setLoadingRooms(false));
    } else {
      setFormRooms([]);
    }
  }, [formTheaterId, fetchRoomsByTheaterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setValidationError(null);

    try {
      const payload = {
        ...formData,
        startAt: new Date(formData.startAt).toISOString(),
      };

      // Create showtime (backend will validate)
      await showtimeApi.createShowtime(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Showtime creation error:', err);
      let errorMsg = 'Có lỗi xảy ra';
      if (err?.message) errorMsg = err.message;
      if (err?.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        const details = err.errors.map((e: any) => typeof e === 'string' ? e : e?.message || JSON.stringify(e)).join(', ');
        errorMsg += `. Chi tiết: ${details}`;
      }
      setValidationError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === "create" ? "Thêm suất chiếu mới" : "Chỉnh sửa suất chiếu"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="text-red-500" size={18} />
              <p className="text-red-700 text-sm">{validationError}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phim *</label>
            <SearchableMovieSelect
              movies={movies}
              value={formData.movieId}
              onChange={(movieId) => setFormData((prev) => ({ ...prev, movieId }))}
              placeholder="Tìm và chọn phim..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rạp *</label>
            <SearchableTheaterSelect
              theaters={theaters}
              value={formTheaterId}
              onChange={(theaterId) => {
                setFormTheaterId(theaterId);
                setFormData((prev) => ({ ...prev, roomId: "" }));
              }}
              placeholder="Chọn rạp"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phòng chiếu *</label>
            <select
              value={formData.roomId}
              onChange={(e) => setFormData((prev) => ({ ...prev, roomId: e.target.value }))}
              required
              disabled={!formTheaterId || loadingRooms}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100"
            >
              <option value="">{loadingRooms ? "Đang tải..." : "Chọn phòng chiếu"}</option>
              {formRooms.map((room) => (
                <option key={room._id} value={room._id}>
                  {room.roomName} ({room.roomType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu *</label>
            <input
              type="datetime-local"
              value={formData.startAt}
              onChange={(e) => setFormData((prev) => ({ ...prev, startAt: e.target.value }))}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-[#10142C] font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="animate-spin" size={18} />}
              {mode === "create" ? "Tạo suất chiếu" : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
