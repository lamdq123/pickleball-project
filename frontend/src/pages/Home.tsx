import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

interface Court { id: number; name: string; location: string; pricePerHour: number; imageUrl?: string; }
interface Booking { id: number; court: Court; bookDate: string; timeSlot: string; createdAt: string; }

function Home() {

    const [courts, setCourts] = useState<Court[]>([]);
    const [history, setHistory] = useState<Booking[]>([]);
    const [token, setToken] = useState(localStorage.getItem('customer_token') || '');
    const [currentUser, setCurrentUser] = useState<any>(JSON.parse(localStorage.getItem('customer_info') || 'null'));
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', password: '' });

    // 👉 State quản lý luồng Đặt sân & Xem chi tiết
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null); // Sân đang chọn để Đặt giờ
    const [viewCourt, setViewCourt] = useState<Court | null>(null);         // Sân đang bật Pop-up xem chi tiết

    const [bookDate, setBookDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [showQR, setShowQR] = useState(false);
    const [qrUrl, setQrUrl] = useState('');
    const [bookingPayload, setBookingPayload] = useState<any>(null);

    const TIME_SLOTS = ['05:00 - 06:00', '06:00 - 07:00', '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00'];

    // Placeholder Image tĩnh (Dùng tạm khi DB chưa có ảnh)
    const DEFAULT_COURT_IMG = "https://images.unsplash.com/photo-1622279457486-69d73ad5e4d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

    useEffect(() => {
        fetchCourts();
        if (token) fetchHistory();
    }, [token]);

    useEffect(() => {
        if (selectedCourt && bookDate) {
            fetch(`/api/check-slots?courtId=${selectedCourt.id}&date=${bookDate}`)
                .then(res => res.json())
                .then(data => { if (Array.isArray(data)) setBookedSlots(data); })
                .catch(err => console.error(err));
        } else {
            setBookedSlots([]);
        }
        setTimeSlot('');
    }, [selectedCourt, bookDate]);

    const fetchCourts = async () => {
        const res = await fetch('/api/courts');
        if (res.ok) setCourts(await res.json());
    };

    const fetchHistory = async () => {
        const res = await fetch('/api/customer?action=history', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setHistory(await res.json());
        else handleLogout();
    };

    const handleAuth = async (e: FormEvent) => {
        e.preventDefault();
        const res = await fetch(`/api/customer?action=${authMode}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authForm)
        });
        const data = await res.json();

        if (res.ok) {
            if (authMode === 'register') {
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                setAuthMode('login');
            } else {
                localStorage.setItem('customer_token', data.token);
                localStorage.setItem('customer_info', JSON.stringify(data.user));
                setToken(data.token); setCurrentUser(data.user);
            }
            setAuthForm({ name: '', email: '', phone: '', password: '' });
        } else alert(data.error);
    };

    const handleLogout = () => {
        localStorage.removeItem('customer_token'); localStorage.removeItem('customer_info');
        setToken(''); setCurrentUser(null); setHistory([]);
    };

    const handleInitBooking = (e: FormEvent) => {
        e.preventDefault();
        if (!currentUser || !selectedCourt) return;
        const amount = selectedCourt.pricePerHour;
        const addInfo = `Thanh toan san ${selectedCourt.id} KH ${currentUser.id}`;
        const url = `https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=PICKLEBALL%20CLUB`;
        setQrUrl(url);
        setBookingPayload({ userId: currentUser.id, courtId: selectedCourt.id, bookDate, timeSlot });
        setShowQR(true);
    };

    const handleConfirmPayment = async () => {
        setShowQR(false);
        const res = await fetch('/api/bookings', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bookingPayload)
        });
        if (res.ok) {
            alert('🎉 Thanh toán thành công! Chúng tôi đã gửi biên lai về Email của bạn.');
            setSelectedCourt(null); setBookDate(''); setTimeSlot(''); setBookingPayload(null);
            fetchHistory();
        } else alert((await res.json()).error);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
            {/* NAVBAR */}
            <nav className="flex justify-between items-center px-6 md:px-10 py-4 bg-slate-900 text-white shadow-lg sticky top-0 z-30">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <span className="text-emerald-400">🎾</span> Pickleball Club
                </h2>
                <div className="flex items-center gap-4">
                    <Link to="/profile" className="hidden md:inline text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer">
                        Xin chào, <strong className="font-semibold text-white">{currentUser.name}</strong>
                    </Link>
                    <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors">Đăng xuất</button>
                </div>
            </nav>

            {/* HERO BANNER SECTION */}
            {!currentUser && (
                <section className="bg-linear-to-br from-slate-800 to-blue-900 text-white py-20 px-6 text-center shadow-inner">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Trải nghiệm đặt sân Pickleball siêu tốc</h1>
                    <p className="text-lg md:text-xl text-blue-200 mb-8 max-w-2xl mx-auto">Hệ thống thông minh giúp bạn tra cứu giờ trống, đặt sân và thanh toán tự động chỉ trong vài giây.</p>
                    <div className="inline-block bg-blue-600 text-white font-bold py-2 px-6 rounded-full text-sm shadow-lg shadow-blue-900/50">
                        Tham gia cộng đồng ngay hôm nay
                    </div>
                </section>
            )}

            <div className="max-w-6xl mx-auto px-4 mt-10">
                {!currentUser ? (
                    /* FORM ĐĂNG NHẬP / ĐĂNG KÝ */
                    <div className="flex justify-center mt-10">
                        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md mx-auto border border-slate-100 transform transition-all">
                            <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">
                                {authMode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
                            </h2>
                            <p className="text-center text-slate-500 mb-8">Vui lòng điền thông tin của bạn</p>

                            <form onSubmit={handleAuth} className="flex flex-col gap-5">
                                {authMode === 'register' && (
                                    <>
                                        <input type="text" placeholder="Họ và Tên" required value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                                        <input type="text" placeholder="Số điện thoại" required value={authForm.phone} onChange={e => setAuthForm({ ...authForm, phone: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                                    </>
                                )}
                                <input type="email" placeholder="Email của bạn" required value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                                <input type="password" placeholder="Mật khẩu" required value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />

                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md shadow-blue-500/30 mt-2">
                                    {authMode === 'login' ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN'}
                                </button>
                            </form>

                            <p className="text-center mt-6 text-sm text-slate-600">
                                {authMode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                                <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-blue-600 font-bold hover:underline">
                                    {authMode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                                </button>
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in-up">

                        {/* DANH SÁCH SÂN */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-blue-600 pl-3">Danh sách sân hôm nay</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {courts.map(court => (
                                <div key={court.id} className="bg-white rounded-xl shadow-md border border-slate-100 p-5 hover:shadow-xl transition-shadow flex flex-col justify-between">
                                    <div>
                                        <div className="h-40 bg-slate-200 rounded-lg mb-4 overflow-hidden">
                                            <img src={court.imageUrl || DEFAULT_COURT_IMG} alt="Court" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">{court.name}</h3>
                                        <p className="text-slate-500 text-sm mb-4 flex items-center gap-1 line-clamp-1">
                                            📍 {court.location}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-blue-600 font-extrabold text-lg mb-4">{court.pricePerHour.toLocaleString('vi-VN')} đ <span className="text-sm text-slate-500 font-normal">/giờ</span></p>
                                        <div className="flex gap-2">
                                            <button onClick={() => setViewCourt(court)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors border border-slate-200">
                                                Xem chi tiết
                                            </button>
                                            <button onClick={() => setSelectedCourt(court)} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/30">
                                                ĐẶT NGAY
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* FORM ĐẶT SÂN */}
                        {selectedCourt && (
                            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 md:p-8 mb-12 animate-fade-in-up scroll-mt-24" id="booking-form">
                                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Tạo lịch đặt: <span className="text-blue-600">{selectedCourt.name}</span>
                                </h3>
                                <form onSubmit={handleInitBooking} className="flex flex-wrap gap-4 items-end">
                                    <div className="flex flex-col w-full md:w-64">
                                        <label className="text-sm font-semibold text-slate-600 mb-2">Ngày chơi:</label>
                                        <input type="date" required value={bookDate} onChange={e => setBookDate(e.target.value)} className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full bg-slate-50" />
                                    </div>
                                    <div className="flex flex-col w-full md:w-64">
                                        <label className="text-sm font-semibold text-slate-600 mb-2">Khung giờ:</label>
                                        <select required value={timeSlot} onChange={e => setTimeSlot(e.target.value)} className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full bg-slate-50">
                                            <option value="" disabled>-- Chọn giờ --</option>
                                            {TIME_SLOTS.map(slot => {
                                                const isBooked = bookedSlots.includes(slot);
                                                return (
                                                    <option key={slot} value={slot} disabled={isBooked} className={isBooked ? 'text-red-400 line-through' : 'text-slate-800'}>
                                                        {slot} {isBooked ? '(Đã có người đặt)' : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0">
                                        <button type="submit" className="flex-1 md:flex-none px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/30">
                                            XÁC NHẬN & THANH TOÁN
                                        </button>
                                        <button type="button" onClick={() => setSelectedCourt(null)} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors border border-slate-200">
                                            HỦY
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* =========================================
                MODAL XEM CHI TIẾT SÂN (COURT DETAIL)
            ========================================= */}
            {viewCourt && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl transform scale-100 transition-all">

                        {/* Ảnh Sân (Bên trái) */}
                        <div className="w-full md:w-1/2 h-64 md:h-auto bg-slate-200 relative">
                            <img src={viewCourt.imageUrl || DEFAULT_COURT_IMG} alt={viewCourt.name} className="w-full h-full object-cover" />
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-blue-600 shadow">
                                Phổ biến nhất
                            </div>
                        </div>

                        {/* Thông tin Sân (Bên phải) */}
                        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-white">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-2xl font-bold text-slate-800">{viewCourt.name}</h2>
                                    <button onClick={() => setViewCourt(null)} className="text-slate-400 hover:text-red-500 transition-colors bg-slate-100 hover:bg-red-50 rounded-full p-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                                <p className="text-slate-500 mb-6 flex items-center gap-1">📍 {viewCourt.location}</p>

                                {/* Badges Tiện ích ảo */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-100 flex items-center gap-1">✨ Sân thảm chuẩn thi đấu</span>
                                    <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1">💡 Đèn LED ban đêm</span>
                                    <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1">🥤 Có bán nước & bóng</span>
                                    <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1">🚗 Đỗ xe ô tô miễn phí</span>
                                </div>

                                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                    Trải nghiệm không gian thể thao đẳng cấp với mặt sân chống trơn trượt đạt chuẩn quốc tế. Không gian rộng rãi, thoáng mát, cực kỳ phù hợp cho cả tập luyện nghiệp dư lẫn thi đấu.
                                </p>
                            </div>

                            <div className="pt-6 border-t border-slate-100 mt-auto">
                                <div className="flex items-end justify-between mb-4">
                                    <span className="text-slate-500 font-medium">Giá thuê:</span>
                                    <span className="text-2xl font-extrabold text-blue-600">{viewCourt.pricePerHour.toLocaleString('vi-VN')}đ<span className="text-sm font-normal text-slate-500">/giờ</span></span>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedCourt(viewCourt);
                                        setViewCourt(null);
                                        // Scroll từ từ xuống form đặt sân
                                        setTimeout(() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
                                    }}
                                    className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-900/20"
                                >
                                    ĐẶT LỊCH SÂN NÀY NGAY
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL MÃ QR THANH TOÁN */}
            {showQR && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center transform transition-all scale-100">
                        <h3 className="text-2xl font-bold text-blue-600 mb-2">Quét mã thanh toán</h3>
                        <p className="text-slate-500 text-sm mb-6">Sử dụng App ngân hàng hoặc Momo để quét</p>

                        <div className="border border-slate-200 p-3 rounded-xl inline-block mb-6 bg-slate-50 shadow-inner">
                            <img src={qrUrl} alt="QR Code" className="w-56 h-56 object-contain rounded-lg" />
                        </div>

                        <div className="flex flex-col gap-3">
                            <button onClick={handleConfirmPayment} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md shadow-emerald-600/30">
                                ✅ TÔI ĐÃ CHUYỂN KHOẢN
                            </button>
                            <button onClick={() => setShowQR(false)} className="w-full bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold py-3 rounded-xl transition-colors">
                                ❌ HỦY GIAO DỊCH
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;