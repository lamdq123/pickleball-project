import { type FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

interface Court { id: number; name: string; location: string; pricePerHour: number; imageUrl?: string; reviews?: any[]; }

interface CourtModalProps {
    viewCourt: Court;
    setViewCourt: (court: Court | null) => void;
    setSelectedCourt: (court: Court) => void;
    currentUser: any;            // 👉 Nhận thông tin user để biết ai đang đánh giá
    refreshCourts: () => void;   // 👉 Hàm load lại danh sách sân sau khi đánh giá xong
}

export default function CourtModal({ viewCourt, setViewCourt, setSelectedCourt, currentUser, refreshCourts }: CourtModalProps) {
    const DEFAULT_COURT_IMG = "https://images.unsplash.com/photo-1622279457486-69d73ad5e4d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

    // State cho Form đánh giá
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const reviews = viewCourt.reviews || [];
    const totalReviews = reviews.length;
    const realRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : "5.0";

    const handleSubmitReview = async (e: FormEvent) => {
        e.preventDefault();
        if (!currentUser) return toast.error('Vui lòng đăng nhập để đánh giá!');

        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating, comment, courtId: viewCourt.id, userId: currentUser.id })
        });

        if (res.ok) {
            toast.success('Cảm ơn bạn đã đánh giá!');
            setComment('');
            refreshCourts(); // Tải lại danh sách sân ngoài trang chủ
            setViewCourt(null); // Đóng pop-up
        } else {
            toast.error('Không thể gửi đánh giá lúc này.');
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl transform scale-100 transition-all max-h-[90vh] overflow-y-auto">
                {/* Ảnh cover */}
                <div className="w-full h-64 sm:h-72 bg-slate-200 relative shrink-0">
                    <img src={viewCourt.imageUrl || DEFAULT_COURT_IMG} alt={viewCourt.name} className="w-full h-full object-cover" />
                    <button onClick={() => setViewCourt(null)} className="absolute top-4 right-4 bg-black/50 text-white hover:bg-red-500 rounded-full p-2 backdrop-blur-md transition-colors cursor-pointer">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="w-full p-6 sm:p-8 flex flex-col bg-white">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-2xl font-bold text-slate-800">{viewCourt.name}</h2>
                        <span className="flex items-center gap-1 font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">
                            ★ {realRating} <span className="text-xs text-slate-400 font-normal">({totalReviews})</span>
                        </span>
                    </div>
                    <p className="text-slate-500 mb-6 flex items-center gap-1">📍 {viewCourt.location}</p>

                    {/* Khu vực Gửi Đánh giá */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                        <h4 className="font-bold text-slate-700 mb-3">Viết đánh giá của bạn</h4>
                        <form onSubmit={handleSubmitReview} className="flex flex-col gap-3">
                            <select value={rating} onChange={e => setRating(Number(e.target.value))} className="w-full md:w-1/3 px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-sm">
                                <option value={5}>⭐⭐⭐⭐⭐ Tuyệt vời</option>
                                <option value={4}>⭐⭐⭐⭐ Rất tốt</option>
                                <option value={3}>⭐⭐⭐ Bình thường</option>
                                <option value={2}>⭐⭐ Tệ</option>
                                <option value={1}>⭐ Rất tệ</option>
                            </select>
                            <div className="flex gap-2">
                                <input type="text" placeholder="Bạn thấy sân này thế nào?" required value={comment} onChange={e => setComment(e.target.value)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-sm" />
                                <button type="submit" className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm cursor-pointer">Gửi</button>
                            </div>
                        </form>
                    </div>

                    <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-auto">
                        <div>
                            <p className="text-slate-500 text-sm font-medium mb-1">Giá thuê:</p>
                            <p className="text-2xl font-extrabold text-blue-600">{viewCourt.pricePerHour.toLocaleString('vi-VN')}đ<span className="text-sm font-normal text-slate-500">/giờ</span></p>
                        </div>
                        <button onClick={() => { setSelectedCourt(viewCourt); setViewCourt(null); }} className="bg-slate-900 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-slate-900/20 cursor-pointer">
                            ĐẶT LỊCH NGAY
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}