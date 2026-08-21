import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/client/Navbar';
import Footer from '../components/client/Footer';
import AuthCard from '../components/client/AuthCard';

export default function Login() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [searchParams] = useSearchParams();
    const [authMode, setAuthMode] = useState<'login' | 'register'>(
        pathname === '/register' || searchParams.get('mode') === 'register' ? 'register' : 'login'
    );
    const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', password: '' });

    useEffect(() => {
        setAuthMode(pathname === '/register' || searchParams.get('mode') === 'register' ? 'register' : 'login');
    }, [pathname, searchParams]);

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
                // Lưu token chung cho cả Khách và Admin
                localStorage.setItem('customer_token', data.token);
                localStorage.setItem('customer_info', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);

                if (data.user.role === 'ADMIN') {
                    toast.success('Đăng nhập Quản trị viên thành công!');
                    navigate('/admin');
                } else {
                    toast.success('Đăng nhập thành công!');
                    navigate('/home'); // Chuyển hướng về trang chủ
                }
            }
            setAuthForm({ name: '', email: '', phone: '', password: '' });
        } else {
            toast.error(data.error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
            {/* Thanh menu ẩn nút Đăng xuất vì đang ở trang Login */}
            <Navbar currentUser={null} onLogout={() => { }} />

            <main className="flex-1 flex items-center justify-center p-6 animate-fade-in-up">
                <div className="w-full max-w-5xl mx-auto">
                    <AuthCard
                        authMode={authMode}
                        authForm={authForm}
                        setAuthMode={setAuthMode}
                        setAuthForm={setAuthForm}
                        onSubmit={handleAuth}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}