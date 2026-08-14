import { useState } from 'react';
import { Link } from 'react-router-dom';

// Định nghĩa các dữ liệu mà Navbar cần nhận từ Home truyền vào
interface NavbarProps {
    currentUser: any;
    onLogout: () => void;
}

export default function Navbar({ currentUser, onLogout }: NavbarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-30">
            <div className="flex justify-between items-center px-6 md:px-10 py-4">
                <Link to="/" className="text-2xl font-bold tracking-tight flex items-center gap-2 hover:text-emerald-400 transition-colors">
                    <span className="text-emerald-400">🎾</span> Pickleball Club
                </Link>

                {/* Nút Mobile */}
                <div className="md:hidden">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 hover:text-white focus:outline-none transition-colors">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />}
                        </svg>
                    </button>
                </div>

                {/* Menu Desktop */}
                <div className="hidden md:flex items-center gap-4">
                    {currentUser ? (
                        <>
                            {/* 👉 CHỈ HIỆN NÚT NÀY NẾU ROLE LÀ ADMIN */}
                            {currentUser.role === 'admin' && (
                                <Link to="/admin" className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors border-r border-slate-600 pr-4">
                                    ⚙️ Trang Quản Trị
                                </Link>
                            )}

                            <Link to="/profile" className="text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer">
                                Xin chào, <strong className="font-semibold text-white">{currentUser.name}</strong>
                            </Link>
                            <button onClick={onLogout} className="px-4 py-2 text-sm font-medium border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors">Đăng xuất</button>
                        </>
                    ) : (
                        // Nút Đăng nhập/Đăng ký dành cho khách chưa login
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            🔑 Đăng nhập
                        </button>
                    )}
                </div>
            </div>

            {/* Menu Mobile thả xuống */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-slate-800 border-t border-slate-700 px-6 py-4 flex flex-col gap-4 animate-fade-in">
                    {currentUser ? (
                        <>
                            <Link to="/profile" className="text-slate-300 hover:text-emerald-400 transition-colors text-lg">👤 Hồ sơ: <strong className="text-white">{currentUser.name}</strong></Link>
                            <button onClick={onLogout} className="w-full text-left text-red-400 font-medium py-2 hover:text-red-300 text-lg">Đăng xuất</button>
                        </>
                    ) : (
                        <Link to="/admin" className="text-slate-300 hover:text-white font-medium py-2 text-lg">🔑 Dành cho Admin</Link>
                    )}
                </div>
            )}
        </nav>
    );
}