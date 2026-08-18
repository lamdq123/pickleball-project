import { useEffect, useState } from 'react';
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

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar currentUser={currentUser} onLogout={() => { }} />
            <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full animate-fade-in-up">
                <div className="flex items-center gap-3 mb-8">
                    <span className="text-3xl">🎁</span>
                    <h2 className="text-3xl font-black text-slate-800">Siêu Ưu Đãi</h2>
                </div>

                {isLoading ? <LoadingSpinner /> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {promos.map(promo => {
                            const isExpired = promo.validTo && today > promo.validTo;
                            const isNotStarted = promo.validFrom && today < promo.validFrom;

                            return (
                                <div key={promo.id} className={`flex rounded-2xl overflow-hidden shadow-sm border ${isExpired ? 'border-slate-200 grayscale opacity-60' : 'border-orange-200'} transition-transform hover:-translate-y-1`}>
                                    {/* Cột trái: % Giảm giá */}
                                    <div className={`w-1/3 flex flex-col items-center justify-center p-4 text-white ${isExpired ? 'bg-slate-400' : 'bg-linear-to-br from-orange-400 to-red-500'}`}>
                                        <span className="text-sm font-bold">GIẢM</span>
                                        <span className="text-4xl font-black">{promo.discount}%</span>
                                    </div>

                                    {/* Cột phải: Thông tin */}
                                    <div className="w-2/3 bg-white p-5 flex flex-col justify-between border-l border-dashed border-slate-300 relative">
                                        {/* Nút cắt viền (Ticket effect) */}
                                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-50 rounded-full border-r border-slate-300"></div>

                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">{promo.description || 'Ưu đãi đặt sân'}</h3>
                                            <div className="mt-2 space-y-1 text-xs font-medium text-slate-500">
                                                {promo.validFrom && <p>Mở bán: <span className="text-slate-700">{promo.validFrom}</span></p>}
                                                {promo.validTo && <p>HSD: <span className="text-slate-700">{promo.validTo}</span></p>}
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 uppercase tracking-widest">{promo.code}</span>
                                            {isExpired && <span className="text-xs font-bold text-red-500 border border-red-500 px-2 py-1 rounded">HẾT HẠN</span>}
                                            {isNotStarted && <span className="text-xs font-bold text-amber-500 border border-amber-500 px-2 py-1 rounded">SẮP MỞ</span>}
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