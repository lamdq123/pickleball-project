import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from 'react-hot-toast';
import AdminPromos from '../components/admin/AdminPromos';
import AdminReviews from '../components/admin/AdminReviews';
interface Court { id: number; name: string; location: string; pricePerHour: number; imageUrl?: string; }
interface User { id: number; name: string; email: string; phone: string; }
interface Booking { id: number; court: Court; user: User; bookDate: string; timeSlot: string; }

function Admin() {
    const navigate = useNavigate();
    const [courts, setCourts] = useState<Court[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);

    const [courtFormData, setCourtFormData] = useState({ name: '', location: '', pricePerHour: '' });
    const [userFormData, setUserFormData] = useState({ name: '', email: '', phone: '', password: '' });

    // State quản lý Tab đang hiển thị
    const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'courts' | 'users' | 'promos' | 'reviews'>('dashboard');

    useEffect(() => {
        // Lấy thông tin user đang lưu ở localStorage (khi đăng nhập em nhớ lưu kèm role nhé)
        const userInfo = JSON.parse(localStorage.getItem('customer_info') || 'null');
        const token = localStorage.getItem('admin_token');

        // Kiểm tra xem có phải token admin hoặc user có role === 'admin' không
        if (!token || (userInfo && userInfo.role !== 'admin')) {
            toast.error("Bạn không có quyền truy cập trang quản trị!");
            navigate('/'); // 👉 Đá thẳng về trang chủ nếu không phải admin
        } else {
            fetchCourts();
            fetchUsers();
            fetchBookings();
        }
    }, [navigate]);

    const getHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        'Content-Type': 'application/json'
    });

    const fetchCourts = async () => {
        const res = await fetch('/api/courts', { headers: getHeaders() });
        if (res.ok) setCourts(await res.json());
    };

    const fetchUsers = async () => {
        const res = await fetch('/api/users', { headers: getHeaders() });
        if (res.ok) setUsers(await res.json());
    };

    const fetchBookings = async () => {
        const res = await fetch('/api/bookings', { headers: getHeaders() });
        if (res.ok) setBookings(await res.json());
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/login');
    };

    // ==========================================
    // CÁC HÀM XỬ LÝ (CRUD)
    // ==========================================
    const handleCreateCourt = async (e: FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/courts', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ ...courtFormData, pricePerHour: Number(courtFormData.pricePerHour) }),
        });
        if (res.ok) {
            toast.success("Thêm sân mới thành công!");
            setCourtFormData({ name: '', location: '', pricePerHour: '' });
            fetchCourts();
        }
    };

    const handleDeleteCourt = async (id: number) => {
        if (!window.confirm("Xóa sân này? Hệ thống sẽ báo lỗi nếu sân đang có lịch đặt.")) return;
        const res = await fetch(`/api/courts?id=${id}`, { method: 'DELETE', headers: getHeaders() });
        if (res.ok) fetchCourts();
        else toast.error((await res.json()).error);
    };

    const handleRegisterUser = async (e: FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(userFormData)
        });
        if (res.ok) {
            toast.success("Đã thêm thành viên!");
            setUserFormData({ name: '', email: '', phone: '', password: '' });
            fetchUsers();
        } else toast.error((await res.json()).error);
    };

    const handleDeleteUser = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa thành viên này không?")) return;
        const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE', headers: getHeaders() });
        if (res.ok) {
            toast.success("Đã xóa thành viên thành công!");
            fetchUsers();
        } else toast.error((await res.json()).error);
    };

    const handleCancelBooking = async (id: number) => {
        if (!window.confirm("Hủy lịch đặt này?")) return;
        const res = await fetch(`/api/bookings?id=${id}`, { method: 'DELETE', headers: getHeaders() });
        if (res.ok) fetchBookings();
        else toast.error("Lỗi khi hủy lịch");
    };

    // ==========================================
    // LOGIC XỬ LÝ DATA CHO BIỂU ĐỒ (DASHBOARD)
    // ==========================================
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.court?.pricePerHour || 0), 0);
    const totalBookings = bookings.length;
    const totalUsers = users.length;

    // 1. Dữ liệu Biểu đồ Cột (Doanh thu theo ngày)
    const revenueByDate = bookings.reduce((acc: any, b) => {
        const date = b.bookDate;
        if (!acc[date]) acc[date] = 0;
        acc[date] += (b.court?.pricePerHour || 0);
        return acc;
    }, {});

    const chartData = Object.keys(revenueByDate).map(date => ({
        name: date,
        "Doanh thu": revenueByDate[date]
    })).sort((a, b) => a.name.localeCompare(b.name));

    // 2. Dữ liệu Biểu đồ Tròn (Tỷ trọng theo Sân)
    const revenueByCourt = bookings.reduce((acc: any, b) => {
        const courtName = b.court?.name || 'Sân đã xóa';
        if (!acc[courtName]) acc[courtName] = 0;
        acc[courtName] += (b.court?.pricePerHour || 0);
        return acc;
    }, {});

    const pieData = Object.keys(revenueByCourt).map(name => ({
        name, value: revenueByCourt[name]
    }));

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            {/* Header Admin */}
            <header className="bg-slate-900 text-white px-6 md:px-10 py-4 flex justify-between items-center shadow-md">
                <h1 className="text-2xl font-bold tracking-tight">🎾 Admin Portal</h1>
                <button onClick={handleLogout} className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-colors text-sm shadow-md">Đăng xuất</button>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-slate-200 px-6 md:px-10 py-3 flex gap-2 overflow-x-auto shadow-sm sticky top-0 z-10">
                <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>📊 Dashboard</button>
                <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'bookings' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>📅 Lịch đặt sân</button>
                <button onClick={() => setActiveTab('courts')} className={`px-4 py-2 font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'courts' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>🏟 Quản lý sân</button>
                <button onClick={() => setActiveTab('users')} className={`px-4 py-2 font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'users' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>👥 Khách hàng</button>
                <button
                    onClick={() => setActiveTab('promos')}
                    className={`px-4 py-2 font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'promos' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    🎟 Mã giảm giá
                </button>

                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-4 py-2 font-bold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'reviews' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    ⭐ Đánh giá
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">

                {/* ==========================================
                    TAB 1: DASHBOARD & BIỂU ĐỒ 
                ========================================== */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* 3 Thẻ thống kê tổng quan */}
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
                        </div>

                        {/* 2 Biểu đồ Thống kê */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                            {/* Biểu đồ Cột */}
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

                            {/* Biểu đồ Tròn */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 border-l-4 border-blue-500 pl-3">Tỷ trọng doanh thu theo sân</h3>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                                                {pieData.map((_entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ==========================================
                    TAB 2: QUẢN LÝ LỊCH ĐẶT 
                ========================================== */}
                {activeTab === 'bookings' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">Danh sách Lịch đặt sân</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Mã vé</th>
                                        <th className="px-6 py-4 font-semibold">Khách hàng</th>
                                        <th className="px-6 py-4 font-semibold">Sân</th>
                                        <th className="px-6 py-4 font-semibold">Ngày & Giờ</th>
                                        <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {bookings.map(b => (
                                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-700">#{b.id}</td>
                                            <td className="px-6 py-4 font-medium text-slate-900">{b.user?.name || 'Khách vãng lai'}</td>
                                            <td className="px-6 py-4 text-blue-600 font-semibold">{b.court?.name || 'Sân đã xóa'}</td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs mr-2 font-bold">{b.bookDate}</span>
                                                <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">{b.timeSlot}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={() => handleCancelBooking(b.id)} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-transparent hover:border-red-200">Hủy lịch</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ==========================================
                    TAB 3: QUẢN LÝ SÂN BÃI
                ========================================== */}
                {activeTab === 'courts' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Form thêm sân */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 border-l-4 border-blue-500 pl-3">Thêm sân mới</h3>
                            <form onSubmit={handleCreateCourt} className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 w-full">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tên sân</label>
                                    <input type="text" required value={courtFormData.name} onChange={e => setCourtFormData({ ...courtFormData, name: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Vị trí</label>
                                    <input type="text" required value={courtFormData.location} onChange={e => setCourtFormData({ ...courtFormData, location: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Giá (VNĐ/giờ)</label>
                                    <input type="number" required value={courtFormData.pricePerHour} onChange={e => setCourtFormData({ ...courtFormData, pricePerHour: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md shadow-blue-500/30">THÊM MỚI</button>
                            </form>
                        </div>

                        {/* Grid danh sách sân */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courts.map(court => (
                                <div key={court.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-800">{court.name}</h4>
                                        <p className="text-slate-500 text-sm mt-2 flex items-center gap-1">📍 {court.location}</p>
                                        <p className="text-emerald-600 font-bold mt-4 text-lg">{court.pricePerHour.toLocaleString('vi-VN')} <span className="text-sm font-normal text-slate-500">đ/giờ</span></p>
                                    </div>
                                    <button onClick={() => handleDeleteCourt(court.id)} className="mt-6 w-full py-2.5 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors border border-red-100">Xóa sân này</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ==========================================
                    TAB 4: QUẢN LÝ KHÁCH HÀNG 
                ========================================== */}
                {activeTab === 'users' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Form thêm user */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 border-l-4 border-amber-500 pl-3">Đăng ký Thành viên</h3>
                            <form onSubmit={handleRegisterUser} className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 w-full">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Họ Tên</label>
                                    <input type="text" required value={userFormData.name} onChange={e => setUserFormData({ ...userFormData, name: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Email</label>
                                    <input type="email" required value={userFormData.email} onChange={e => setUserFormData({ ...userFormData, email: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Số điện thoại</label>
                                    <input type="text" required value={userFormData.phone} onChange={e => setUserFormData({ ...userFormData, phone: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <button type="submit" className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md shadow-amber-500/30">TẠO TÀI KHOẢN</button>
                            </form>
                        </div>

                        {/* Table User */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">ID</th>
                                            <th className="px-6 py-4 font-semibold">Họ Tên</th>
                                            <th className="px-6 py-4 font-semibold">Email</th>
                                            <th className="px-6 py-4 font-semibold">SĐT</th>
                                            <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-700">#{user.id}</td>
                                                <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                                                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                                                <td className="px-6 py-4 text-slate-600">{user.phone || 'Chưa cập nhật'}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => handleDeleteUser(user.id)} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-transparent hover:border-red-200">Xóa</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'promos' && <AdminPromos />}
                {activeTab === 'reviews' && <AdminReviews />}
            </main>
        </div>
    );
}

export default Admin;