import { useState, useEffect } from 'react';
import { BarChart3, Users, Film, TrendingUp, TrendingDown, AlertCircle, Calendar, User as UserIcon, Building, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dashboardApi, type DashboardStats, type ActivityItem, type RevenueChartData } from '../../api/endpoints/dashboard.api';

// Helper to format VND currency
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(value);
};

// Helper to format short currency (e.g., 5M, 10K)
const formatShortCurrency = (value: number): string => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
};

// Helper to format large numbers
const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('vi-VN').format(value);
};

// Helper to format relative time
const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
};

// Helper to format date for chart (DD/MM)
const formatDateShort = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
};

// Get activity icon and color based on type
const getActivityStyle = (type: ActivityItem['type']) => {
    switch (type) {
        case 'movie':
            return { color: 'bg-blue-500', icon: Film };
        case 'user':
            return { color: 'bg-green-500', icon: UserIcon };
        case 'theater':
            return { color: 'bg-yellow-500', icon: Building };
        case 'booking':
            return { color: 'bg-purple-500', icon: Calendar };
        default:
            return { color: 'bg-gray-500', icon: AlertCircle };
    }
};

// Get default date range (last 30 days)
const getDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
    };
};

// Loading skeleton for stat cards
const StatCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-200 animate-pulse">
        <div className="flex items-center justify-between">
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
                <div className="w-6 h-6"></div>
            </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-32 mt-4"></div>
    </div>
);

// Loading skeleton for activities
const ActivitySkeleton = () => (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg animate-pulse">
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-48"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
    </div>
);

// Chart skeleton
const ChartSkeleton = () => (
    <div className="h-80 bg-gray-50 rounded-lg animate-pulse flex items-end justify-around gap-2 p-4">
        {Array.from({ length: 15 }).map((_, i) => (
            <div
                key={i}
                className="bg-gray-200 rounded-t w-full"
                style={{ height: `${Math.random() * 60 + 20}%` }}
            ></div>
        ))}
    </div>
);

interface StatCardProps {
    title: string;
    value: string;
    growth?: number;
    icon: React.ReactNode;
    borderColor: string;
    bgColor: string;
    showGrowth?: boolean;
}

