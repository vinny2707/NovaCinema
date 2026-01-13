import { Link, Outlet, useLocation } from 'react-router-dom';
import { Film, Theater, DoorOpen, Users, Settings, LayoutDashboard, Calendar, Ticket, CreditCard } from 'lucide-react';

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    {
        path: '/management',
        label: 'Dashboard',
        icon: <LayoutDashboard size={20} />,
    },
    {
        path: '/management/movies',
        label: 'Movies',
        icon: <Film size={20} />,
    },
    {
        path: '/management/theaters',
        label: 'Theaters',
        icon: <Theater size={20} />,
    },
    {
        path: '/management/rooms',
        label: 'Rooms',
        icon: <DoorOpen size={20} />,
    },
    {
        path: '/management/showtimes',
        label: 'Showtimes',
        icon: <Calendar size={20} />,
    },
    {
        path: '/management/pricing',
        label: 'Ticket Pricing',
        icon: <Ticket size={20} />,
    },
    {
        path: '/management/bookings',
        label: 'Bookings',
        icon: <CreditCard size={20} />,
    },
    {
        path: '/management/users',
        label: 'Users',
        icon: <Users size={20} />,
    },
    {
        path: '/management/settings',
        label: 'Settings',
        icon: <Settings size={20} />,
    },
];

export default function ManagementLayout() {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-[#10142C] text-white shadow-lg">
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-yellow-400">Management</h2>
                    <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
                </div>

                <nav className="p-4">
                    <ul className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-yellow-400 text-[#10142C] font-semibold shadow-md'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                            }`}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        ← Back to Website
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
