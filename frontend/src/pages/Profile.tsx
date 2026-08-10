import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

interface Court { id: number; name: string; location: string; pricePerHour: number; imageUrl?: string; }
interface Booking { id: number; court: Court; bookDate: string; timeSlot: string; createdAt: string; }

function Profile() {
    const navigate = useNavigate();
    const [history, setHistory] = useState<Booking[]>([]);
    const [token] = useState(localStorage.getItem('customer_token') || '');
    const [currentUser] = useState<any>(JSON.parse(localStorage.getItem('customer_info') || 'null'));

    useEffect(() => {
        if (!currentUser) {
            navigate('/'); // Nếu chưa đăng nhập, đá về trang chủ
        } else {
            fetchHistory();
        }
    }, [currentUser, navigate]);

    const fetchHistory = async () => {
        const res = await fetch('/api/customer?action=history', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setHistory(await res.json());
        else {
            localStorage.removeItem('customer_token');
            localStorage.removeItem('customer_info');
            navigate('/');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_info');
        navigate('/');
    };

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
            {/* NAVBAR */}
            <nav className="flex justify-between items-center px-6 md:px-10 py-4 bg-slate-900 text-white shadow-lg sticky top-0 z-30">
                <Link to="/" className="text-2xl font-bold tracking-tight flex items-center gap-2 hover:text-emerald-400 transition-colors">
                    <span className="text-emerald-400">🎾</span> Pickleball Club
                </Link>
                <div className="flex items-center gap-4">
                    <span className="hidden md:inline text-slate-300">Xin chào, <strong className="font-semibold text-white">{currentUser.name}</strong></span>
                    <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Trang chủ</Link>
                    <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium border border-slate-600 rounded-lg hover:bg-red-500 hover:border-red-500 transition-colors">Đăng xuất</button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 mt-10">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN */}
                    <div className="w-full md:w-1/3">
                        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 sticky top-24">
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                                    {currentUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">{currentUser.name}</h2>
                                    <p className="text-sm text-slate-500">Khách hàng thành viên</p>
                                </div>
                            </div>

                            <form className="flex flex-col gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Họ và Tên</label>
                                    <input type="text" disabled defaultValue={currentUser.name} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Email</label>
                                    <input type="email" disabled defaultValue={currentUser.email} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Số điện thoại</label>
                                    <input type="text" disabled defaultValue={currentUser.phone || 'Chưa cập nhật'} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none" />
                                </div>
                                <button type="button" className="mt-4 w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all shadow-md">
                                    CẬP NHẬT THÔNG TIN
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* CỘT PHẢI: LỊCH SỬ ĐẶT SÂN */}
                    <div className="w-full md:w-2/3">
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-blue-600 pl-3">Lịch sử đặt sân của tôi</h2>
                        </div>

                        {history.length === 0 ? (
                            <div className="bg-white p-12 rounded-2xl text-center border border-dashed border-slate-300">
                                <span className="text-4xl mb-4 block">🎫</span>
                                <h3 className="text-lg font-bold text-slate-700 mb-2">Chưa có lịch đặt nào</h3>
                                <p className="text-slate-500 mb-6">Bạn chưa trải nghiệm sân Pickleball nào của chúng tôi.</p>
                                <Link to="/" className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors">
                                    ĐẶT SÂN NGAY
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {history.map(b => (
                                    <div key={b.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800">{b.court?.name}</h3>
                                                <p className="text-slate-500 text-sm mb-1">Mã vé: <span className="font-mono font-bold text-slate-700">#{b.id}</span></p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold">📅 {b.bookDate}</span>
                                                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">⏰ {b.timeSlot}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                                ✅ Đã xác nhận
                                            </span>
                                            <button className="text-sm text-red-500 font-semibold hover:underline">Hủy lịch</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Profile;