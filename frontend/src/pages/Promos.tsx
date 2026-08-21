import { useEffect, useState } from 'react';
import toast from 'react-hot-toast'; // 👉 1. Thêm thư viện thông báo
import Navbar from '../components/client/Navbar';
import Footer from '../components/client/Footer';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Promos() {
    const [promos, setPromos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem('customer_info') || 'null');
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchPromos = async () => {
            const res = await fetch('/api/promos');
            if (res.ok) setPromos(await res.json());
            setIsLoading(false);
        };
        fetchPromos();
    }, []);

    // 👉 2. HÀM XỬ LÝ COPY MÃ VÀO KHAY NHỚ TẠM (CLIPBOARD)
    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success(`Đã sao chép mã: ${code}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar currentUser={currentUser} onLogout={() => {
                localStorage.removeItem('customer_token');
                localStorage.removeItem('customer_info');
                localStorage.removeItem('token');
                window.location.href = '/';
            }} />
            
            <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full animate-fade-in-up">
                <div className="flex items-center gap-3 mb-8">
                    <span className="text-3xl">🎁</span>
                    <h2 className="text-3xl font-black text-slate-800">Siêu Ưu Đãi</h2>
                </div>

                {isLoading ? <LoadingSpinner /> : promos.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <span className="text-5xl block mb-4">🎫</span>
                        <p className="text-slate-500 font-medium text-lg">Hiện tại chưa có chương trình ưu đãi nào!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {promos.map(promo => {
                            const isExpired = promo.validTo && today > promo.validTo;
                            const isNotStarted = promo.validFrom && today < promo.validFrom;
                            
                            return (
                                <div key={promo.id} className={`flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-sm border ${isExpired ? 'border-slate-200 grayscale opacity-60' : 'border-orange-200'} transition-transform hover:-translate-y-1`}>
                                    
                                    {/* Cột trái: Hiển thị Mức Giảm */}
                                    <div className={`sm:w-1/3 flex flex-col items-center justify-center p-6 text-green-500 ${isExpired ? 'bg-slate-400' : 'bg-liear-to-br from-orange-400 to-red-500'}`}>
                                        <span className="text-sm font-bold opacity-90">GIẢM NGAY</span>
                                        {/* 👉 Tự động nhận diện hiển thị % hoặc đ */}
                                        <span className="text-3xl font-black text-center mt-1">
                                            {promo.isPercent ? `${promo.discount}%` : `${promo.discount.toLocaleString('vi-VN')}đ`}
                                        </span>
                                    </div>
                                    
                                    {/* Cột phải: Thông tin & Nút Copy */}
                                    <div className="sm:w-2/3 bg-white p-5 flex flex-col justify-between border-l border-dashed border-slate-300 relative">
                                        <div className="hidden sm:block absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-50 rounded-full border-r border-slate-300"></div>

                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg line-clamp-2">{promo.description || 'Ưu đãi đặt sân'}</h3>
                                            <div className="mt-3 space-y-1 text-xs font-medium text-slate-500">
                                                {promo.validFrom && <p>Mở bán: <span className="text-slate-700">{promo.validFrom}</span></p>}
                                                {promo.validTo && <p>HSD: <span className="text-slate-700">{promo.validTo}</span></p>}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                            {/* 👉 3. Giao diện Mã Code & Nút Copy */}
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 uppercase tracking-widest select-all">
                                                    {promo.code}
                                                </span>
                                                {!isExpired && (
                                                    <button 
                                                        onClick={() => handleCopyCode(promo.code)}
                                                        className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer active:scale-95 flex items-center gap-1"
                                                    >
                                                        <span>📋</span> Copy
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                {isExpired && <span className="text-xs font-bold text-red-500 border border-red-500 px-2 py-1 rounded">HẾT HẠN</span>}
                                                {isNotStarted && <span className="text-xs font-bold text-amber-500 border border-amber-500 px-2 py-1 rounded">SẮP MỞ</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}