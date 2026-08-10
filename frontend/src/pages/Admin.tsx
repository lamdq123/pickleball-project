import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
    LayoutDashboard, MapPin, CalendarCheck, Users, LogOut, Plus, Trash2, XCircle,
    DollarSign, TicketCheck, UserPlus, TrendingUp, Loader2,
} from 'lucide-react';

interface User { id: number; name: string; email: string; phone: string | null; }
interface Court { id: number; name: string; location: string; pricePerHour: number; }
interface Booking { id: number; user: User; court: Court; bookDate: string; timeSlot: string; }

type Section = 'overview' | 'courts' | 'bookings' | 'users';

function Admin() {
    const [users, setUsers] = useState<User[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [section, setSection] = useState<Section>('overview');
    const navigate = useNavigate();

    const [userFormData, setUserFormData] = useState({ name: '', email: '', phone: '' });
    const [courtFormData, setCourtFormData] = useState({ name: '', location: '', pricePerHour: '' });

    const token = localStorage.getItem('admin_token');
    const authHeaders = { Authorization: `Bearer ${token}` };

    const safeArray = <T,>(setter: (v: T[]) => void) => (r: Response) =>
        r.ok ? r.json().then((d) => setter(Array.isArray(d) ? d : [])) : setter([]);

    const fetchUsers = () => fetch('/api/users', { headers: authHeaders }).then(safeArray(setUsers)).catch(() => setUsers([]));
    const fetchCourts = () => fetch('/api/courts', { headers: authHeaders }).then(safeArray(setCourts)).catch(() => setCourts([]));
    const fetchBookings = () => fetch('/api/bookings', { headers: authHeaders }).then(safeArray(setBookings)).catch(() => setBookings([]));

    useEffect(() => {
        Promise.all([fetchUsers(), fetchCourts(), fetchBookings()]).finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ===== Data prep for charts =====
    const getRevenueByDate = () => {
        const revenueMap: { [key: string]: number } = {};
        bookings.forEach((b) => {
            const price = b.court?.pricePerHour || 0;
            revenueMap[b.bookDate] = (revenueMap[b.bookDate] || 0) + price;
        });
        return Object.keys(revenueMap).sort().map((date) => ({ date, 'Doanh Thu (đ)': revenueMap[date] }));
    };

    const getRevenueByCourt = () => {
        const courtMap: { [key: string]: number } = {};
        bookings.forEach((b) => {
            const courtName = b.court?.name || 'Sân ẩn';
            courtMap[courtName] = (courtMap[courtName] || 0) + (b.court?.pricePerHour || 0);
        });
        return Object.keys(courtMap).map((name) => ({ name, value: courtMap[name] }));
    };

    const dailyRevenueData = getRevenueByDate();
    const courtRevenueData = getRevenueByCourt();
    const COLORS = ['#2563eb', '#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6'];

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.court?.pricePerHour || 0), 0);

    // ===== CRUD =====
    const handleRegisterUser = async (e: FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/users', {
            method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(userFormData),
        });
        if (res.ok) { setUserFormData({ name: '', email: '', phone: '' }); fetchUsers(); }
    };

    const handleCreateCourt = async (e: FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/courts', {
            method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify({ name: courtFormData.name, location: courtFormData.location, pricePerHour: Number(courtFormData.pricePerHour) }),
        });
        if (res.ok) { setCourtFormData({ name: '', location: '', pricePerHour: '' }); fetchCourts(); }
    };

    const handleDeleteCourt = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sân này không?')) return;
        const res = await fetch(`/api/courts?id=${id}`, { method: 'DELETE', headers: authHeaders });
        if (res.ok) fetchCourts(); else alert((await res.json()).error);
    };

    const handleCancelBooking = async (id: number) => {
        if (!window.confirm('Hủy lịch đặt này?')) return;
        const res = await fetch(`/api/bookings?id=${id}`, { method: 'DELETE', headers: authHeaders });
        if (res.ok) fetchBookings();
    };

    const navItems: { key: Section; label: string; icon: typeof LayoutDashboard }[] = [
        { key: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
        { key: 'courts', label: 'Quản lý sân', icon: MapPin },
        { key: 'bookings', label: 'Lịch đặt', icon: CalendarCheck },
        { key: 'users', label: 'Thành viên', icon: Users },
    ];

    const currency = (n: number) => `${n.toLocaleString('vi-VN')} đ`;

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex">
            {/* ===== SIDEBAR ===== */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 fixed inset-y-0 left-0 z-30">
                <div className="px-6 py-6 border-b border-slate-800">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">🎾</span>
                        Admin Panel
                    </h2>
                </div>
                <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                    {navItems.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setSection(key)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                section === key ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            {label}
                        </button>
                    ))}
                </nav>
                <div className="px-3 py-4 border-t border-slate-800">
                    <button
                        onClick={() => { localStorage.removeItem('admin_token'); navigate('/login'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* ===== MAIN ===== */}
            <div className="flex-1 md:ml-64">
                {/* Topbar (mobile nav + header) */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
                    <div className="px-4 md:px-8 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">{navItems.find((n) => n.key === section)?.label}</h1>
                            <p className="text-sm text-slate-500 hidden sm:block">Bảng điều khiển quản trị hệ thống đặt sân</p>
                        </div>
                        <button
                            onClick={() => { localStorage.removeItem('admin_token'); navigate('/login'); }}
                            className="md:hidden flex items-center gap-2 px-3 py-2 text-sm font-medium bg-slate-100 rounded-lg text-slate-700"
                        >
                            <LogOut className="w-4 h-4" /> Thoát
                        </button>
                    </div>
                    {/* Mobile section tabs */}
                    <div className="md:hidden flex overflow-x-auto gap-1 px-4 pb-3">
                        {navItems.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setSection(key)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                                    section === key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                                }`}
                            >
                                <Icon className="w-4 h-4" /> {label}
                            </button>
                        ))}
                    </div>
                </header>

                <main className="p-4 md:p-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-32 text-slate-500">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Đang tải dữ liệu...
                        </div>
                    ) : (
                        <>
                            {/* ===== OVERVIEW ===== */}
                            {section === 'overview' && (
                                <div className="flex flex-col gap-8">
                                    {/* Stat cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                        <StatCard icon={DollarSign} label="Tổng doanh thu" value={currency(totalRevenue)} accent="bg-blue-600" />
                                        <StatCard icon={TicketCheck} label="Số lượt đặt sân" value={`${bookings.length}`} accent="bg-emerald-500" />
                                        <StatCard icon={UserPlus} label="Khách hàng" value={`${users.length}`} accent="bg-amber-500" />
                                    </div>

                                    {/* Charts */}
                                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                                        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                            <h4 className="font-bold text-slate-800 mb-1">Doanh thu theo ngày</h4>
                                            <p className="text-sm text-slate-500 mb-4">Tăng trưởng doanh thu theo từng ngày đặt sân</p>
                                            <div className="w-full h-72">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={dailyRevenueData}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                                                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} width={40} />
                                                        <Tooltip formatter={(v) => currency(Number(v))} cursor={{ fill: '#f1f5f9' }} />
                                                        <Bar dataKey="Doanh Thu (đ)" fill="#2563eb" barSize={38} radius={[6, 6, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                            <h4 className="font-bold text-slate-800 mb-1">Tỷ trọng theo sân</h4>
                                            <p className="text-sm text-slate-500 mb-4">Phân bổ doanh thu giữa các sân</p>
                                            <div className="w-full h-72">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={courtRevenueData}
                                                            cx="50%" cy="50%" labelLine={false}
                                                            label={({ name, percent = 0 }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                            outerRadius={90} dataKey="value"
                                                        >
                                                            {courtRevenueData.map((_e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                                        </Pie>
                                                        <Tooltip formatter={(v) => currency(Number(v))} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ===== COURTS ===== */}
                            {section === 'courts' && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Add court form */}
                                    <div className="lg:col-span-1">
                                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-28">
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-5">
                                                <Plus className="w-5 h-5 text-blue-600" /> Thêm Sân Mới
                                            </h3>
                                            <form onSubmit={handleCreateCourt} className="flex flex-col gap-4">
                                                <Field label="Tên sân">
                                                    <input type="text" required value={courtFormData.name} placeholder="Sân số 1"
                                                        onChange={(e) => setCourtFormData({ ...courtFormData, name: e.target.value })} className={inputCls} />
                                                </Field>
                                                <Field label="Vị trí">
                                                    <input type="text" required value={courtFormData.location} placeholder="Quận 1, TP.HCM"
                                                        onChange={(e) => setCourtFormData({ ...courtFormData, location: e.target.value })} className={inputCls} />
                                                </Field>
                                                <Field label="Giá tiền / giờ">
                                                    <input type="number" required value={courtFormData.pricePerHour} placeholder="150000"
                                                        onChange={(e) => setCourtFormData({ ...courtFormData, pricePerHour: e.target.value })} className={inputCls} />
                                                </Field>
                                                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30">
                                                    <Plus className="w-5 h-5" /> Tạo Sân Mới
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                    {/* Court grid */}
                                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {courts.map((court) => (
                                            <div key={court.id} className="bg-white rounded-2xl shadow-sm border-t-4 border-x border-b border-slate-200 p-5 hover:shadow-lg transition-shadow">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-slate-800 text-lg">{court.name}</h3>
                                                        <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                                                            <MapPin className="w-4 h-4 text-slate-400" /> {court.location}
                                                        </p>
                                                    </div>
                                                    <button onClick={() => handleDeleteCourt(court.id)} title="Xóa sân"
                                                        className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <p className="text-amber-600 font-extrabold text-lg mt-4">{currency(court.pricePerHour)}<span className="text-sm font-medium text-slate-400">/giờ</span></p>
                                            </div>
                                        ))}
                                        {courts.length === 0 && <EmptyState label="Chưa có sân nào." />}
                                    </div>
                                </div>
                            )}

                            {/* ===== BOOKINGS ===== */}
                            {section === 'bookings' && (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    {bookings.length === 0 ? <EmptyState label="Chưa có lịch đặt nào." /> : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
                                                    <tr>
                                                        <Th>Mã</Th><Th>Khách hàng</Th><Th>Sân</Th><Th>Ngày chơi</Th><Th>Khung giờ</Th><Th className="text-right">Thao tác</Th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {bookings.map((b) => (
                                                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-6 py-4 font-bold text-slate-700">#{b.id}</td>
                                                            <td className="px-6 py-4 font-medium text-slate-900">{b.user?.name}</td>
                                                            <td className="px-6 py-4 text-slate-600">{b.court?.name}</td>
                                                            <td className="px-6 py-4 text-slate-600">{b.bookDate}</td>
                                                            <td className="px-6 py-4 font-semibold text-blue-600">{b.timeSlot}</td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button onClick={() => handleCancelBooking(b.id)}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors">
                                                                    <XCircle className="w-4 h-4" /> Hủy lịch
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ===== USERS ===== */}
                            {section === 'users' && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-1">
                                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-28">
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-5">
                                                <UserPlus className="w-5 h-5 text-blue-600" /> Thêm thành viên
                                            </h3>
                                            <form onSubmit={handleRegisterUser} className="flex flex-col gap-4">
                                                <Field label="Họ và tên">
                                                    <input type="text" required value={userFormData.name} placeholder="Nguyễn Văn A"
                                                        onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })} className={inputCls} />
                                                </Field>
                                                <Field label="Email">
                                                    <input type="email" required value={userFormData.email} placeholder="email@example.com"
                                                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })} className={inputCls} />
                                                </Field>
                                                <Field label="Số điện thoại">
                                                    <input type="text" value={userFormData.phone} placeholder="0987 654 321"
                                                        onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })} className={inputCls} />
                                                </Field>
                                                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30">
                                                    <UserPlus className="w-5 h-5" /> Đăng ký
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                        {users.length === 0 ? <EmptyState label="Chưa có thành viên nào." /> : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
                                                        <tr><Th>ID</Th><Th>Họ tên</Th><Th>Email</Th><Th>SĐT</Th></tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {users.map((u) => (
                                                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                                                <td className="px-6 py-4 font-bold text-slate-700">{u.id}</td>
                                                                <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                                                                <td className="px-6 py-4 text-slate-600">{u.email}</td>
                                                                <td className="px-6 py-4 text-slate-600">{u.phone || 'Chưa cập nhật'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

const inputCls =
    'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">{label}</label>
            {children}
        </div>
    );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <th className={`px-6 py-3.5 font-semibold ${className}`}>{children}</th>;
}

function EmptyState({ label }: { label: string }) {
    return <div className="p-10 text-center text-slate-400 text-sm w-full">{label}</div>;
}

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof DollarSign; label: string; value: string; accent: string }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${accent} flex items-center justify-center text-white shrink-0`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-xl font-extrabold text-slate-800 truncate">{value}</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500 ml-auto shrink-0" />
        </div>
    );
}

export default Admin;
