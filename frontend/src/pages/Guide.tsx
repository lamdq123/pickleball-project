import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/client/Navbar';
import Footer from '../components/client/Footer';

export default function Guide() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<any>(JSON.parse(localStorage.getItem('customer_info') || 'null'));

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_info');
        localStorage.removeItem('token');
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
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Hướng Dẫn Đặt Sân</h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
                        Chỉ với 3 bước đơn giản, bạn đã có ngay một không gian tập luyện đạt chuẩn quốc tế cho mình và đồng đội.
                    </p>
                </section>

                {/* Các bước đặt sân */}
                <section className="max-w-4xl mx-auto px-6 py-16">
                    <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">Quy Trình Đặt Sân</h2>
                    <div className="space-y-8">
                        {/* Bước 1 */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 shadow-inner">1</div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Đăng nhập hoặc Tạo tài khoản</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Truy cập vào trang chủ, nhấn nút <strong className="text-slate-800">Đăng nhập</strong> trên góc phải màn hình. Nếu chưa có tài khoản, bạn có thể tạo mới chỉ trong 10 giây bằng Email và Số điện thoại của mình.
                                </p>
                            </div>
                        </div>

                        {/* Bước 2 */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 shadow-inner">2</div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Chọn sân và Khung giờ</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Tại Trang chủ, duyệt qua danh sách các sân đang có sẵn. Nhấn <strong className="text-blue-600">"Đặt Sân Này"</strong>, sau đó chọn <strong>Ngày chơi</strong> và <strong>Khung giờ</strong> phù hợp. Hệ thống sẽ tự động kiểm tra xem giờ đó đã có ai đặt chưa để tránh trùng lặp.
                                </p>
                            </div>
                        </div>

                        {/* Bước 3 */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 shadow-inner">3</div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Thanh toán và Nhận sân</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử để thanh toán. Sau khi hoàn tất, hệ thống sẽ lưu thông tin của bạn vào hệ thống. Tới giờ chơi, bạn chỉ cần báo tên và số điện thoại cho quản lý sân.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Câu hỏi thường gặp (FAQ) */}
                <section className="bg-slate-100 py-16 px-6">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">Câu Hỏi Thường Gặp (FAQ)</h2>
                        <div className="space-y-4">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-200 transition-colors">
                                <h4 className="font-bold text-lg text-slate-800 mb-2 flex items-center gap-2"><span>❓</span> Tôi có thể hủy sân và được hoàn tiền không?</h4>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Có. Bạn được phép hủy sân và hoàn tiền 100% nếu thông báo trước ít nhất <strong>24 giờ</strong> so với giờ bóng lăn. Việc hủy sân sát giờ sẽ không được hoàn tiền để đảm bảo quyền lợi cho các khách hàng khác.
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-200 transition-colors">
                                <h4 className="font-bold text-lg text-slate-800 mb-2 flex items-center gap-2"><span>❓</span> Hệ thống có cho thuê vợt và bóng không?</h4>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Tất cả các sân đều có sẵn bóng hoàn toàn miễn phí. Vợt Pickleball tiêu chuẩn có thể được thuê tại quầy lễ tân với mức giá 30.000đ/buổi.
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-200 transition-colors">
                                <h4 className="font-bold text-lg text-slate-800 mb-2 flex items-center gap-2"><span>❓</span> Sân mở cửa lúc mấy giờ?</h4>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Hệ thống Pickleball Club mở cửa từ 05:00 sáng đến 22:00 đêm tất cả các ngày trong tuần, kể cả Chủ Nhật và ngày Lễ.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}