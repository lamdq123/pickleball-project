import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';

interface User { id: number; name: string; email: string; phone: string; }

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [userFormData, setUserFormData] = useState({ name: '', email: '', phone: '', password: '' });
    const [isLoading, setIsLoading] = useState(true);

    const getHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('customer_token')}`,
        'Content-Type': 'application/json'
    });

    const fetchUsers = async () => {
        const res = await fetch('/api/users', { headers: getHeaders() });
        if (res.ok) setUsers(await res.json());
    };

    useEffect(() => {
        const loadUsers = async () => {
            setIsLoading(true);
            try {
                await fetchUsers();
            } finally {
                setIsLoading(false);
            }
        };

        loadUsers();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-75 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    const handleRegisterUser = async (e: FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/users', {
            method: 'POST', headers: getHeaders(), body: JSON.stringify(userFormData)
        });
        if (res.ok) {
            toast.success("Đã thêm thành viên!");
            setUserFormData({ name: '', email: '', phone: '', password: '' });
            fetchUsers();
        } else toast.error((await res.json()).error);
    };

    const handleDeleteUser = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa thành viên này không?")) return;
        const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE', headers: getHeaders() });
        if (res.ok) { toast.success("Đã xóa!"); fetchUsers(); } 
        else toast.error((await res.json()).error);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 border-l-4 border-amber-500 pl-3">Đăng ký Thành viên</h3>
                <form onSubmit={handleRegisterUser} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Họ Tên</label>
                        <input type="text" required value={userFormData.name} onChange={e => setUserFormData({ ...userFormData, name: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Email</label>
                        <input type="email" required value={userFormData.email} onChange={e => setUserFormData({ ...userFormData, email: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Số điện thoại</label>
                        <input type="text" required value={userFormData.phone} onChange={e => setUserFormData({ ...userFormData, phone: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Mật khẩu</label>
                        <input type="password" required value={userFormData.password} onChange={e => setUserFormData({ ...userFormData, password: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg outline-none focus:border-blue-500" />
                    </div>
                    <button type="submit" className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md">TẠO TÀI KHOẢN</button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">ID</th>
                                <th className="px-6 py-4 font-semibold">Họ Tên</th>
                                <th className="px-6 py-4 font-semibold">Email</th>
                                <th className="px-6 py-4 font-semibold">SĐT</th>
                                <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-700">#{user.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                                    <td className="px-6 py-4 text-slate-600">{user.phone || 'Chưa cập nhật'}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleDeleteUser(user.id)} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}