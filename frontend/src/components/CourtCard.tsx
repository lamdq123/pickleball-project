interface Court { id: number; name: string; location: string; pricePerHour: number; imageUrl?: string; }

interface CourtCardProps {
    court: Court;
    setViewCourt: (court: Court) => void;
    setSelectedCourt: (court: Court) => void;
}

export default function CourtCard({ court, setViewCourt, setSelectedCourt }: CourtCardProps) {
    const DEFAULT_COURT_IMG = "https://images.unsplash.com/photo-1622279457486-69d73ad5e4d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
    
    // Thuật toán Đánh giá giả lập (Rating)
    const mockRating = (court.id % 5 === 0) ? "5.0" : (4.5 + (court.id % 5) * 0.1).toFixed(1);
    const mockReviews = 50 + (court.id * 17) % 200;

    return (
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-5 hover:shadow-xl transition-shadow flex flex-col justify-between group">
            <div>
                <div className="h-40 bg-slate-200 rounded-lg mb-4 overflow-hidden relative">
                    <img src={court.imageUrl || DEFAULT_COURT_IMG} alt={court.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1">
                        <span className="text-amber-400">★</span> {mockRating}
                    </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1 line-clamp-1">{court.name}</h3>
                
                {/* Hiển thị số sao */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-amber-400 text-sm">★★★★★</div>
                    <span className="text-slate-500 text-xs font-medium">({mockReviews} nhận xét)</span>
                </div>

                <p className="text-slate-500 text-sm mb-4 flex items-center gap-1 line-clamp-1">📍 {court.location}</p>
            </div>
            
            <div>
                <p className="text-blue-600 font-extrabold text-lg mb-4">{court.pricePerHour.toLocaleString('vi-VN')} đ <span className="text-sm text-slate-500 font-normal">/giờ</span></p>
                <div className="flex gap-2">
                    <button onClick={() => setViewCourt(court)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors border border-slate-200">
                        Chi tiết
                    </button>
                    <button onClick={() => setSelectedCourt(court)} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/30">
                        ĐẶT NGAY
                    </button>
                </div>
            </div>
        </div>
    );
}