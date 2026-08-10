import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

interface Court { id: number; name: string; location: string; pricePerHour: number; }
interface Booking { id: number; court: Court; bookDate: string; timeSlot: string; createdAt: string; }

function Home() {
    const [courts, setCourts] = useState<Court[]>([]);
    const [history, setHistory] = useState<Booking[]>([]);
    const [token, setToken] = useState(localStorage.getItem('customer_token') || '');
    const [currentUser, setCurrentUser] = useState<any>(JSON.parse(localStorage.getItem('customer_info') || 'null'));
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', password: '' });
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [bookDate, setBookDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [showQR, setShowQR] = useState(false);
    const [qrUrl, setQrUrl] = useState('');
    const [bookingPayload, setBookingPayload] = useState<any>(null);

    const TIME_SLOTS = ['05:00 - 06:00', '06:00 - 07:00', '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00'];

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

            {/* TASK 1: REFACTOR NAVBAR */}
            <nav className="flex justify-between items-center px-6 md:px-10 py-4 bg-slate-900 text-white shadow-lg sticky top-0 z-40">
                <h2 className="text-2xl font-bold tracking-tight">🎾 Pickleball Club</h2>
                <div>
                    {currentUser ? (
                        <div className="flex items-center gap-4">
                            <span className="hidden md:inline text-slate-300">Xin chào, <strong className="font-semibold text-white">{currentUser.name}</strong></span>
                            <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors">Đăng xuất</button>
                        </div>
                    ) : (
                        <Link to="/admin" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">🔑 Dành cho Admin</Link>
                    )}
                </div>
            </nav>

            {/* TASK 2: HERO BANNER SECTION */}
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

                    /* TASK 3: REFACTOR AUTH CARD */
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
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-blue-600 pl-3">Danh sách sân hôm nay</h2>
                        </div>

                        {/* TASK 4: REFACTOR COURT CARDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {courts.map(court => (
                                <div key={court.id} className="bg-white rounded-xl shadow-md border-t-4 border-blue-500 p-6 hover:shadow-lg transition-shadow relative overflow-hidden group">
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">{court.name}</h3>
                                    <p className="text-slate-500 text-sm mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        {court.location}
                                    </p>
                                    <p className="text-blue-600 font-extrabold text-lg mb-6">{court.pricePerHour.toLocaleString('vi-VN')} đ/giờ</p>
                                    <button onClick={() => setSelectedCourt(court)} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">
                                        ĐẶT SÂN NÀY
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* TASK 5: REFACTOR BOOKING FORM */}
                        {selectedCourt && (
                            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 md:p-8 mb-12 animate-fade-in-up">
                                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Tạo lịch đặt: {selectedCourt.name}
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
                                            THANH TOÁN
                                        </button>
                                        <button type="button" onClick={() => setSelectedCourt(null)} className="px-6 py-3 bg-slate-400 text-white rounded-lg font-bold hover:bg-slate-500 transition-colors">
                                            HỦY
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="flex items-center gap-3 mb-6 mt-8">
                            <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-slate-600 pl-3">Lịch sử đặt sân</h2>
                        </div>

                        {/* TASK 6: REFACTOR HISTORY TABLE */}
                        {history.length === 0 ? (
                            <div className="bg-white p-8 rounded-2xl text-center border border-dashed border-slate-300">
                                <p className="text-slate-500">Bạn chưa có lịch đặt nào.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-10">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-700 text-white">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm uppercase tracking-wider font-semibold">Mã vé</th>
                                                <th className="px-6 py-4 text-left text-sm uppercase tracking-wider font-semibold">Sân</th>
                                                <th className="px-6 py-4 text-left text-sm uppercase tracking-wider font-semibold">Ngày chơi</th>
                                                <th className="px-6 py-4 text-left text-sm uppercase tracking-wider font-semibold">Khung giờ</th>
                                                <th className="px-6 py-4 text-left text-sm uppercase tracking-wider font-semibold">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {history.map(b => (
                                                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-slate-700">#{b.id}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-900">{b.court?.name}</td>
                                                    <td className="px-6 py-4 text-slate-600">{b.bookDate}</td>
                                                    <td className="px-6 py-4 font-bold text-blue-600">{b.timeSlot}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                            Đã xác nhận
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* TASK 7: REFACTOR QR MODAL */}
            {showQR && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center transform transition-all scale-100">
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Quét mã thanh toán</h3>
                        <p className="text-slate-500 text-sm mb-6">Sử dụng App ngân hàng hoặc Momo để quét</p>

                        <div className="border border-slate-200 p-3 rounded-xl inline-block mb-6 bg-slate-50 shadow-inner">
                            <img src={qrUrl} alt="QR Code" className="w-56 h-56 object-contain rounded-lg" />
                        </div>

                        <div className="flex flex-col gap-3">
                            <button onClick={handleConfirmPayment} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md shadow-emerald-600/30">
                                ✅ TÔI ĐÃ CHUYỂN KHOẢN
                            </button>
                            <button onClick={() => setShowQR(false)} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md shadow-red-500/30">
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