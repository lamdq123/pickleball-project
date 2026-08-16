import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner';

// 👉 1. Bỏ { setActiveTab } đi, để trống ngoặc đơn ()
export default function AdminDashboard() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 👉 2. Khai báo biến navigate ở đây
    const navigate = useNavigate();

    useEffect(() => {
        const getHeaders = () => ({
            'Authorization': `Bearer ${localStorage.getItem('customer_token')}`,
            'Content-Type': 'application/json'
        });

        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [bookingsRes, usersRes] = await Promise.all([
                    fetch('/api/bookings', { headers: getHeaders() }),
                    fetch('/api/users', { headers: getHeaders() })
                ]);

                if (bookingsRes.ok) setBookings(await bookingsRes.json());
                if (usersRes.ok) setUsers(await usersRes.json());
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-75 flex items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                <LoadingSpinner />
            </div>
        );
    }

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.court?.pricePerHour || 0), 0);
    const totalBookings = bookings.length;
    const totalUsers = users.length;

    const revenueByDate = bookings.reduce((acc: any, b) => {
        const date = b.bookDate;
        if (!acc[date]) acc[date] = 0;
        acc[date] += (b.court?.pricePerHour || 0);
        return acc;
    }, {});

    const chartData = Object.keys(revenueByDate).map(date => ({
        name: date, "Doanh thu": revenueByDate[date]
    })).sort((a, b) => a.name.localeCompare(b.name));

    const revenueByCourt = bookings.reduce((acc: any, b) => {
        const courtName = b.court?.name || 'Sân đã xóa';
        if (!acc[courtName]) acc[courtName] = 0;
        acc[courtName] += (b.court?.pricePerHour || 0);
        return acc;
    }, {});

    const pieData = Object.keys(revenueByCourt).map(name => ({ name, value: revenueByCourt[name] }));
    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-inner">💰</div>
                    <div>
                        <p className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Tổng doanh thu</p>
                        <p className="text-3xl font-extrabold text-slate-800 mt-1">{totalRevenue.toLocaleString('vi-VN')} đ</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-inner">📅</div>
                    <div>
                        <p className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Số lượt đặt sân</p>
                        <p className="text-3xl font-extrabold text-slate-800 mt-1">{totalBookings} <span className="text-lg text-slate-500 font-medium">lượt</span></p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-3xl shadow-inner">👥</div>
                    <div>
                        <p className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Tổng khách hàng</p>
                        <p className="text-3xl font-extrabold text-slate-800 mt-1">{totalUsers} <span className="text-lg text-slate-500 font-medium">người</span></p>
                    </div>
                </div>

                {/* 👉 3. Sửa 2 nút này thành navigate */}
                <button onClick={() => navigate('/admin/promos')} className="px-4 py-2 font-bold rounded-lg transition-colors whitespace-nowrap bg-blue-100 text-blue-700 hover:bg-blue-200">🎟 Mã giảm giá</button>
                <button onClick={() => navigate('/admin/reviews')} className="px-4 py-2 font-bold rounded-lg transition-colors whitespace-nowrap bg-blue-100 text-blue-700 hover:bg-blue-200">⭐ Đánh giá</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 border-l-4 border-emerald-500 pl-3">Doanh thu theo ngày</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${(value / 1000)}k`} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="Doanh thu" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 border-l-4 border-blue-500 pl-3">Tỷ trọng theo sân</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                                    {pieData.map((_entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}