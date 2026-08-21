import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/client/Navbar';
import Footer from '../components/client/Footer';

export default function Profile() {
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

    if (!currentUser) {
        navigate('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
            <Navbar currentUser={currentUser} onLogout={handleLogout} />

            <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full animate-fade-in-up">
                <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
                    <span className="text-3xl">👤</span>
                    <h2 className="text-2xl font-bold text-slate-800">Hồ sơ cá nhân</h2>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                    {/* Băng rôn màu sắc trên đầu */}
                    <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-r from-blue-600 to-emerald-400"></div>

                    <div className="relative z-10 flex flex-col items-center mt-6">
                        <div className="w-24 h-24 bg-white p-1.5 rounded-full shadow-lg mb-4">
                            <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-4xl font-bold text-emerald-400">
                                {currentUser.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{currentUser.name}</h3>
                        <p className="text-slate-500 font-medium mt-1">
                            {currentUser.role === 'ADMIN' ? 'Quản trị viên hệ thống' : 'Khách hàng thành viên'}
                        </p>
                    </div>

                    <div className="mt-10 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Họ và tên</label>
                                <p className="text-lg font-bold text-slate-700">{currentUser.name}</p>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Email</label>
                                <p className="text-lg font-bold text-slate-700">{currentUser.email}</p>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Số điện thoại</label>
                                <p className="text-lg font-bold text-slate-700">{currentUser.phone}</p>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Phân quyền</label>
                                <p className="text-lg font-bold text-slate-700 capitalize">Tài khoản {currentUser.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}