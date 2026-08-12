import { type FormEvent } from 'react';

interface AuthCardProps {
    authMode: 'login' | 'register';
    authForm: { name: string; email: string; phone: string; password: '' };
    setAuthMode: (mode: 'login' | 'register') => void;
    setAuthForm: (form: any) => void;
    onSubmit: (e: FormEvent) => void;
}

export default function AuthCard({ authMode, authForm, setAuthMode, setAuthForm, onSubmit }: AuthCardProps) {
    return (
        <div className="flex justify-center mt-10">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md mx-auto border border-slate-100 transform transition-all">
                <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">
                    {authMode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
                </h2>
                <p className="text-center text-slate-500 mb-8">Vui lòng điền thông tin của bạn</p>
                
                <form onSubmit={onSubmit} className="flex flex-col gap-5">
                    {authMode === 'register' && (
                        <>
                            <input type="text" placeholder="Họ và Tên" required value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                            <input type="text" placeholder="Số điện thoại" required value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                        </>
                    )}
                    <input type="email" placeholder="Email của bạn" required value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                    <input type="password" placeholder="Mật khẩu" required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                    
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md shadow-blue-500/30 mt-2">
                        {authMode === 'login' ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN'}
                    </button>
                </form>
                
                <p className="text-center mt-6 text-sm text-slate-600">
                    {authMode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                    <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-blue-600 font-bold hover:underline">
                        {authMode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                    </button>
                </p>
            </div>
        </div>
    );
}