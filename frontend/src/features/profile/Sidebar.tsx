import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { User } from '../../api/endpoints/auth.api';
import { UserCircle, History, LogOut } from 'lucide-react';

interface Props {
  user: User | null;
  onLogout: () => void;
  selected: 'info' | 'history';
  onTabChange: (tab: 'info' | 'history') => void;
}

const Sidebar = ({ user, onLogout, selected, onTabChange }: Props) => {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    onLogout();
  };

  const itemClass = (key: 'info' | 'history' | 'logout') => {
    if (selected === key) {
      return 'flex items-center px-3 py-2 mb-1 text-yellow-300 font-bold cursor-pointer border-l-2 border-yellow-400';
    }
    return 'flex items-center px-3 py-2 text-white opacity-90 mb-1 cursor-pointer transition-colors duration-150 border-l border-transparent hover:text-yellow-300 hover:border-yellow-300';
  };

  return (
    <aside className="bg-gradient-to-b from-[#5a2bd6] to-[#2d1160] text-white rounded-lg p-6 shadow-2xl -translate-y-12 self-start">
      <div className="flex gap-3 items-center mb-4">
        <div className="w-14 h-14 rounded-full bg-white overflow-hidden">
          {user?.email ? (
            <img 
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.email)}`} 
              alt="avatar"
              className="w-full h-full"
            />
          ) : null}
        </div>
        <div>
          <div className="font-bold">{user?.fullName || user?.username || 'User'}</div>
          <div className="text-sm text-white/80">{user?.roles?.includes('ADMIN') ? 'Admin' : 'Thành viên'}</div>
          <div className="text-xs text-white/60 mt-1">{user?.email}</div>
        </div>
      </div>

    <div className="mt-3">
      <a
        onClick={() => onTabChange('info')}
        className={itemClass('info')}
      >
        <UserCircle className="mr-3" size={18} />
        Thông tin khách hàng
      </a>
      <a
        onClick={() => onTabChange('history')}
        className={itemClass('history')}
      >
        <History className="mr-3" size={18} />
        Lịch sử mua hàng
      </a>
      <button
        type="button"
        onClick={handleLogoutClick}
        className={itemClass('logout')}
      >
        <LogOut className="mr-3" size={18} />
        Đăng xuất
      </button>
    </div>

    {/* Logout Confirmation Dialog */}
    {showLogoutDialog && createPortal(
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
      </div>,
      document.body
    )}
    </aside>
  );
};

export default Sidebar;
