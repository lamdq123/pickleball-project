import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800 mt-20">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Cột 1: Thông tin thương hiệu */}
                <div className="md:col-span-2">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-emerald-400">🎾</span> Pickleball Club
                    </h3>
                    <p className="text-sm leading-relaxed max-w-sm mb-6">
                        Hệ thống tra cứu và đặt sân Pickleball chuyên nghiệp, nhanh chóng và tiện lợi nhất. Trải nghiệm thể thao tuyệt vời của bạn bắt đầu từ đây!
                    </p>
                </div>

                {/* Cột 2: Liên kết nhanh */}
                <div>
                    <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Liên kết</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/" className="hover:text-emerald-400 transition-colors">Trang chủ</Link></li>
                        <li><a href="#" className="hover:text-emerald-400 transition-colors">Bảng giá</a></li>
                        <li><a href="#" className="hover:text-emerald-400 transition-colors">Hướng dẫn đặt sân</a></li>
                        <li><a href="#" className="hover:text-emerald-400 transition-colors">Điều khoản dịch vụ</a></li>
                    </ul>
                </div>

                {/* Cột 3: Liên hệ */}
                <div>
                    <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Liên hệ</h4>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2">
                            <span>📍</span>
                            <span>Hà Nội, Việt Nam</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span>📞</span>
                            <span>0352.614.404</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span>✉️</span>
                            <span>contact@pickleballclub.vn</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Dòng bản quyền dưới cùng */}
            <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center">
                <p>&copy; 2026 Pickleball Club. All rights reserved.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <a href="#" className="hover:text-white transition-colors font-medium">Facebook</a>
                    <a href="#" className="hover:text-white transition-colors font-medium">Instagram</a>
                    <a href="#" className="hover:text-white transition-colors font-medium">Tiktok</a>
                </div>
            </div>
        </footer>
    );
}