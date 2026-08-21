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
import Footer from '../components/client/Footer';

interface Court { id: number; name: string; location: string; pricePerHour: number; imageUrl?: string; }

// 👉 1. THÊM DỮ LIỆU CÁC SLIDE BANNER VÀO ĐÂY
const SLIDERS = [
    {
        id: 1,
        title: "🔥 SIÊU SALE SỰ KIỆN",
        subtitle: "Nhập mã để nhận ưu đãi lên đến 50% cho tất cả các cụm sân Pickle-ball.",
        buttonText: "XEM MÃ NGAY",
        linkTo: "/promos",
        bgImage: "https://plus.unsplash.com/premium_photo-1709048991290-1d36455a2895?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGlja2xlYmFsbHxlbnwwfHwwfHx8MA%3D%3D",
        overlay: "from-red-300/90 to-orange-500/80"
    },
    {
        id: 2,
        title: "✨ GIỜ VÀNG GIÁ SỐC",
        subtitle: "Trải nghiệm sân chuẩn Quốc Tế với giá cực rẻ trong khung giờ vàng mỗi ngày.",
        buttonText: "ĐẶT SÂN NGAY",
        linkTo: "#courts-section",
        bgImage: "https://images.unsplash.com/photo-1659318006095-4d44845f3a1b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGlja2xlYmFsbHxlbnwwfHwwfHx8MA%3D%3D",
        overlay: "from-blue-700/90 to-cyan-500/80"
    },
    {
        id: 3,
        title: "🎾 PICKLEBALL SIÊU TIỆN LỢI",
        subtitle: "Hệ thống sân bãi hiện đại, thảm thi đấu chống trượt chuẩn USAPA.",
        buttonText: "KHÁM PHÁ",
        linkTo: "#courts-section",
        bgImage: "https://images.unsplash.com/photo-1580763850522-504d40a05c50?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHBpY2tlYmFsbHxlbnwwfHwwfHx8MA%3D%3D",
        overlay: "from-emerald-700/90 to-teal-500/80"
    }
];

export default function Home() {
    const navigate = useNavigate();

    // ================= DỮ LIỆU CŨ CỦA EM (GIỮ NGUYÊN 100%) =================
    const [courts, setCourts] = useState<Court[]>([]);
    const [token, setToken] = useState(localStorage.getItem('customer_token') || '');
    const [currentUser, setCurrentUser] = useState<any>(JSON.parse(localStorage.getItem('customer_info') || 'null'));
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', password: '' });

    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [viewCourt, setViewCourt] = useState<Court | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceFilter, setPriceFilter] = useState('all');

    const [bookDate, setBookDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [showQR, setShowQR] = useState(false);
    const [qrUrl, setQrUrl] = useState('');
    const [bookingPayload, setBookingPayload] = useState<any>(null);

    const TIME_SLOTS = ['05:00 - 06:00', '06:00 - 07:00', '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00'];

    // 👉 2. THÊM STATE CHO SLIDER
    const [currentSlide, setCurrentSlide] = useState(0);

    // 👉 3. THÊM EFFECT TỰ ĐỘNG CHẠY SLIDER MỖI 5 GIÂY
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === SLIDERS.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide(prev => (prev === SLIDERS.length - 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrentSlide(prev => (prev === 0 ? SLIDERS.length - 1 : prev - 1));

    // ================= CÁC HÀM XỬ LÝ CŨ CỦA EM (GIỮ NGUYÊN 100%) =================
    useEffect(() => { fetchCourts(); }, [token]);

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
        setIsLoading(true);
        try {
            const res = await fetch('/api/courts');
            if (res.ok) setCourts(await res.json());
        } catch (error) {
            console.error("Lỗi khi tải sân:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 1. SỬA HÀM ĐĂNG NHẬP
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

                // 👉 BÍ QUYẾT Ở ĐÂY: Lưu chung token cho cả Admin
                localStorage.setItem('token', data.token);

                setToken(data.token); setCurrentUser(data.user);

                // 👉 Nếu tài khoản có quyền ADMIN thì báo thành công và đẩy vào luôn trang Quản trị
                if (data.user.role === 'ADMIN') {
                    toast.success('Đăng nhập Quản trị viên thành công!');
                    navigate('/admin');
                } else {
                    toast.success('Đăng nhập thành công!');
                }
            }
            setAuthForm({ name: '', email: '', phone: '', password: '' });
        } else toast.error(data.error);
    };

    // 2. SỬA HÀM ĐĂNG XUẤT (Để xóa sạch thẻ của cả 2 bên)
    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_info');
        localStorage.removeItem('token'); // 👉 Xóa luôn thẻ Admin
        setToken('');
        setCurrentUser(null);
        toast.success('Đã đăng xuất!');
    };

    const handleInitBooking = (e: FormEvent, finalPrice: number) => {
        e.preventDefault();
        if (!currentUser || !selectedCourt) return;

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
            navigate('/my-courts');
        } else {
            const data = await res.json();
            toast.error(data.error);
        }
    };

    const filteredCourts = courts.filter(court => {
        const matchSearch = court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            court.location.toLowerCase().includes(searchTerm.toLowerCase());

        let matchPrice = true;
        if (priceFilter === 'under100') matchPrice = court.pricePerHour < 100000;
        if (priceFilter === 'vip') matchPrice = court.pricePerHour >= 100000;

        return matchSearch && matchPrice;
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
            <main className="flex-1">
                <Navbar currentUser={currentUser} onLogout={handleLogout} />

                {/* 👉 4. TÍCH HỢP GIAO DIỆN SLIDER VÀO ĐÂY (Thay cho cái section cũ) */}
                <div className="relative w-full h-75 md:h-112.5 overflow-hidden group bg-slate-900">
                    {SLIDERS.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        >
                            <img src={slide.bgImage} alt={slide.title} className="w-full h-full object-cover" />
                            <div className={`absolute inset-0 bg-linear-to-r ${slide.overlay} mix-blend-multiply`}></div>
                            <div className="absolute inset-0 bg-black/30"></div>

                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                                <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight translate-y-0 animate-fade-in-up">{slide.title}</h1>
                                <p className="text-sm md:text-lg text-slate-100 mb-8 max-w-2xl font-medium drop-shadow-md">{slide.subtitle}</p>
                                <button
                                    onClick={() => {
                                        if (slide.linkTo.startsWith('#')) {
                                            document.getElementById(slide.linkTo.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                                        } else {
                                            navigate(slide.linkTo);
                                        }
                                    }}
                                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-100 hover:scale-105 transition-all shadow-xl uppercase text-sm tracking-wider cursor-pointer"
                                >
                                    {slide.buttonText}
                                </button>
                            </div>
                        </div>
                    ))}

                    <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg cursor-pointer">❮</button>
                    <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg cursor-pointer">❯</button>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {SLIDERS.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'}`}
                            ></button>
                        ))}
                    </div>
                </div>

                {/* 👉 Đã thêm id="courts-section" để nút trên Slider cuộn xuống đúng chỗ này */}
                <div id="courts-section" className="max-w-6xl mx-auto px-4 mt-10">
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

                            <CourtFilter
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                priceFilter={priceFilter}
                                setPriceFilter={setPriceFilter}
                            />

                            {isLoading ? (
                                <LoadingSpinner />
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
            </main>
            <Footer />
        </div>
    );
}