import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';

interface AuthCardProps {
    authMode: 'login' | 'register';
    setAuthMode: (mode: 'login' | 'register') => void;
    authForm: any;
    setAuthForm: (form: any) => void;
    onSubmit: (e: FormEvent) => void;
}

export default function AuthCard({ authMode, setAuthMode, authForm, setAuthForm, onSubmit }: AuthCardProps) {
    // 👉 1. STATE ẨN/HIỆN MẬT KHẨU
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 👉 2. STATE LƯU MẬT KHẨU XÁC NHẬN (Chỉ dùng nội bộ ở giao diện)
    const [confirmPassword, setConfirmPassword] = useState('');

    // 👉 3. HÀM ĐÁNH CHẶN TRƯỚC KHI GỬI
    const handleLocalSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Trạm kiểm soát: Nếu đang đăng ký mà 2 mật khẩu không khớp thì báo lỗi ngay
        if (authMode === 'register' && authForm.password !== confirmPassword) {
            toast.error('❌ Mật khẩu xác nhận không khớp!');
            return;
        }

        // Nếu khớp thì mới cho phép chạy tiếp hàm onSubmit gốc
        onSubmit(e);
    };

    return (
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-md mx-auto border border-slate-100">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4 shadow-inner">
                    <span className="text-3xl">🎾</span>
                </div>
                <h2 className="text-2xl font-black text-slate-800">
                    {authMode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
                </h2>
                <p className="text-slate-500 text-sm mt-2 font-medium">
                    {authMode === 'login' ? 'Đăng nhập để tiếp tục đặt sân' : 'Tham gia cộng đồng Pickleball ngay hôm nay'}
                </p>
            </div>

            <form onSubmit={handleLocalSubmit} className="space-y-4">
                {authMode === 'register' && (
                    <div className="animate-fade-in-up">
                        <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">Họ và tên</label>
                        <input
                            type="text"
                            placeholder="Nhập họ tên của bạn"
                            value={authForm.name}
                            onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            required
                        />
                    </div>
                )}

                <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">Email</label>
                    <input
                        type="email"
                        placeholder="ví dụ: abc@gmail.com"
                        value={authForm.email}
                        onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        required
                    />
                </div>

                {authMode === 'register' && (
                    <div className="animate-fade-in-up">
                        <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">Số điện thoại</label>
                        <input
                            type="tel"
                            placeholder="Nhập số điện thoại"
                            value={authForm.phone}
                            onChange={e => setAuthForm({ ...authForm, phone: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            required
                        />
                    </div>
                )}

                <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">Mật khẩu</label>
                    <div className="relative">
                        <input
                            // 👉 Nếu showPassword là true thì đổi thành text để hiện chữ, ngược lại thì che đi
                            type={showPassword ? "text" : "password"}
                            placeholder="Nhập mật khẩu"
                            value={authForm.password}
                            onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            required
                        />
                        {/* Nút bấm con mắt */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1 cursor-pointer"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* 👉 4. Ô XÁC NHẬN MẬT KHẨU (Chỉ hiện khi Đăng ký) */}
                {authMode === 'register' && (
                    <div className="animate-fade-in-up">
                        <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">Xác nhận mật khẩu</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Nhập lại mật khẩu"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1 cursor-pointer"
                            >
                                {showConfirmPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full py-4 mt-2 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 cursor-pointer"
                >
                    {authMode === 'login' ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN'}
                </button>
            </form>

            <div className="mt-8 text-center">
                <button
                    onClick={() => {
                        setAuthMode(authMode === 'login' ? 'register' : 'login');
                        // 👉 Xóa trắng ô xác nhận mật khẩu khi chuyển qua lại giữa Login/Register
                        setConfirmPassword('');
                    }}
                    className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                >
                    {authMode === 'login' ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
                </button>
            </div>
        </div>
    );
}