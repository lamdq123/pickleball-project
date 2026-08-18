interface Court {
    id: number; name: string; location: string; pricePerHour: number; imageUrl?: string; reviews?: any[];
    goldenHourStart?: string | null; goldenHourEnd?: string | null; goldenDiscount?: number | null;
}
interface CourtCardProps {
    court: Court;
    setViewCourt: (court: Court) => void;
    setSelectedCourt: (court: Court) => void;
}

export default function CourtCard({ court, setViewCourt, setSelectedCourt }: CourtCardProps) {
    const DEFAULT_COURT_IMG = "https://images.unsplash.com/photo-1622279457486-69d73ad5e4d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

    // Thuật toán Đánh giá giả lập (Rating)
    // 👉 Thuật toán Đánh giá thật (Real Rating)
    const reviews = court.reviews || [];
    const totalReviews = reviews.length;
    // Tính trung bình cộng số sao, nếu chưa có ai đánh giá thì mặc định hiển thị 5.0
    const realRating = totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : "5.0";

    const hasGoldenHour = !!court.goldenHourStart && !!court.goldenHourEnd && !!court.goldenDiscount;
    const goldenPrice = hasGoldenHour ? Math.round(court.pricePerHour * (100 - (court.goldenDiscount ?? 0)) / 100) : null;

    return (
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5 hover:shadow-xl transition-shadow flex flex-col justify-between group">
            <div>
                <div className="h-40 bg-slate-200 rounded-lg mb-4 overflow-hidden relative">
                    <img src={court.imageUrl || DEFAULT_COURT_IMG} alt={court.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                        <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1">
                            <span className="text-amber-400">★</span> {realRating}
                        </div>
                        {hasGoldenHour && (
                            <div className="bg-amber-500/90 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wide shadow-sm">
                                Giờ vàng
                            </div>
                        )}
                    </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1 line-clamp-1">{court.name}</h3>

                {/* Hiển thị số sao */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-amber-400 text-sm">★★★★★</div>
                    <span className="text-slate-500 text-xs font-medium">({totalReviews} nhận xét)</span>
                </div>

                <p className="text-slate-500 text-sm mb-4 flex items-center gap-1 line-clamp-1">📍 {court.location}</p>
            </div>

            <div>
                {/* 👉 Thêm 'flex items-center flex-wrap' để tự động căn giữa các thành phần theo chiều dọc */}
                <p className="text-blue-600 font-extrabold text-lg mb-4 flex items-center flex-wrap">
                    {/* Kiểm tra giá trị có khác null không, để lấy được cả số 0 */}
                    {goldenPrice !== null ? (
                        goldenPrice === 0 ? (
                            /* TRƯỜNG HỢP GIẢM 100% -> HIỆN "MIỄN PHÍ" */
                            <>
                                <span className="text-slate-400 line-through text-base mr-2">
                                    {court.pricePerHour.toLocaleString('vi-VN')} đ
                                </span>
                                <span className="text-emerald-500 uppercase tracking-wide">MIỄN PHÍ</span>
                                {/* 👉 Thêm ml-3 để đẩy huy hiệu ra xa một chút */}
                                <span className="ml-3 text-[10px] font-extrabold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full shadow-sm">
                                    -{court.goldenDiscount}%
                                </span>
                            </>
                        ) : (
                            /* TRƯỜNG HỢP GIỜ VÀNG BÌNH THƯỜNG */
                            <>
                                <span className="text-slate-400 line-through text-base mr-2">
                                    {court.pricePerHour.toLocaleString('vi-VN')} đ
                                </span>
                                <span>{goldenPrice.toLocaleString('vi-VN')} đ</span>
                                {/* 👉 Thêm ml-3 để đẩy huy hiệu ra xa một chút */}
                                <span className="ml-3 text-[10px] font-extrabold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full shadow-sm">
                                    -{court.goldenDiscount}%
                                </span>
                            </>
                        )
                    ) : (
                        /* TRƯỜNG HỢP KHÔNG CÓ GIỜ VÀNG */
                        <>
                            {court.pricePerHour.toLocaleString('vi-VN')} đ <span className="text-sm text-slate-500 font-normal ml-1">/giờ</span>
                        </>
                    )}
                </p>
                <div className="flex gap-2">
                    <button onClick={() => setViewCourt(court)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer">
                        Chi tiết
                    </button>
                    <button onClick={() => setSelectedCourt(court)} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/30 cursor-pointer">
                        ĐẶT NGAY
                    </button>
                </div>
            </div>
        </div>
    );
}