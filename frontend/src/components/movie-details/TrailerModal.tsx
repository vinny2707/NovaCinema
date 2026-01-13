import { useEffect } from "react";
import { createPortal } from "react-dom";

export interface TrailerModalProps {
  open: boolean;
  trailerUrl?: string | null;
  title?: string;
  onClose: () => void;
}

const getEmbedUrl = (url?: string | null) => {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      return url;
    }

    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      return `https://www.youtube.com/embed/${id}`;
    }

    return url;
  } catch {
    return url ?? "";
  }
};

export default function TrailerModal({ open, trailerUrl, title, onClose }: TrailerModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const embedUrl = getEmbedUrl(trailerUrl);

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent cursor-pointer"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="bg-gray-900 rounded-lg max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end p-2">
          <button onClick={onClose} aria-label="Close trailer" className="text-white text-2xl leading-none cursor-pointer">
            ×
          </button>
        </div>

        <div className="p-2">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${title ?? "Trailer"}`}
              allowFullScreen
              className="w-full h-64 md:h-96 rounded-md cursor-pointer"
            />
          ) : (
            <div className="w-full h-64 md:h-96 flex items-center justify-center text-white text-lg">
              <div className="text-center">
                <p>Trailer chưa có sẵn</p>
                <p className="text-sm text-gray-400 mt-2">Trailer not available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return modal;
  return createPortal(modal, document.body);
}
