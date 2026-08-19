import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/client/Navbar';
import Footer from '../components/client/Footer';
import CourtCard from '../components/client/CourtCard';
import LoadingSpinner from '../components/LoadingSpinner';

// 💡 DỮ LIỆU CÁC SLIDE BANNER (Em có thể thay link ảnh tùy thích)
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
        title: "🎾 PICKLEBALL ĐỈNH CAO",
        subtitle: "Hệ thống sân bãi hiện đại, thảm thi đấu chống trượt chuẩn USAPA.",
        buttonText: "KHÁM PHÁ",
        linkTo: "#courts-section",
        bgImage: "https://images.unsplash.com/photo-1580763850522-504d40a05c50?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHBpY2tsZWJhbGx8ZW58MHx8MHx8fDA%3D",
        overlay: "from-emerald-700/90 to-teal-500/80"
    }
];

export default function Home() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<any>(JSON.parse(localStorage.getItem('customer_info') || 'null'));
    const [courts, setCourts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // State cho Slider
    const [currentSlide, setCurrentSlide] = useState(0);

    // 💡 LOGIC: Tự động chuyển Slide mỗi 5 giây
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === SLIDERS.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer); // Dọn dẹp bộ nhớ khi chuyển trang
    }, []);

    const nextSlide = () => setCurrentSlide(prev => (prev === SLIDERS.length - 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrentSlide(prev => (prev === 0 ? SLIDERS.length - 1 : prev - 1));

    // Lấy dữ liệu sân (giữ nguyên logic cũ của em)
    useEffect(() => {
        const fetchCourts = async () => {
            try {
                const res = await fetch('/api/courts');
                if (res.ok) setCourts(await res.json());
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourts();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_info');
        setCurrentUser(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
            <Navbar currentUser={currentUser} onLogout={handleLogout} />

            <main className="flex-1 w-full animate-fade-in">

                {/* 🌟 KHU VỰC BANNER SLIDER */}
                <div className="relative w-full h-75 md:h-112.5 overflow-hidden group bg-slate-900">
                    {SLIDERS.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        >
                            {/* Ảnh nền */}
                            <img src={slide.bgImage} alt={slide.title} className="w-full h-full object-cover" />
                            {/* Lớp phủ màu Gradient để chữ nổi bật */}
                            <div className={`absolute inset-0 bg-linear-to-r ${slide.overlay} mix-blend-multiply`}></div>
                            <div className="absolute inset-0 bg-black/30"></div>

                            {/* Nội dung chữ trên Banner */}
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
                                    className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-100 hover:scale-105 transition-all shadow-xl uppercase text-sm tracking-wider"
                                >
                                    {slide.buttonText}
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Nút Prev / Next (Chỉ hiện khi di chuột vào Banner) */}
                    <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        ❮
                    </button>
                    <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        ❯
                    </button>

                    {/* Dấu chấm điều hướng (Dots) */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {SLIDERS.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'}`}
                            ></button>
                        ))}
                    </div>
                </div>

                {/* 🌟 KHU VỰC DANH SÁCH SÂN */}
                <div id="courts-section" className="max-w-7xl mx-auto px-6 py-16">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Hệ Thống Sân Bãi</h2>
                            <p className="text-slate-500 mt-2 font-medium">Lựa chọn sân đấu phù hợp với phong cách của bạn</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="py-20 flex justify-center"><LoadingSpinner /></div>
                    ) : courts.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <span className="text-5xl block mb-4">🏟️</span>
                            <p className="text-slate-500 font-medium text-lg">Hệ thống đang cập nhật sân bãi. Vui lòng quay lại sau!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courts.map(court => (
                                <CourtCard
                                    key={court.id}
                                    court={court}
                                    // Chú ý: Truyền các hàm mở Modal của em vào đây như cũ nhé
                                    setViewCourt={() => { /* Xử lý mở modal chi tiết */ }}
                                    setSelectedCourt={() => { /* Xử lý mở modal đặt sân */ }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}