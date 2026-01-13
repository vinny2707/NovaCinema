import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { Button } from "../common/Button";
import { CirclePlay, Tag, Clock, Globe, MessageSquareMore, UserCheck } from "lucide-react";
import MetaItem from "./MetaItem";
import TrailerModal from "./TrailerModal";
import type { Movie } from "../../api/endpoints/movie.api";
import { formatUTC0DateToLocal } from "../../utils/timezone";

// Component: render description with a "Xem thêm / Thu gọn" toggle underneath
function DescriptionWithToggle({
  description,
  truncateLen = 300,
}: {
  description?: string | null;
  truncateLen?: number;
}) {
  const [open, setOpen] = useState(false);
  const desc = description ?? "";
  const isLong = desc.length > truncateLen;
  const short = isLong ? desc.slice(0, truncateLen).trimEnd() + "…" : desc;

  return (
    <>
      <p className="mt-2 whitespace-pre-line text-justify">{open ? desc : short}</p>
      {desc && (
        <button
          type="button"
          className="mt-2 text-yellow-400 underline bg-transparent p-0 cursor-pointer"
          onClick={() => setOpen((s) => !s)}
          aria-expanded={open}
        >
          {open ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
    </>
  );
}

export interface MovieDetailsProps {
  movie: Movie;
}

export default function MovieDetails({ movie }: MovieDetailsProps) {
  // const navigate = useNavigate();

  const formatRatingAge = (age?: number | string | null) => {
    if (age === null || age === undefined) return "N/A";

    const ageStr = String(age).toUpperCase().trim();

    // P hoặc 0: Phim dành cho mọi lứa tuổi
    if (ageStr === 'P' || ageStr === '0') {
      return "P: Phim dành cho khán giả mọi lứa tuổi";
    }

    // Cxx: Cấm chiếu dưới xx tuổi (nghiêm ngặt)
    const cMatch = ageStr.match(/^C(\d+)$/);
    if (cMatch) {
      const ageNum = cMatch[1];
      return `C${ageNum}: CẤM khán giả dưới ${ageNum} tuổi`;
    }

    // Txx: Phim dành cho từ xx tuổi trở lên
    const tMatch = ageStr.match(/^T(\d+)$/);
    if (tMatch) {
      const ageNum = tMatch[1];
      return `T${ageNum}: Phim dành cho khán giả từ đủ ${ageNum} tuổi trở lên (${ageNum}+)`;
    }

    // Số thuần túy: Tương tự Txx
    if (/^\d+$/.test(ageStr)) {
      return `T${ageStr}: Phim dành cho khán giả từ đủ ${ageStr} tuổi trở lên (${ageStr}+)`;
    }

    // Trường hợp khác: hiển thị nguyên bản
    return ageStr;
  };

  const [showTrailerModal, setShowTrailerModal] = useState(false);

  // TrailerModal handles Escape key and overlay closing

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-2/5 self-start">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full rounded-lg max-h-[700px] object-cover border border-white/60"
        />
      </div>

      <div className="md:w-1/2 space-y-4">
        <h1 className="text-4xl font-bold" style={{ fontFamily: "Anton, sans-serif" }}>
          {movie.title}
        </h1>

        <div className="text-lg space-y-1">
          <MetaItem icon={Tag}>{movie.genres.join(', ')}</MetaItem>

          <MetaItem icon={Clock}>{movie.duration}'</MetaItem>

          <MetaItem icon={Globe}>{movie.country ?? "N/A"}</MetaItem>

          <MetaItem icon={MessageSquareMore}>{movie.language ?? "N/A"}</MetaItem>

          <MetaItem icon={UserCheck}>
            <span className="bg-yellow-400 text-black px-2 rounded">{formatRatingAge(movie.ratingAge)}</span>
          </MetaItem>
        </div>

        <div className="mt-4 text-lm text-gray-300">
          <h3 className="font-bold text-white text-lg">MÔ TẢ</h3>
          <p className="mt-1">Đạo diễn: {movie.director}</p>
          <p className="mt-1">Diễn viên: {movie.actors?.length ? movie.actors.join(', ') : "N/A"}</p>
          <p className="">Khởi chiếu: {formatUTC0DateToLocal(movie.releaseDate)}</p>
        </div>

        <div className="mt-4 text-lm text-gray-300">
          <h3 className="font-bold text-white text-lg">NỘI DUNG PHIM</h3>
          <DescriptionWithToggle description={movie.description} />
        </div>

        <div className="mt-4" />

        <div className="flex items-center gap-3 mt-6 cursor-pointer">
          <Button intent="secondary" onClick={() => setShowTrailerModal(true)} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <CirclePlay className="w-5 h-5" />
              <span>Watch trailer</span>
            </div>
          </Button>
        </div>
        <TrailerModal
          open={showTrailerModal}
          trailerUrl={movie.trailerUrl}
          title={movie.title}
          onClose={() => setShowTrailerModal(false)}
        />
      </div>
    </div>
  );
}
