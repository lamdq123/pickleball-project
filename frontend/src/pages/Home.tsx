import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
// Nhập các mảnh ghép Component
import Navbar from '../components/client/Navbar';
import AuthCard from '../components/client/AuthCard';
import CourtModal from '../components/client/CourtModal';
import QRModal from '../components/client/QRModal';
import CourtFilter from '../components/client/CourtFilter';
import CourtCard from '../components/client/CourtCard';
import BookingModal from '../components/client/BookingModal';
interface Court { id: number; name: string; location: string; pricePerHour: number; imageUrl?: string; }

export default function Home() {
    const navigate = useNavigate();
    const [courts, setCourts] = useState<Court[]>([]);
    const [token, setToken] = useState(localStorage.getItem('customer_token') || '');
    const [currentUser, setCurrentUser] = useState<any>(JSON.parse(localStorage.getItem('customer_info') || 'null'));
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', password: '' });

    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [viewCourt, setViewCourt] = useState<Court | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    // 👉 1. STATE CHO TÌM KIẾM VÀ LỌC (DANH MỤC)
    const [searchTerm, setSearchTerm] = useState('');
    const [priceFilter, setPriceFilter] = useState('all');

    const [bookDate, setBookDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [showQR, setShowQR] = useState(false);
    const [qrUrl, setQrUrl] = useState('');
    const [bookingPayload, setBookingPayload] = useState<any>(null);

    const TIME_SLOTS = ['05:00 - 06:00', '06:00 - 07:00', '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00'];

    useEffect(() => {
        fetchCourts();
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
        setIsLoading(true); // 👉 Bật vòng xoay Loading lên
        try {
            const res = await fetch('/api/courts');
            if (res.ok) setCourts(await res.json());
        } catch (error) {
            console.error("Lỗi khi tải sân:", error);
        } finally {
            setIsLoading(false); // 👉 Tải xong (hoặc lỗi) thì tắt vòng xoay đi
        }
    };

    const handleAuth = async (e: FormEvent) => {
        e.preventDefault();
        const res = await fetch(`/api/customer?action=${authMode}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authForm)
        });
        const data = await res.json();

        if (res.ok) {
            if (authMode === 'register') {
                toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
                setAuthMode('login');
            } else {
                localStorage.setItem('customer_token', data.token);
                localStorage.setItem('customer_info', JSON.stringify(data.user));
                setToken(data.token); setCurrentUser(data.user);
                toast.success('Đăng nhập thành công!');
            }
            setAuthForm({ name: '', email: '', phone: '', password: '' });
        } else toast.error(data.error);
    };

    const handleLogout = () => {
        localStorage.removeItem('customer_token'); localStorage.removeItem('customer_info');
        setToken(''); setCurrentUser(null);
        toast.success('Đã đăng xuất!');
    };

    const handleInitBooking = (e: FormEvent, finalPrice: number) => {
        e.preventDefault();
        if (!currentUser || !selectedCourt) return;

        // 👉 Dùng finalPrice (giá đã giảm) thay vì giá gốc để tạo mã QR
        const addInfo = `Thanh toan san ${selectedCourt.id} KH ${currentUser.id}`;
        const url = `https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${finalPrice}&addInfo=${encodeURIComponent(addInfo)}&accountName=PICKLEBALL%20CLUB`;

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
            toast.success('🎉 Thanh toán thành công!');
            setSelectedCourt(null); setBookDate(''); setTimeSlot(''); setBookingPayload(null);
            navigate('/profile');
        } else {
            const data = await res.json();
            toast.error(data.error);
        }
    };

    // 👉 2. LOGIC BỘ LỌC VÀ TÌM KIẾM SÂN (REAL-TIME)
    const filteredCourts = courts.filter(court => {
        const matchSearch = court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            court.location.toLowerCase().includes(searchTerm.toLowerCase());

        let matchPrice = true;
        if (priceFilter === 'under100') matchPrice = court.pricePerHour < 100000;
        if (priceFilter === 'vip') matchPrice = court.pricePerHour >= 100000;

        return matchSearch && matchPrice;
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
            <Navbar currentUser={currentUser} onLogout={handleLogout} />

            {!currentUser && (
                <section className="bg-linear-to-br from-slate-800 to-blue-900 text-white py-20 px-6 text-center shadow-inner">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Trải nghiệm đặt sân Pickleball siêu tốc</h1>
                    <p className="text-lg md:text-xl text-blue-200 mb-8 max-w-2xl mx-auto">Hệ thống thông minh giúp bạn tra cứu giờ trống, đặt sân và thanh toán tự động chỉ trong vài giây.</p>
                </section>
            )}

            <div className="max-w-6xl mx-auto px-4 mt-10">
                {!currentUser ? (
                    <AuthCard
                        authMode={authMode}
                        authForm={authForm}
                        setAuthMode={setAuthMode}
                        setAuthForm={setAuthForm}
                        onSubmit={handleAuth}
                    />
                ) : (
                    <div className="animate-fade-in-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-blue-600 pl-3">Danh sách sân</h2>
                        </div>

                        {/* 👉 3. GIAO DIỆN THANH TÌM KIẾM & LỌC (DANH MỤC) */}
                        <CourtFilter
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            priceFilter={priceFilter}
                            setPriceFilter={setPriceFilter}
                        />

                        {/* Hiển thị danh sách sân sau khi lọc */}
                        {isLoading ? (
                            <LoadingSpinner /> // 👉 Nếu đang tải thì hiện vòng xoay
                        ) : filteredCourts.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                                <span className="text-4xl block mb-3">🔍</span>
                                <h3 className="text-lg font-bold text-slate-700">Không tìm thấy sân nào</h3>
                                <p className="text-slate-500">Thử đổi từ khóa tìm kiếm hoặc bỏ bộ lọc giá nhé!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                {filteredCourts.map(court => (
                                    <CourtCard
                                        key={court.id}
                                        court={court}
                                        setViewCourt={setViewCourt}
                                        setSelectedCourt={setSelectedCourt}
                                    />
                                ))}
                            </div>
                        )}
                        {/* MODAL ĐẶT SÂN */}
                        {selectedCourt && (
                            <BookingModal
                                selectedCourt={selectedCourt}
                                bookDate={bookDate}
                                setBookDate={setBookDate}
                                timeSlot={timeSlot}
                                setTimeSlot={setTimeSlot}
                                bookedSlots={bookedSlots}
                                TIME_SLOTS={TIME_SLOTS}
                                onClose={() => setSelectedCourt(null)}
                                onSubmit={handleInitBooking}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* MODAL CHI TIẾT SÂN */}
            {viewCourt && (
                <CourtModal
                    viewCourt={viewCourt}
                    setViewCourt={setViewCourt}
                    setSelectedCourt={setSelectedCourt}
                    currentUser={currentUser}
                    refreshCourts={fetchCourts}
                />
            )}

            {/* MODAL QR THANH TOÁN */}
            {showQR && (
                <QRModal
                    qrUrl={qrUrl}
                    onConfirm={handleConfirmPayment}
                    onCancel={() => setShowQR(false)}
                />
            )}
        </div>
    );
}