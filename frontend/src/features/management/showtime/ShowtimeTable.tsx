import { Calendar, Clock, Edit, Trash2 } from "lucide-react";
import type { Showtime } from "../../../api/endpoints/showtime.api";
import { Pagination } from "../../../components/common/Pagination";

// Format date/time helpers
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

interface ShowtimeTableProps {
  showtimes: Showtime[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (showtime: Showtime) => void;
  onDelete: (id: string) => void;

  // Pagination
  page: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limit: number;
  total: number;
  totalPages: number;
}

export function ShowtimeTable({
  showtimes,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
  page,
  onPageChange,
  onLimitChange,
  limit,
  total,
  totalPages,
}: ShowtimeTableProps) {

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.length === showtimes.length && showtimes.length > 0}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-400"
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phim</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rạp</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phòng</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ngày</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Giờ</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Loại</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {showtimes.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                  Không có suất chiếu nào
                </td>
              </tr>
            ) : (
              showtimes.map((showtime) => (
                <tr key={showtime._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(showtime._id)}
                      onChange={() => onToggleSelect(showtime._id)}
                      className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-400"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-gray-800 line-clamp-2">{showtime.movieTitle}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{showtime.theaterName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{showtime.roomName}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} className="text-gray-400" />
                      {formatDate(showtime.startAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} className="text-gray-400" />
                      {formatTime(showtime.startAt)} - {formatTime(showtime.endAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${showtime.roomType === "VIP"
                          ? "bg-purple-100 text-purple-700"
                          : showtime.roomType === "3D"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {showtime.roomType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${showtime.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                    >
                      {showtime.isActive ? "Hoạt động" : "Vô hiệu"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(showtime)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(showtime._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 0 && (
          <Pagination
            page={page}
            limit={limit}
            total={total}
            totalPages={totalPages}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
            itemLabel="showtimes"
          />
        )}
      </div>
    </>
  );
}
