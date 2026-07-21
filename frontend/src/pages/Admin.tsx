import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
// 👉 IMPORT CÁC COMPONENT BIỂU ĐỒ TỪ RECHARTS
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface User { id: number; name: string; email: string; phone: string | null; }
interface Court { id: number; name: string; location: string; pricePerHour: number; }
interface Booking { id: number; user: User; court: Court; bookDate: string; timeSlot: string; }

function Admin() {
    const [users, setUsers] = useState<User[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const [userFormData, setUserFormData] = useState({ name: '', email: '', phone: '' });
    const [courtFormData, setCourtFormData] = useState({ name: '', location: '', pricePerHour: '' });

    const token = localStorage.getItem('admin_token');
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    const fetchUsers = () => fetch('/api/users', { headers: authHeaders }).then(r => r.json()).then(setUsers);
    const fetchCourts = () => fetch('/api/courts', { headers: authHeaders }).then(r => r.json()).then(setCourts);
    const fetchBookings = () => fetch('/api/bookings', { headers: authHeaders }).then(r => r.json()).then(setBookings);

    useEffect(() => {
        Promise.all([fetchUsers(), fetchCourts(), fetchBookings()]).then(() => setLoading(false));
    }, []);

    // ==========================================
    // 📊 LOGIC XỬ LÝ DỮ LIỆU ĐỂ VẼ BIỂU ĐỒ (CHẾ BIẾN DATA)
    // ==========================================

    // 1. Chế biến dữ liệu doanh thu theo ngày (Cho Biểu đồ Cột)
    const getRevenueByDate = () => {
        const revenueMap: { [key: string]: number } = {};
        bookings.forEach(b => {
            const date = b.bookDate;
            const price = b.court?.pricePerHour || 0;
            revenueMap[date] = (revenueMap[date] || 0) + price;
        });
        // Chuyển sang mảng Object: [{ date: '2026-07-10', doanhThu: 150000 }]
        return Object.keys(revenueMap).sort().map(date => ({
            date: date,
            'Doanh Thu (đ)': revenueMap[date]
        }));
    };

    // 2. Chế biến dữ liệu tỷ lệ doanh thu theo sân (Cho Biểu đồ Tròn)
    const getRevenueByCourt = () => {
        const courtMap: { [key: string]: number } = {};
        bookings.forEach(b => {
            const courtName = b.court?.name || 'Sân ẩn';
            const price = b.court?.pricePerHour || 0;
            courtMap[courtName] = (courtMap[courtName] || 0) + price;
        });
        // Chuyển sang mảng Object: [{ name: 'Sân A', value: 300000 }]
        return Object.keys(courtMap).map(name => ({
            name: name,
            value: courtMap[name]
        }));
    };

    const dailyRevenueData = getRevenueByDate();
    const courtRevenueData = getRevenueByCourt();

    // Bảng màu cho biểu đồ tròn
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    // ==========================================
    // CÁC HÀM THAO TÁC CRUD (GIỮ NGUYÊN HOÀN HẢO CỦA EM)
    // ==========================================
    const handleRegisterUser = async (e: FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/users', {
            method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(userFormData),
        });
        if (res.ok) { alert("Thêm thành viên thành công!"); setUserFormData({ name: '', email: '', phone: '' }); fetchUsers(); }
    };

    const handleCreateCourt = async (e: FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/courts', {
            method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify({ name: courtFormData.name, location: courtFormData.location, pricePerHour: Number(courtFormData.pricePerHour) }),
        });
        if (res.ok) { alert("Thêm sân mới thành công!"); setCourtFormData({ name: '', location: '', pricePerHour: '' }); fetchCourts(); }
    };

    const handleDeleteCourt = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa sân này không?")) return;
        const res = await fetch(`/api/courts?id=${id}`, { method: 'DELETE', headers: authHeaders });
        if (res.ok) { alert("Đã xóa sân thành công!"); fetchCourts(); } else { const err = await res.json(); alert(err.error); }
    };

    const handleCancelBooking = async (id: number) => {
        if (!window.confirm("Hủy lịch đặt này?")) return;
        const res = await fetch(`/api/bookings?id=${id}`, { method: 'DELETE', headers: authHeaders });
        if (res.ok) { alert("Đã hủy lịch thành công!"); fetchBookings(); }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: '#d35400' }}>🛠️ Bảng Điều Khiển Quản Trị (Admin)</h1>
                <button
                    onClick={() => { localStorage.removeItem('admin_token'); navigate('/login'); }}
                    style={{ padding: '10px 20px', backgroundColor: '#7f8c8d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Đăng xuất
                </button>
            </div>

            {/* ==========================================
                📊 KHU VỰC BIỂU ĐỒ BÁO CÁO DOANH THU (NEW ACCENT)
                ========================================== */}
            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>📈 Thống kê báo cáo doanh thu</h2>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>

                {/* 1. Biểu đồ cột: Tăng trưởng doanh thu theo ngày */}
                <div style={{ flex: 1, minWidth: '450px', backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #ddd' }}>
                    <h4 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#34495e' }}>Doanh thu theo ngày</h4>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyRevenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')} đ`} />
                                <Legend />
                                <Bar dataKey="Doanh Thu (đ)" fill="#2ecc71" barSize={40} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Biểu đồ tròn: Tỷ trọng doanh thu giữa các Sân */}
                <div style={{ flex: 1, minWidth: '350px', backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h4 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#34495e' }}>Tỷ trọng doanh thu theo Sân</h4>
                    <div style={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={courtRevenueData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent = 0 }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {courtRevenueData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')} đ`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            <hr style={{ border: '1px solid #eee', marginBottom: '30px' }} />

            {/* ================= PHẦN QUẢN LÝ SÂN PICKLEBALL ================= */}
            <h2 style={{ color: '#27ae60' }}>1. Quản lý Cơ sở vật chất (Sân)</h2>
            <div style={{ display: 'flex', gap: '30px', marginBottom: '40px' }}>
                <div style={{ flex: 1, backgroundColor: '#eafaf1', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
                    <h3>Thêm sân mới</h3>
                    <form onSubmit={handleCreateCourt} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input type="text" placeholder="Tên sân" required value={courtFormData.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCourtFormData({ ...courtFormData, name: e.target.value })} style={{ padding: '8px' }} />
                        <input type="text" placeholder="Vị trí" required value={courtFormData.location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCourtFormData({ ...courtFormData, location: e.target.value })} style={{ padding: '8px' }} />
                        <input type="number" placeholder="Giá tiền/Giờ" required value={courtFormData.pricePerHour} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCourtFormData({ ...courtFormData, pricePerHour: e.target.value })} style={{ padding: '8px' }} />
                        <button type="submit" style={{ padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>Tạo Sân Mới</button>
                    </form>
                </div>
                <div style={{ flex: 2 }}>
                    <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#27ae60', color: 'white' }}><th>Mã Sân</th><th>Tên Sân</th><th>Vị Trí</th><th>Giá/Giờ</th><th>Thao tác</th></tr>
                        </thead>
                        <tbody>
                            {courts.map((court) => (
                                <tr key={court.id}>
                                    <td style={{ textAlign: 'center' }}>{court.id}</td><td>{court.name}</td><td>{court.location}</td>
                                    <td>{court.pricePerHour.toLocaleString('vi-VN')} đ</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => handleDeleteCourt(court.id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ================= PHẦN QUẢN LÝ LỊCH ĐẶT ================= */}
            <h2 style={{ color: '#2c3e50' }}>2. Lịch đặt sân hiện tại</h2>
            {loading ? <p>Đang tải...</p> : bookings.length === 0 ? <p>Chưa có lịch đặt nào.</p> : (
                <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '40px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}><th>Mã Booking</th><th>Khách hàng</th><th>Sân</th><th>Ngày chơi</th><th>Khung giờ</th><th>Thao tác</th></tr>
                    </thead>
                    <tbody>
                        {bookings.map((b) => (
                            <tr key={b.id}>
                                <td style={{ textAlign: 'center' }}>#{b.id}</td>
                                <td><strong>{b.user?.name}</strong></td><td>{b.court?.name}</td><td>{b.bookDate}</td><td>{b.timeSlot}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <button onClick={() => handleCancelBooking(b.id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>Hủy lịch</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* ================= PHẦN QUẢN LÝ THÀNH VIÊN ================= */}
            <h2 style={{ color: '#2c3e50' }}>3. Quản lý thành viên</h2>
            <div style={{ display: 'flex', gap: '30px' }}>
                <div style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
                    <h3>Thêm thành viên</h3>
                    <form onSubmit={handleRegisterUser} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input type="text" placeholder="Họ và tên" required value={userFormData.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserFormData({ ...userFormData, name: e.target.value })} style={{ padding: '8px' }} />
                        <input type="email" placeholder="Email" required value={userFormData.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserFormData({ ...userFormData, email: e.target.value })} style={{ padding: '8px' }} />
                        <input type="text" placeholder="Số điện thoại" value={userFormData.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserFormData({ ...userFormData, phone: e.target.value })} style={{ padding: '8px' }} />
                        <button type="submit" style={{ padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>Đăng ký</button>
                    </form>
                </div>
                <div style={{ flex: 2 }}>
                    <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}><th>ID</th><th>Họ Tên</th><th>Email</th><th>SĐT</th></tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}><td>{user.id}</td><td>{user.name}</td><td>{user.email}</td><td>{user.phone || 'Chưa cập nhật'}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Admin;