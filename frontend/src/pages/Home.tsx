import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

interface Court { id: number; name: string; location: string; pricePerHour: number; }
interface Booking { id: number; court: Court; bookDate: string; timeSlot: string; createdAt: string; }

function Home() {
    
    // State dữ liệu chung
    const [courts, setCourts] = useState<Court[]>([]);
    const [history, setHistory] = useState<Booking[]>([]);
    
    // State xác thực khách hàng
    const [token, setToken] = useState(localStorage.getItem('customer_token') || '');
    const [currentUser, setCurrentUser] = useState<any>(JSON.parse(localStorage.getItem('customer_info') || 'null'));
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', password: '' });

    // State Đặt sân
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [bookDate, setBookDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    
    // 👉 STATE MỚI: Dành cho tính năng Thanh toán QR
    const [showQR, setShowQR] = useState(false);
    const [qrUrl, setQrUrl] = useState('');
    const [bookingPayload, setBookingPayload] = useState<any>(null); // Lưu tạm dữ liệu đặt sân chờ thanh toán
    
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
                .catch(err => console.error("Lỗi khi tải giờ trống:", err));
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
        const res = await fetch('/api/customer?action=history', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setHistory(await res.json());
        } else {
            handleLogout();
        }
    };

    const handleAuth = async (e: FormEvent) => {
        e.preventDefault();
        const url = `/api/customer?action=${authMode}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authForm)
        });
        const data = await res.json();
        
        if (res.ok) {
            if (authMode === 'register') {
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                setAuthMode('login');
            } else {
                localStorage.setItem('customer_token', data.token);
                localStorage.setItem('customer_info', JSON.stringify(data.user));
                setToken(data.token);
                setCurrentUser(data.user);
            }
            setAuthForm({ name: '', email: '', phone: '', password: '' });
        } else {
            alert(data.error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_info');
        setToken('');
        setCurrentUser(null);
        setHistory([]);
    };

    // =====================================
    // BƯỚC 1: XỬ LÝ NÚT BẤM ĐẶT SÂN -> SINH MÃ QR
    // =====================================
    const handleInitBooking = (e: FormEvent) => {
        e.preventDefault();
        if (!currentUser) return alert('Vui lòng đăng nhập!');
        if (!selectedCourt) return alert('Vui lòng chọn sân!');
        
        // 1. Tính toán số tiền và nội dung
        const amount = selectedCourt.pricePerHour;
        const addInfo = `Thanh toan san ${selectedCourt.id} KH ${currentUser.id}`; // Không dấu để tránh lỗi font ngân hàng
        
        // 2. Tạo link VietQR (Sử dụng MB Bank, stk ảo để demo)
        const bankId = 'MB'; // Mã ngân hàng (Ví dụ: MB, VCB, TCB...)
        const accountNo = '0987654321'; // Số tài khoản admin
        const accountName = 'PICKLEBALL CLUB'; // Tên chủ tài khoản
        
        const url = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accountName)}`;
        
        // 3. Hiển thị QR và lưu tạm dữ liệu chờ thanh toán
        setQrUrl(url);
        setBookingPayload({
            userId: currentUser.id,
            courtId: selectedCourt.id,
            bookDate,
            timeSlot
        });
        setShowQR(true);
    };

    // =====================================
    // BƯỚC 2: KHÁCH XÁC NHẬN ĐÃ CHUYỂN KHOẢN -> GỌI API LƯU DB
    // =====================================
    const handleConfirmPayment = async () => {
        setShowQR(false); // Đóng pop-up QR
        
        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingPayload)
        });
        
        const data = await res.json();
        if (res.ok) {
            alert('🎉 Thanh toán thành công! Chúng tôi đã gửi biên lai về Email của bạn.');
            setSelectedCourt(null); setBookDate(''); setTimeSlot(''); setBookingPayload(null);
            fetchHistory(); // Load lại lịch sử
        } else {
            alert(data.error);
        }
    };

    return (
        <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', backgroundColor: '#27ae60', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h2 style={{ margin: 0 }}>🎾 Pickleball Club</h2>
                <div>
                    {currentUser ? (
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <span>Xin chào, <strong>{currentUser.name}</strong></span>
                            <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: 'transparent', border: '1px solid white', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>Đăng xuất</button>
                        </div>
                    ) : (
                        <Link to="/admin" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>🔑 Dành cho Admin</Link>
                    )}
                </div>
            </nav>

            <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
                
                {!currentUser ? (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
                        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '400px' }}>
                            <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '10px' }}>
                                {authMode === 'login' ? 'Đăng nhập Khách hàng' : 'Đăng ký Tài khoản'}
                            </h2>
                            <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '30px' }}>Trải nghiệm đặt sân Pickleball siêu tốc</p>
                            
                            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {authMode === 'register' && (
                                    <>
                                        <input type="text" placeholder="Họ và Tên" required value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
                                        <input type="text" placeholder="Số điện thoại" required value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
                                    </>
                                )}
                                <input type="email" placeholder="Email của bạn" required value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
                                <input type="password" placeholder="Mật khẩu" required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
                                
                                <button type="submit" style={{ padding: '15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                                    {authMode === 'login' ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN'}
                                </button>
                            </form>
                            
                            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
                                {authMode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                                <span style={{ color: '#2980b9', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
                                    {authMode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                                </span>
                            </p>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h2 style={{ color: '#27ae60', borderBottom: '3px solid #27ae60', display: 'inline-block', paddingBottom: '5px' }}>📍 Danh sách sân hôm nay</h2>
                        
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '50px', marginTop: '20px' }}>
                            {courts.map(court => (
                                <div key={court.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', minWidth: '250px', borderTop: '4px solid #3498db' }}>
                                    <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{court.name}</h3>
                                    <p style={{ margin: '5px 0', color: '#7f8c8d' }}>📍 {court.location}</p>
                                    <p style={{ margin: '5px 0', color: '#e67e22', fontWeight: 'bold' }}>💰 {court.pricePerHour.toLocaleString('vi-VN')} đ/giờ</p>
                                    <button 
                                        onClick={() => setSelectedCourt(court)}
                                        style={{ width: '100%', padding: '10px', marginTop: '15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        CHỌN SÂN NÀY
                                    </button>
                                </div>
                            ))}
                        </div>

                        {selectedCourt && (
                            <div style={{ backgroundColor: '#fffbe6', padding: '25px', borderRadius: '8px', border: '2px dashed #f1c40f', marginBottom: '50px' }}>
                                <h3 style={{ marginTop: 0, color: '#d35400' }}>Tạo lịch đặt: {selectedCourt.name}</h3>
                                {/* Đổi hàm onSubmit từ handleBookCourt thành handleInitBooking */}
                                <form onSubmit={handleInitBooking} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Ngày chơi:</label>
                                        <input type="date" required value={bookDate} onChange={e => setBookDate(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Khung giờ:</label>
                                        <select required value={timeSlot} onChange={e => setTimeSlot(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                                            <option value="" disabled>-- Chọn giờ --</option>
                                            {TIME_SLOTS.map(slot => {
                                                const isBooked = bookedSlots.includes(slot);
                                                return (
                                                    <option key={slot} value={slot} disabled={isBooked} style={isBooked ? { color: 'red', textDecoration: 'line-through' } : {}}>
                                                        {slot} {isBooked ? '(Đã có người đặt)' : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
                                    <button type="submit" style={{ padding: '10px 25px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', height: '40px' }}>THANH TOÁN & ĐẶT SÂN</button>
                                    <button type="button" onClick={() => setSelectedCourt(null)} style={{ padding: '10px 25px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', height: '40px' }}>HỦY BỎ</button>
                                </form>
                            </div>
                        )}

                        <h2 style={{ color: '#8e44ad', borderBottom: '3px solid #8e44ad', display: 'inline-block', paddingBottom: '5px' }}>🕒 Lịch sử đặt sân của tôi</h2>
                        {history.length === 0 ? (
                            <p style={{ color: '#7f8c8d' }}>Bạn chưa có lịch đặt nào.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#8e44ad', color: 'white', textAlign: 'left' }}>
                                        <th style={{ padding: '15px' }}>Mã vé</th>
                                        <th style={{ padding: '15px' }}>Sân</th>
                                        <th style={{ padding: '15px' }}>Ngày chơi</th>
                                        <th style={{ padding: '15px' }}>Khung giờ</th>
                                        <th style={{ padding: '15px' }}>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map(b => (
                                        <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '15px', fontWeight: 'bold' }}>#{b.id}</td>
                                            <td style={{ padding: '15px' }}>{b.court?.name}</td>
                                            <td style={{ padding: '15px' }}>{b.bookDate}</td>
                                            <td style={{ padding: '15px', color: '#d35400', fontWeight: 'bold' }}>{b.timeSlot}</td>
                                            <td style={{ padding: '15px', color: '#27ae60', fontWeight: 'bold' }}>Đã xác nhận ✔️</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* =====================================
                MODAL (POP-UP) HIỂN THỊ MÃ QR THANH TOÁN
                ===================================== */}
            {showQR && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', textAlign: 'center', width: '350px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginTop: 0, color: '#2980b9' }}>Quét mã để thanh toán</h3>
                        <p style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '20px' }}>Sử dụng App ngân hàng hoặc Momo để quét</p>
                        
                        {/* Ảnh QR Code tự động sinh ra từ VietQR */}
                        <div style={{ border: '2px solid #3498db', padding: '10px', borderRadius: '8px', display: 'inline-block', marginBottom: '20px' }}>
                            <img src={qrUrl} alt="QR Code Thanh Toán" style={{ width: '250px', height: '250px', objectFit: 'contain' }} />
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button onClick={handleConfirmPayment} style={{ padding: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                                ✅ TÔI ĐÃ CHUYỂN KHOẢN
                            </button>
                            <button onClick={() => setShowQR(false)} style={{ padding: '12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
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