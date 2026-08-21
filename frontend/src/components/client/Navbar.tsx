import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
    currentUser: any;
    onLogout: () => void;
    searchTerm?: string;
    setSearchTerm?: (term: string) => void;
}

export default function Navbar({ currentUser, onLogout, searchTerm, setSearchTerm }: NavbarProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 💡 LOGIC: Tự động đóng Dropdown khi click chuột ra ngoài vùng menu
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <nav className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex flex-wrap gap-3 justify-between items-center">
                {/* Logo thương hiệu */}
                <Link to="/" className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    <span className="text-emerald-400 text-3xl">🎾</span> Pickleball Club
                </Link>

                {setSearchTerm && (
                    <div className="order-3 md:order-0 w-full md:flex-1 md:max-w-lg md:mx-6 flex gap-2 relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                        </svg>
                        <input
                            type="search"
                            value={searchTerm || ''}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Tìm tên sân hoặc khu vực..."
                            aria-label="Tìm kiếm sân"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                        />
                    </div>
                )}
                {/* Khu vực Menu người dùng */}
                <div className="flex items-center gap-6">
                    {!currentUser && (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white transition-colors"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-2 text-sm font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
                            >
                                Đăng ký
                            </Link>
                        </div>
                    )}
                    {currentUser && (
                        <div className="relative" ref={dropdownRef}>

                            {/* Nút bấm mở Dropdown (Giao diện Pill Button chuyên nghiệp) */}
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 p-1 pr-3 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer shadow-sm"
                            >
                                {/* Avatar */}
                                <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center font-bold text-emerald-400 shadow-inner">
                                    {currentUser.name.charAt(0).toUpperCase()}
                                </div>

                                {/* Tên người dùng (Tùy chọn: Em có thể xóa dòng này nếu chỉ muốn hiện Avatar + 3 gạch cho gọn giống ảnh) */}
                                <span className="font-medium text-sm hidden md:block text-slate-200 ml-1">{currentUser.name}</span>

                                {/* Icon 3 gạch (Hamburger) */}
                                {/* 👉 Tăng độ dày (strokeWidth=2.5) và viền tròn (strokeLinecap=round) để trông nét và sang hơn */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            {/* Bảng Dropdown xổ xuống */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 animate-fade-in-up">

                                    {/* Khung thông tin sơ lược */}
                                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                                        <p className="text-sm font-bold truncate text-slate-800">{currentUser.name}</p>
                                        <p className="text-xs text-slate-500 truncate mt-0.5">{currentUser.email}</p>
                                    </div>

                                    {/* Danh sách các trang */}
                                    <div className="py-2">
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="w-full px-5 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium flex items-center gap-3"
                                        >
                                            <span className="text-lg">👤</span> Hồ sơ cá nhân
                                        </Link>
                                        <Link
                                            to="/my-courts"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="w-full px-5 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium flex items-center gap-3"
                                        >
                                            <span className="text-lg">🏟️</span> Sân của tôi
                                        </Link>
                                        {/* 👉 Tự động kiểm tra: Chỉ Admin mới nhìn thấy nút này */}
                                        {currentUser?.role === 'ADMIN' && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="w-full px-5 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors font-bold flex items-center gap-3"
                                            >
                                                <span className="text-lg" aria-hidden="true">⚙️</span>
                                                <span>Trang Quản Trị</span>
                                            </Link>
                                        )}
                                        <Link
                                            to="/promos"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="w-full px-5 py-2.5 text-sm hover:bg-emerald-50 hover:text-emerald-600 transition-colors font-medium flex items-center gap-3"
                                        >
                                            <span className="text-lg" aria-hidden="true">🎁</span>
                                            <span>Ưu đãi</span>
                                        </Link>
                                    </div>

                                    {/* Nút Đăng xuất đỏ chót */}
                                    <div className="border-t border-slate-100">
                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                onLogout();
                                            }}
                                            className="w-full text-left px-5 py-3.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold flex items-center gap-3 cursor-pointer"
                                        >
                                            <span className="text-lg">🚪</span> Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}