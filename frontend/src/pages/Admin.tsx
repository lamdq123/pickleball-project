import { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

// 👉 Import 6 Component con em vừa tách
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminBookings from '../components/admin/AdminBookings';
import AdminCourts from '../components/admin/AdminCourts';
import AdminUsers from '../components/admin/AdminUsers';
import AdminPromos from '../components/admin/AdminPromos';
import AdminReviews from '../components/admin/AdminReviews';

function Admin() {
    const navigate = useNavigate();
    const { tab } = useParams(); // 👉 Rút tên tab từ trên thanh URL xuống
    const [isCheckingAccess, setIsCheckingAccess] = useState(true);

    // Kiểm tra xem URL có gõ bậy bạ không. Nếu không nhập gì hoặc gõ sai, mặc định là 'dashboard'
    const validTabs = ['dashboard', 'bookings', 'courts', 'users', 'promos', 'reviews'];
    const activeTab = validTabs.includes(tab || '') ? tab : 'dashboard';

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('customer_info') || 'null');
        const token = localStorage.getItem('customer_token');

        if (!token || !userInfo || userInfo.role !== 'ADMIN') {
            toast.error("Bạn chưa đăng nhập hoặc không có quyền truy cập!");
            navigate('/');
            return;
        }

        setIsCheckingAccess(false);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_info');
        localStorage.removeItem('token');
        toast.success('Đã đăng xuất thành công!');
        navigate('/');
    };

    if (isCheckingAccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
            {/* Header Admin */}
            <header className="bg-slate-900 text-white px-6 md:px-10 py-4 flex justify-between items-center shadow-md">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <span className="text-emerald-400">🎾</span> Admin Portal
                </h1>
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-2">🏠 Về Trang Chủ</Link>
                    <button onClick={handleLogout} className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-colors text-sm shadow-md cursor-pointer">Đăng xuất</button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-slate-200 px-6 md:px-10 py-3 flex gap-2 overflow-x-auto shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate('/admin/dashboard')} className={`px-4 py-2 font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>📊 Dashboard</button>
                <button onClick={() => navigate('/admin/bookings')} className={`px-4 py-2 font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'bookings' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>📅 Lịch đặt sân</button>
                <button onClick={() => navigate('/admin/courts')} className={`px-4 py-2 font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'courts' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>🏟 Quản lý sân</button>
                <button onClick={() => navigate('/admin/users')} className={`px-4 py-2 font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'users' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>👥 Khách hàng</button>
                <button onClick={() => navigate('/admin/promos')} className={`px-4 py-2 font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'promos' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>🎟 Mã giảm giá</button>
                <button onClick={() => navigate('/admin/reviews')} className={`px-4 py-2 font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'reviews' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>⭐ Đánh giá</button>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
                {/* Gọi các Component con ra */}
                {activeTab === 'dashboard' && <AdminDashboard />}
                {activeTab === 'bookings' && <AdminBookings />}
                {activeTab === 'courts' && <AdminCourts />}
                {activeTab === 'users' && <AdminUsers />}
                {activeTab === 'promos' && <AdminPromos />}
                {activeTab === 'reviews' && <AdminReviews />}
            </main>
        </div>
    );
}

export default Admin;