import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, LogIn, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('admin_token', data.token);
                navigate('/admin');
            } else {
                const err = await res.json();
                toast.error(err.error);
            }
        } catch {
            toast.error('Lỗi kết nối server!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 font-sans">
            <div className="w-full max-w-md">
                {/* Brand mark */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20 mb-4">
                        <ShieldCheck className="w-7 h-7 text-blue-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pickleball Club</h1>
                    <p className="text-slate-500 text-sm mt-1">Khu vực Quản trị viên</p>
                </div>

                {/* Auth card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200/70 p-8 md:p-10">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-slate-800">Đăng nhập</h2>
                        <p className="text-sm text-slate-500 mt-1">Nhập thông tin đăng nhập để truy cập bảng điều khiển.</p>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="username" className="text-sm font-semibold text-slate-700">Tên đăng nhập</label>
                            <div className="relative">
                                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="admin"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="text-sm font-semibold text-slate-700">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 mt-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                            {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-sm text-slate-500">
                        Bạn là khách hàng?{' '}
                        <button onClick={() => navigate('/')} className="text-blue-600 font-semibold hover:underline">
                            Về trang đặt sân
                        </button>
                    </p>
                </div>

                <p className="text-center text-xs text-slate-400 mt-6">© 2026 Pickleball Club. Bảo mật bởi JWT.</p>
            </div>
        </div>
    );
}

export default Login;
