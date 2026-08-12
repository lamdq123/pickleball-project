interface Court { id: number; name: string; location: string; pricePerHour: number; imageUrl?: string; }

interface CourtModalProps {
    viewCourt: Court;
    setViewCourt: (court: Court | null) => void;
    setSelectedCourt: (court: Court) => void;
}

export default function CourtModal({ viewCourt, setViewCourt, setSelectedCourt }: CourtModalProps) {
    const DEFAULT_COURT_IMG = "https://images.unsplash.com/photo-1622279457486-69d73ad5e4d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl transform scale-100 transition-all max-h-[90vh] overflow-y-auto">
                <div className="w-full h-64 sm:h-72 bg-slate-200 relative shrink-0">
                    <img src={viewCourt.imageUrl || DEFAULT_COURT_IMG} alt={viewCourt.name} className="w-full h-full object-cover" />
                    <button onClick={() => setViewCourt(null)} className="absolute top-4 right-4 bg-black/50 text-white hover:bg-red-500 hover:text-white transition-colors rounded-full p-2 backdrop-blur-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="w-full p-6 sm:p-8 flex flex-col bg-white">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-2xl font-bold text-slate-800">{viewCourt.name}</h2>
                        <span className="flex items-center gap-1 font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">
                            ★ {(4.5 + (viewCourt.id % 5) * 0.1).toFixed(1)}
                        </span>
                    </div>
                    <p className="text-slate-500 mb-5 flex items-center gap-1">📍 {viewCourt.location}</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-100">✨ Sân chuẩn thi đấu</span>
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200">💡 Đèn LED</span>
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200">🥤 Bán nước & bóng</span>
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200">🚗 Đỗ ô tô free</span>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        Trải nghiệm không gian thể thao đẳng cấp với mặt sân chống trơn trượt đạt chuẩn quốc tế. Không gian rộng rãi, thoáng mát, cực kỳ phù hợp cho cả tập luyện nghiệp dư lẫn thi đấu.
                    </p>

                    <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-auto">
                        <div>
                            <p className="text-slate-500 text-sm font-medium mb-1">Giá thuê:</p>
                            <p className="text-2xl font-extrabold text-blue-600">{viewCourt.pricePerHour.toLocaleString('vi-VN')}đ<span className="text-sm font-normal text-slate-500">/giờ</span></p>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedCourt(viewCourt);
                                setViewCourt(null);
                                setTimeout(() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
                            }}
                            className="bg-slate-900 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-900/20"
                        >
                            ĐẶT LỊCH NGAY
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}