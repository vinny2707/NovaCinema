import { Ticket, Search, UserCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { movieApi } from '../../api/endpoints/movie.api';

// Helper function to get last name from full name
const getLastName = (fullName: string): string => {
  const parts = fullName.trim().split(' ');
  return parts[parts.length - 1] || fullName;
};

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Auto search with 500ms debounce
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const timer = setTimeout(() => {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, navigate]);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    logout();
    navigate('/');
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleBuyTicket = async () => {
    console.log('Buy ticket button clicked!');
    try {
      const response = await movieApi.getNowShowing(1, 100);
      console.log('Movies response:', response);
      if (response.items && response.items.length > 0) {
        const randomMovie = response.items[Math.floor(Math.random() * response.items.length)];
        console.log('Random movie selected:', randomMovie);
        navigate(`/movie/${randomMovie._id}`);
      } else {
        console.log('No movies found, redirecting to now-showing');
        navigate('/now-showing');
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      navigate('/now-showing');
    }
  };

  return (
    <header className="w-full bg-[#10142C] text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto max-w-7xl px-4">

        <div className="flex h-20 items-center justify-between">

          <a href="/" aria-label="Trang chủ NOVA CINEMA">
            <img src="/logo.png" alt="NOVA CINEMA Logo" className="h-20 w-auto" />
          </a>

          <div className="flex items-center gap-4">

            <div className="relative hidden lg:block">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-56 rounded-full bg-white py-2 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            <Button intent="primary" className="hidden sm:flex" onClick={handleBuyTicket}>
              <Ticket size={16} />
              <span>BUY TICKETS</span>
            </Button>


            {/* Sign In / User Display */}
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-2 transition-colors hover:bg-gray-700 hover:text-yellow-400"
              >
                <UserCircle size={24} />
                <span className="hidden font-medium sm:block">Sign In</span>
              </Link>
            ) : (
              <div className="relative group">
                <button className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-2 transition-colors hover:bg-gray-700 cursor-pointer hover:text-yellow-400">
                  <UserCircle size={24} />
                  <span className="hidden font-medium sm:block">{getLastName(user?.fullName || '')}</span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-semibold">{user?.fullName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      My Profile
                    </Link>
                    {/* Management option - only visible for admin users */}
                    {user?.roles?.includes('ADMIN') && (
                      <Link
                        to="/management"
                        className="block px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                      >
                        Management
                      </Link>
                    )}
                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 cursor-pointer hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex h-12 items-center justify-between border-t border-white">

          <nav className="flex items-center gap-6">
            <Link
              to="/now-showing"
              className="font-semibold text-white transition-colors hover:text-yellow-400"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Now Showing
            </Link>
            <Link
              to="/coming-soon"
              className="font-semibold text-white transition-colors hover:text-yellow-400"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Coming Soon
            </Link>
          </nav>

          <nav className="flex items-center gap-6">
            <Link
              to="/about-us"
              className="font-semibold text-white transition-colors hover:text-yellow-400 hover:border-b-2 border-yellow-400"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              About us
            </Link>
          </nav>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận đăng xuất</h3>
            <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}