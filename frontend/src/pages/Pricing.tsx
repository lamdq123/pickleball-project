import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/client/Navbar';
import Footer from '../components/client/Footer';

export default function Pricing() {
    const navigate = useNavigate();
    // Khởi tạo state user để truyền vào Navbar
    const [currentUser, setCurrentUser] = useState<any>(JSON.parse(localStorage.getItem('customer_info') || 'null'));

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_info');
        setCurrentUser(null);
        toast.success('Đã đăng xuất!');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
            <Navbar currentUser={currentUser} onLogout={handleLogout} />

            <main className="flex-1">
                {/* Banner */}
                <section className="bg-slate-900 text-white py-20 px-6 text-center shadow-inner">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Bảng Giá Thuê Sân</h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
                        Minh bạch, rõ ràng và phù hợp với mọi nhu cầu tập luyện của bạn.
                        Trải nghiệm mặt sân chuẩn quốc tế ngay hôm nay!
                    </p>
                </section>

                {/* Các gói giá */}
                <section className="max-w-7xl mx-auto px-6 py-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Gói 1: Giờ Hành Chính */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow relative flex flex-col">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Giờ Hành Chính</h3>
                            <p className="text-slate-500 text-sm mb-6">Thứ 2 - Thứ 6 (05:00 - 17:00)</p>
                            <div className="mb-6">
                                <span className="text-4xl font-extrabold text-slate-900">80.000đ</span>
                                <span className="text-slate-500 font-medium"> / giờ</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-slate-700"><span className="text-emerald-500">✔</span> Cung cấp bóng miễn phí</li>
                                <li className="flex items-center gap-3 text-slate-700"><span className="text-emerald-500">✔</span> Trà đá, nước lọc miễn phí</li>
                                <li className="flex items-center gap-3 text-slate-700"><span className="text-emerald-500">✔</span> Phù hợp tập luyện nhẹ nhàng</li>
                            </ul>
                            <Link to="/" className="w-full block text-center bg-blue-50 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-600 hover:text-white transition-colors">
                                ĐẶT SÂN NGAY
                            </Link>
                        </div>

                        {/* Gói 2: Giờ Vàng (Highlight) */}
                        <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl transform md:-translate-y-4 relative flex flex-col">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-linear-to-r from-emerald-400 to-blue-500 text-white font-bold py-1 px-4 rounded-full text-sm shadow-lg">
                                ĐƯỢC CHỌN NHIỀU NHẤT
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Giờ Vàng (Peak Hours)</h3>
                            <p className="text-slate-400 text-sm mb-6">Thứ 2 - Thứ 6 (17:00 - 22:00)</p>
                            <div className="mb-6">
                                <span className="text-4xl font-extrabold text-white">120.000đ</span>
                                <span className="text-slate-400 font-medium"> / giờ</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-slate-200"><span className="text-emerald-400">✔</span> Bật 100% hệ thống đèn LED chiếu sáng</li>
                                <li className="flex items-center gap-3 text-slate-200"><span className="text-emerald-400">✔</span> Cung cấp bóng miễn phí</li>
                                <li className="flex items-center gap-3 text-slate-200"><span className="text-emerald-400">✔</span> Khung giờ nhộn nhịp, lý tưởng giao lưu</li>
                            </ul>
                            <Link to="/" className="w-full block text-center bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30">
                                ĐẶT SÂN NGAY
                            </Link>
                        </div>

                        {/* Gói 3: Cuối Tuần */}
                        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow relative flex flex-col">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Cuối Tuần & Ngày Lễ</h3>
                            <p className="text-slate-500 text-sm mb-6">Thứ 7, CN & Các ngày Lễ</p>
                            <div className="mb-6">
                                <span className="text-4xl font-extrabold text-slate-900">100.000đ</span>
                                <span className="text-slate-500 font-medium"> / giờ</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-slate-700"><span className="text-emerald-500">✔</span> Mở cửa full ngày (05:00 - 22:00)</li>
                                <li className="flex items-center gap-3 text-slate-700"><span className="text-emerald-500">✔</span> Hỗ trợ tổ chức giải đấu Mini</li>
                                <li className="flex items-center gap-3 text-slate-700"><span className="text-emerald-500">✔</span> Chỗ đỗ xe ô tô rộng rãi</li>
                            </ul>
                            <Link to="/" className="w-full block text-center bg-blue-50 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-600 hover:text-white transition-colors">
                                ĐẶT SÂN NGAY
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Dịch vụ phụ trợ */}
                <section className="bg-slate-100 py-16 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-2xl font-bold text-slate-800 mb-8">Dịch Vụ Phụ Trợ</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-2xl border border-slate-200">
                                <span className="text-3xl block mb-2">🏓</span>
                                <p className="font-bold text-slate-700">Thuê vợt</p>
                                <p className="text-sm text-slate-500">30.000đ/buổi</p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-200">
                                <span className="text-3xl block mb-2">👟</span>
                                <p className="font-bold text-slate-700">Thuê giày</p>
                                <p className="text-sm text-slate-500">50.000đ/buổi</p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-200">
                                <span className="text-3xl block mb-2">🥤</span>
                                <p className="font-bold text-slate-700">Nước giải khát</p>
                                <p className="text-sm text-slate-500">Từ 10.000đ</p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-200">
                                <span className="text-3xl block mb-2">👨‍🏫</span>
                                <p className="font-bold text-slate-700">Huấn luyện viên</p>
                                <p className="text-sm text-slate-500">Liên hệ riêng</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}