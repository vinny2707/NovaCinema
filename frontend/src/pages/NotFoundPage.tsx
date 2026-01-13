import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
            {/* 404 Icon */}
            <div className="relative mb-8">
                <div className="text-[150px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 leading-none select-none">
                    404
                </div>
                <div className="absolute inset-0 blur-2xl opacity-30 bg-gradient-to-r from-yellow-400 to-amber-500 -z-10" />
            </div>

            {/* Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Không tìm thấy trang
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-md">
                Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
            </p>

            {/* Back to Home Button */}
            <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-gray-900 font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-yellow-500/20"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                </svg>
                Về trang chủ
            </Link>
        </div>
    );
}