const StatCard = ({ title, value, growth = 0, icon, borderColor, bgColor, showGrowth = true }: StatCardProps) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${borderColor}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600 font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
            </div>
            <div className={`${bgColor} p-3 rounded-full`}>
                {icon}
            </div>
        </div>
        {showGrowth && (
            <p className={`text-sm mt-4 flex items-center gap-1 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}% so với tháng trước
            </p>
        )}
    </div>
);

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                <p className="font-semibold text-gray-800 mb-2">{label}</p>
                <p className="text-indigo-600">
                    <span className="font-medium">Doanh thu:</span> {formatCurrency(payload[0].value)}
                </p>
                <p className="text-emerald-600">
                    <span className="font-medium">Đơn đặt vé:</span> {formatNumber(payload[1]?.value || 0)}
                </p>
            </div>
        );
    }
    return null;
};

// Revenue Chart Component using Recharts
interface RevenueChartProps {
    data: RevenueChartData | null;
    loading: boolean;
}

const RevenueChart = ({ data, loading }: RevenueChartProps) => {
    if (loading) return <ChartSkeleton />;
    if (!data || data.data.length === 0) {
        return (
            <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
                <div className="text-center">
                    <AlertCircle className="mx-auto mb-2" size={24} />
                    <p>Không có dữ liệu</p>
                </div>
            </div>
        );
    }

    // Transform data for recharts
    const chartData = data.data.map(point => ({
        date: formatDateShort(point.date),
        revenue: point.revenue,
        transactions: point.transactions,
    }));

    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis
                        tickFormatter={formatShortCurrency}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
                    <Legend
                        formatter={(value) => value === 'revenue' ? 'Doanh thu' : 'Giao dịch'}
                        wrapperStyle={{ paddingTop: '20px' }}
                    />
                    <Bar
                        dataKey="revenue"
                        fill="url(#revenueGradient)"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1000}
                        animationBegin={0}
                    />
                    <Bar
                        dataKey="transactions"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1000}
                        animationBegin={200}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [revenueChart, setRevenueChart] = useState<RevenueChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Date range for chart
    const defaultRange = getDefaultDateRange();
    const [startDate, setStartDate] = useState(defaultRange.startDate);
    const [endDate, setEndDate] = useState(defaultRange.endDate);

    // Fetch main dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [statsData, activityData] = await Promise.all([
                    dashboardApi.getStatistics(),
                    dashboardApi.getRecentActivity(10),
                ]);

                setStats(statsData);
                setActivities(activityData.activities || []);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
                setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Fetch revenue chart data
    const fetchRevenueChart = async () => {
        try {
            setChartLoading(true);
            const chartData = await dashboardApi.getRevenueChart(startDate, endDate);
            setRevenueChart(chartData);
        } catch (err) {
            console.error('Failed to fetch revenue chart:', err);
        } finally {
            setChartLoading(false);
        }
    };

    // Initial chart load
    useEffect(() => {
        fetchRevenueChart();
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600 mt-2">Chào mừng đến với bảng điều khiển quản lý</p>
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="text-red-500" size={20} />
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {loading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : stats ? (
                    <>
                        <StatCard
                            title="Tổng Phim"
                            value={formatNumber(stats.totalMovies.value)}
                            icon={<Film className="text-blue-500" size={24} />}
                            borderColor="border-blue-500"
                            bgColor="bg-blue-100"
                            showGrowth={false}
                        />
                        <StatCard
                            title="Tổng Người Dùng"
                            value={formatNumber(stats.totalUsers.value)}
                            icon={<Users className="text-green-500" size={24} />}
                            borderColor="border-green-500"
                            bgColor="bg-green-100"
                            showGrowth={false}
                        />
                        <StatCard
                            title="Doanh Thu"
                            value={formatCurrency(stats.revenue.value)}
                            growth={stats.revenue.growth}
                            icon={<TrendingUp className="text-yellow-500" size={24} />}
                            borderColor="border-yellow-500"
                            bgColor="bg-yellow-100"
                        />
                        <StatCard
                            title="Đơn Đặt Vé"
                            value={formatNumber(stats.totalBookings.value)}
                            growth={stats.totalBookings.growth}
                            icon={<BarChart3 className="text-purple-500" size={24} />}
                            borderColor="border-purple-500"
                            bgColor="bg-purple-100"
                        />
                    </>
                ) : null}
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Biểu Đồ Doanh Thu</h2>
                        {revenueChart && !chartLoading && (
                            <p className="text-sm text-gray-500 mt-1">
                                Tổng: {formatCurrency(revenueChart.totalRevenue)} • {formatNumber(revenueChart.totalTransactions)} giao dịch
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Từ:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Đến:</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <button
                            onClick={fetchRevenueChart}
                            disabled={chartLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            <Search size={16} />
                            Xem
                        </button>
                    </div>
                </div>
                <RevenueChart data={revenueChart} loading={chartLoading} />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Hoạt Động Gần Đây</h2>
                <div className="space-y-4">
                    {loading ? (
                        <>
                            <ActivitySkeleton />
                            <ActivitySkeleton />
                            <ActivitySkeleton />
                        </>
                    ) : activities.length > 0 ? (
                        activities.map((activity, index) => {
                            const style = getActivityStyle(activity.type);
                            const Icon = style.icon;
                            return (
                                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className={`w-8 h-8 ${style.color} rounded-full flex items-center justify-center`}>
                                        <Icon className="text-white" size={14} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">
                                            {activity.title}: {activity.description}
                                        </p>
                                        <p className="text-xs text-gray-500">{formatRelativeTime(activity.createdAt)}</p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <AlertCircle className="mx-auto mb-2" size={24} />
                            <p>Chưa có hoạt động nào</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
