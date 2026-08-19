import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/client/Navbar';
import Footer from '../components/client/Footer';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MyCourts() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<any>(JSON.parse(localStorage.getItem('customer_info') || 'null'));
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            navigate('/');
            return;
        }
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const currentToken = localStorage.getItem('customer_token');
            const res = await fetch('/api/bookings', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${currentToken}`, 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                const data = await res.json();

                // 👉 TỰ ĐỘNG SẮP XẾP: Lịch đặt mới nhất (ID lớn nhất) lên đầu
                const sortedData = data.sort((a: any, b: any) => b.id - a.id);
                setHistory(sortedData);

            } else if (res.status === 401) {
                toast.error("Phiên đăng nhập đã hết hạn!");
                handleLogout();
            }
        } catch (error) {
            toast.error("Không thể tải lịch sử!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_info');
        setCurrentUser(null);
        navigate('/');
    };

    // 💡 LOGIC: XỬ LÝ HỦY SÂN
    const handleCancelBooking = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy lịch đặt sân này không?')) return;

        try {
            const currentToken = localStorage.getItem('customer_token');
            const res = await fetch(`/api/bookings?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });

            if (res.ok) {
                toast.success('Đã hủy lịch đặt sân thành công!');
                fetchHistory(); // 👉 Load lại danh sách sau khi hủy
            } else {
                const data = await res.json();
                toast.error(data.error || 'Có lỗi xảy ra khi hủy sân!');
            }
        } catch (error) {
            toast.error('Lỗi kết nối đến máy chủ!');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
            <Navbar currentUser={currentUser} onLogout={handleLogout} />

            <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full animate-fade-in-up">
                <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
                    <span className="text-3xl">🏟️</span>
                    <h2 className="text-2xl font-bold text-slate-800">Sân của tôi</h2>
                </div>

                {isLoading ? (
                    <LoadingSpinner />
                ) : history.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
                        <span className="text-5xl block mb-4">📭</span>
                        <h3 className="text-xl font-bold text-slate-700">Chưa có lịch đặt nào</h3>
                        <p className="text-slate-500 mb-6 mt-2">Bạn chưa đặt sân nào trên hệ thống. Hãy bắt đầu ngay!</p>
                        <button onClick={() => navigate('/')} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/30 cursor-pointer">
                            ĐẶT SÂN NGAY
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {history.map((booking: any) => (
                            <div key={booking.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{booking.court.name}</h3>
                                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">📍 {booking.court.location}</p>
                                    <div className="mt-3 flex gap-3 text-sm font-medium">
                                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100">📅 {booking.bookDate}</span>
                                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-100">⏰ {booking.timeSlot}</span>
                                    </div>
                                </div>

                                {/* 👉 Nút bấm hủy sân */}
                                <button
                                    onClick={() => handleCancelBooking(booking.id)}
                                    className="px-6 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-colors border border-red-100 w-full md:w-auto shadow-sm cursor-pointer"
                                >
                                    HỦY SÂN
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}