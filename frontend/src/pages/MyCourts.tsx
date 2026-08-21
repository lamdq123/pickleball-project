import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/client/Navbar';
import Footer from '../components/client/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/date';

export default function MyCourts() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<any>(JSON.parse(localStorage.getItem('customer_info') || 'null'));
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 👉 1. STATE CHO BẢNG MODAL ĐÁNH GIÁ
    const [reviewCourt, setReviewCourt] = useState<{ id: number; name: string } | null>(null);
    const [rating, setRating] = useState(5); // Mặc định là 5 sao
    const [comment, setComment] = useState('');

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
        localStorage.removeItem('token');
        setCurrentUser(null);
        navigate('/');
    };

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
                fetchHistory();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Có lỗi xảy ra khi hủy sân!');
            }
        } catch (error) {
            toast.error('Lỗi kết nối đến máy chủ!');
        }
    };

    // 👉 2. HÀM XỬ LÝ GỬI ĐÁNH GIÁ LÊN SERVER
    const handleSubmitReview = async (e: FormEvent) => {
        e.preventDefault();
        if (!reviewCourt) return;

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating,
                    comment,
                    userId: currentUser.id,
                    courtId: reviewCourt.id
                })
            });

            if (res.ok) {
                toast.success('🎉 Cảm ơn bạn đã đánh giá sân!');
                // Đóng modal và reset dữ liệu
                setReviewCourt(null);
                setRating(5);
                setComment('');
            } else {
                toast.error('Có lỗi xảy ra khi gửi đánh giá!');
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
                                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100">📅 {formatDate(booking.bookDate)}</span>
                                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-100">⏰ {booking.timeSlot}</span>
                                    </div>
                                </div>

                                {/* 👉 3. HAI NÚT BẤM: ĐÁNH GIÁ & HỦY SÂN */}
                                <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                                    <button
                                        onClick={() => setReviewCourt({ id: booking.court.id, name: booking.court.name })}
                                        className="flex-1 md:flex-none px-6 py-2.5 bg-amber-50 text-amber-600 font-bold rounded-xl hover:bg-amber-500 hover:text-white transition-colors border border-amber-200 shadow-sm cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        ⭐ ĐÁNH GIÁ
                                    </button>
                                    <button
                                        onClick={() => handleCancelBooking(booking.id)}
                                        className="flex-1 md:flex-none px-6 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-colors border border-red-100 shadow-sm cursor-pointer"
                                    >
                                        HỦY SÂN
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />

            {/* 👉 4. BẢNG MODAL VIẾT ĐÁNH GIÁ */}
            {reviewCourt && (
                <div
                    className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setReviewCourt(null)} // Bấm ra ngoài để tắt
                >
                    <div
                        className="bg-white rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Đánh giá sân</h3>
                        <p className="text-slate-500 mb-6 text-sm">Bạn cảm thấy trải nghiệm tại <strong className="text-blue-600">{reviewCourt.name}</strong> như thế nào?</p>

                        <form onSubmit={handleSubmitReview} className="space-y-5">
                            {/* Khu vực chọn số sao */}
                            <div className="flex justify-center gap-2 mb-4 bg-slate-50 py-4 rounded-2xl border border-slate-100">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`text-4xl transition-transform hover:scale-110 cursor-pointer ${star <= rating ? 'text-amber-400 drop-shadow-sm' : 'text-slate-200 hover:text-amber-200'}`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>

                            {/* Ô nhập bình luận */}
                            <div>
                                <textarea
                                    rows={4}
                                    placeholder="Chia sẻ thêm về trải nghiệm của bạn (chất lượng sân, ánh sáng, dịch vụ...)"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-shadow"
                                ></textarea>
                            </div>

                            {/* Nút Submit & Hủy */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setReviewCourt(null)}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                                >
                                    Để sau
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-colors cursor-pointer"
                                >
                                    GỬI ĐÁNH GIÁ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}