import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle, Plus, Trash2, Calendar, Clock } from "lucide-react";
import { showtimeApi, type CreateBulkShowtimesDto } from "../../../api/endpoints/showtime.api";
import type { Movie } from "../../../api/endpoints/movie.api";
import type { Theater, Room } from "../../../api/endpoints/theater.api";
import { SearchableMovieSelect } from "../../../components/common/SearchableMovieSelect";
import { SearchableTheaterSelect } from "../../../components/common/SearchableTheaterSelect";
import { useToast } from "../../../components/common/ToastProvider";

interface BulkShowtimeFormModalProps {
  isOpen: boolean;
  movies: Movie[];
  theaters: Theater[];
  onClose: () => void;
  onSuccess: () => void;
  fetchRoomsByTheaterId: (theaterId: string) => Promise<Room[]>;
}

export function BulkShowtimeFormModal({
  isOpen,
  movies,
  theaters,
  onClose,
  onSuccess,
  fetchRoomsByTheaterId,
}: BulkShowtimeFormModalProps) {
  const toast = useToast();

  // Form state
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedTheaterId, setSelectedTheaterId] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [repeatDates, setRepeatDates] = useState<string[]>([""]); // yyyy-MM-dd format
  const [startTimes, setStartTimes] = useState<string[]>([""]); // HH:mm format
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMovieId("");
      setSelectedTheaterId("");
      setSelectedRoomId("");
      setRepeatDates([""]);
      setStartTimes([""]);
      setValidationError(null);
      setRooms([]);
    }
  }, [isOpen]);

  // Fetch rooms when theater changes
  useEffect(() => {
    if (selectedTheaterId) {
      setLoadingRooms(true);
      setSelectedRoomId("");
      fetchRoomsByTheaterId(selectedTheaterId)
        .then((data) => setRooms(data.filter(r => r.isActive)))
        .finally(() => setLoadingRooms(false));
    } else {
      setRooms([]);
      setSelectedRoomId("");
    }
  }, [selectedTheaterId, fetchRoomsByTheaterId]);



  // Date management
  const addDate = () => setRepeatDates((prev) => [...prev, ""]);
  const removeDate = (index: number) => setRepeatDates((prev) => prev.filter((_, i) => i !== index));
  const updateDate = (index: number, value: string) => {
    setRepeatDates((prev) => prev.map((d, i) => (i === index ? value : d)));
  };

  // Time management
  const addTime = () => setStartTimes((prev) => [...prev, ""]);
  const removeTime = (index: number) => setStartTimes((prev) => prev.filter((_, i) => i !== index));
  const updateTime = (index: number, value: string) => {
    setStartTimes((prev) => prev.map((t, i) => (i === index ? value : t)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!selectedMovieId) {
      setValidationError("Vui lòng chọn phim");
      return;
    }
    if (!selectedRoomId) {
      setValidationError("Vui lòng chọn phòng chiếu");
      return;
    }
    const validDates = repeatDates.filter((d) => d.trim() !== "");
    if (validDates.length === 0) {
      setValidationError("Vui lòng chọn ít nhất một ngày chiếu");
      return;
    }
    const validTimes = startTimes.filter((t) => t.trim() !== "");
    if (validTimes.length === 0) {
      setValidationError("Vui lòng chọn ít nhất một giờ chiếu");
      return;
    }

    setSubmitting(true);
    setValidationError(null);

    try {
      // Build schedule for the selected room with all combinations of dates and times
      const schedules = [{
        roomId: selectedRoomId,
        startAts: validDates.flatMap(date =>
          validTimes.map(time => {
            // Create local datetime and convert to ISO
            const localDateTime = new Date(`${date}T${time}:00`);
            return localDateTime.toISOString();
          })
        )
      }];

      const data: CreateBulkShowtimesDto = {
        movieId: selectedMovieId,
        schedules
      };

      // Create bulk showtimes
      console.log("Creating bulk showtimes:", data);
      const result = await showtimeApi.createBulkShowtimes(data);
      console.log("API Response:", result);
      const count = Array.isArray(result) ? result.length : totalShowtimes;
      toast.push(`Tạo thành công ${count} suất chiếu!`, "success");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Bulk showtime creation error:', err);
      let errorMsg = 'Có lỗi xảy ra';
      if (err?.message) errorMsg = err.message;
      if (err?.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        const details = err.errors.map((e: any) => typeof e === 'string' ? e : e?.message || JSON.stringify(e)).join(', ');
        errorMsg += `. Chi tiết: ${details}`;
      }
      setValidationError(errorMsg);
      toast.push(errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate total showtimes: dates × times
  const validDatesCount = repeatDates.filter((d) => d.trim() !== "").length;
  const validTimesCount = startTimes.filter((t) => t.trim() !== "").length;
  const totalShowtimes = selectedRoomId ? validDatesCount * validTimesCount : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Tạo nhiều suất chiếu</h2>
            <p className="text-sm text-gray-500 mt-1">Chọn phim, phòng, ngày và giờ để tạo hàng loạt</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {validationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
              <p className="text-red-700 text-sm">{validationError}</p>
            </div>
          )}

          {/* Movie Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phim *</label>
            <SearchableMovieSelect
              movies={movies}
              value={selectedMovieId}
              onChange={setSelectedMovieId}
              placeholder="Tìm và chọn phim..."
              required
            />
          </div>

          {/* Theater & Room Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rạp *</label>
              <SearchableTheaterSelect
                theaters={theaters}
                value={selectedTheaterId}
                onChange={setSelectedTheaterId}
                placeholder="Chọn rạp"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phòng chiếu *
              </label>
              {loadingRooms ? (
                <div className="flex items-center justify-center py-3 px-3 border border-gray-300 rounded-lg bg-gray-50">
                  <Loader2 className="animate-spin mr-2" size={18} />
                  <span className="text-gray-500 text-sm">Đang tải...</span>
                </div>
              ) : (
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                  disabled={rooms.length === 0}
                >
                  <option value="">
                    {selectedTheaterId ? "Chọn phòng chiếu" : "Vui lòng chọn rạp trước"}
                  </option>
                  {rooms.map((room) => (
                    <option key={room._id} value={room._id}>
                      {room.roomName} ({room.roomType}) - {room.capacity} ghế
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Dates and Times in 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dates */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Calendar size={16} className="inline mr-1" />
                  Ngày chiếu * ({validDatesCount})
                </label>
                <button
                  type="button"
                  onClick={addDate}
                  className="flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-700"
                >
                  <Plus size={16} />
                  Thêm ngày
                </button>
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {repeatDates.map((date, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => updateDate(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    {repeatDates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDate(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Times */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Clock size={16} className="inline mr-1" />
                  Giờ chiếu * ({validTimesCount})
                </label>
                <button
                  type="button"
                  onClick={addTime}
                  className="flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-700"
                >
                  <Plus size={16} />
                  Thêm giờ
                </button>
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {startTimes.map((time, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => updateTime(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    {startTimes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTime(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          {totalShowtimes > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Calendar className="text-yellow-600" size={20} />
                <p className="text-yellow-800 font-medium">
                  Sẽ tạo <span className="text-xl font-bold">{totalShowtimes}</span> suất chiếu
                </p>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                ({validDatesCount} ngày × {validTimesCount} giờ)
              </p>
            </div>
          )}
        </form>

        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || totalShowtimes === 0}
            className="flex-1 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-[#10142C] font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="animate-spin" size={18} />}
            Tạo {totalShowtimes} suất chiếu
          </button>
        </div>
      </div>
    </div>
  );
}
