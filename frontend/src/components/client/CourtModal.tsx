interface CourtModalProps {
    viewCourt: any;
    setViewCourt: (court: any) => void;
    setSelectedCourt: (court: any) => void;
    currentUser: any;
    refreshCourts: () => void;
}

export default function CourtModal({ viewCourt, setViewCourt, setSelectedCourt }: CourtModalProps) {
    const DEFAULT_COURT_IMG = "https://images.unsplash.com/photo-1622279457486-69d73ad5e4d2?auto=format&fit=crop&w=1000&q=80";

    // Logic tính giá Giờ Vàng
    const hasGoldenHour = !!viewCourt.goldenHourStart && !!viewCourt.goldenHourEnd && !!viewCourt.goldenDiscount;
    const goldenPrice = hasGoldenHour ? Math.round(viewCourt.pricePerHour * (100 - (viewCourt.goldenDiscount ?? 0)) / 100) : null;

    // Logic tính toán Đánh giá (Review)
    const reviews = viewCourt.reviews || [];
    const totalReviews = reviews.length;
    const realRating = totalReviews > 0
        ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : "5.0";

    // Hàm tiện ích: Vẽ số lượng Sao Vàng dựa trên điểm Rating
    const renderStars = (rating: number) => {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    };

    return (
        // 👉 1. Bấm vào lớp nền mờ (đen) sẽ tự động tắt Modal
        <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setViewCourt(null)}
        >
            {/* 👉 2. Dùng stopPropagation để bấm vào vùng trắng không bị tắt Modal */}
            <div
                className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-fade-in-up relative"
                onClick={(e) => e.stopPropagation()}
            >

                {/* 🌟 CỘT TRÁI: ẢNH SÂN */}
                <div className="md:w-1/2 relative h-64 md:h-auto bg-slate-100">
                    <img src={viewCourt.imageUrl || DEFAULT_COURT_IMG} alt={viewCourt.name} className="w-full h-full object-cover" />

                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {/* Huy hiệu hiển thị tổng quan sao */}
                        <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-bold text-white flex items-center gap-1 shadow-sm">
                            <span className="text-amber-400">★</span> {realRating} ({totalReviews} đánh giá)
                        </div>
                        {hasGoldenHour && (
                            <div className="bg-amber-500/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-white uppercase tracking-wide shadow-sm">
                                Giờ vàng: {viewCourt.goldenHourStart} - {viewCourt.goldenHourEnd}
                            </div>
                        )}
                    </div>
                </div>

                {/* 🌟 CỘT PHẢI: THÔNG TIN SÂN & ĐÁNH GIÁ (Cho phép cuộn dọc) */}
                <div className="md:w-1/2 p-6 md:p-8 flex flex-col h-full max-h-[90vh] overflow-y-auto">

                    {/* Phần 1: Tên, Địa chỉ, Giá */}
                    <div className="mb-6 border-b border-slate-100 pb-6">
                        <h2 className="text-3xl font-black text-slate-800 mb-2">{viewCourt.name}</h2>
                        <p className="text-slate-500 flex items-center gap-2 mb-4">📍 {viewCourt.location}</p>

                        <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100">
                            <span className="text-slate-500 font-medium">Giá thuê:</span>
                            <div className="text-right">
                                {goldenPrice !== null ? (
                                    <>
                                        <span className="text-slate-400 line-through text-sm mr-2">{viewCourt.pricePerHour.toLocaleString('vi-VN')} đ</span>
                                        <span className="text-blue-600 font-black text-xl">{goldenPrice.toLocaleString('vi-VN')} đ<span className="text-sm font-normal text-slate-500">/giờ</span></span>
                                    </>
                                ) : (
                                    <span className="text-blue-600 font-black text-xl">{viewCourt.pricePerHour.toLocaleString('vi-VN')} đ<span className="text-sm font-normal text-slate-500">/giờ</span></span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 👉 3. Phần 2: KHU VỰC HIỂN THỊ ĐÁNH GIÁ */}
                    <div className="flex-1 mb-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span>💬</span> Đánh giá từ khách hàng
                        </h3>

                        {reviews.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <span className="text-3xl block mb-2">⭐</span>
                                <p className="text-slate-500 text-sm">Chưa có đánh giá nào cho sân này. Hãy là người đầu tiên trải nghiệm!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Lặp qua từng đánh giá để in ra */}
                                {reviews.map((review: any) => (
                                    <div key={review.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-slate-700 text-sm">Khách hàng thành viên</span>
                                            {/* In ra số sao khách chọn */}
                                            <span className="text-amber-400 text-sm tracking-widest">{renderStars(review.rating)}</span>
                                        </div>
                                        {/* In ra bình luận */}
                                        <p className="text-slate-600 text-sm">{review.comment || "Khách hàng không để lại bình luận."}</p>
                                        <span className="text-xs text-slate-400 mt-2 block">
                                            Đã đánh giá vào: {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Phần 3: Nút chuyển sang Đặt Sân */}
                    <button
                        onClick={() => {
                            setViewCourt(null); // Đóng modal hiện tại
                            setSelectedCourt(viewCourt); // Mở Modal đặt sân lên
                        }}
                        className="w-full py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 mt-auto cursor-pointer"
                    >
                        ĐẶT SÂN NGAY
                    </button>
                </div>
            </div>
        </div>
    );
}   