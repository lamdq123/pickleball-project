import { useEffect, useState, type FormEvent } from 'react';
// import { useNavigate } from 'react-router-dom';
interface User { id: number; name: string; email: string; phone: string | null; }
interface Court { id: number; name: string; location: string; pricePerHour: number; }
interface Booking { id: number; user: User; court: Court; bookDate: string; timeSlot: string; }
import { useNavigate } from 'react-router-dom';
function Admin() {
    const [users, setUsers] = useState<User[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    // const navigate = useNavigate();
    const [userFormData, setUserFormData] = useState({ name: '', email: '', phone: '' });
    // Thêm state cho form tạo Sân mới
    const [courtFormData, setCourtFormData] = useState({ name: '', location: '', pricePerHour: '' });

    // Lấy vé một lần để dùng chung
    const token = localStorage.getItem('admin_token');
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    // Sửa 3 dòng fetch cũ thành thế này:
    const fetchUsers = () => fetch('/api/users', { headers: authHeaders }).then(r => r.json()).then(setUsers);
    const fetchCourts = () => fetch('/api/courts', { headers: authHeaders }).then(r => r.json()).then(setCourts);
    const fetchBookings = () => fetch('/api/bookings', { headers: authHeaders }).then(r => r.json()).then(setBookings);

    useEffect(() => {
        Promise.all([fetchUsers(), fetchCourts(), fetchBookings()]).then(() => setLoading(false));
    }, []);

    // Hàm tạo người dùng
    const handleRegisterUser = async (e: FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('admin_token'); // Lấy vé ra
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // 👉 Nhét thêm vé vào đây
            },
            body: JSON.stringify(userFormData),
        });
        if (res.ok) { alert("Thêm thành viên thành công!"); setUserFormData({ name: '', email: '', phone: '' }); fetchUsers(); }
    };

    // Hàm tạo Sân mới
    const handleCreateCourt = async (e: FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('admin_token'); // Lấy vé ra
        const res = await fetch('/api/courts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // 👉 Nhét thêm vé vào đây
            },
            body: JSON.stringify({
                name: courtFormData.name,
                location: courtFormData.location,
                pricePerHour: Number(courtFormData.pricePerHour) // Đổi chữ thành số
            }),
        });
        if (res.ok) {
            alert("Thêm sân mới thành công!");
            setCourtFormData({ name: '', location: '', pricePerHour: '' });
            fetchCourts(); // Tải lại danh sách sân
        }
    };

    // Hàm xóa Sân
    const handleDeleteCourt = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa sân này không?")) return;
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`/api/courts?id=${id}`, {
            method: 'DELETE',
            headers: {
                // 👉 CHÌA VÉ RA ĐÂY:
                'Authorization': `Bearer ${token}`
            }
        });
        if (res.ok) {
            alert("Đã xóa sân thành công!");
            fetchCourts();
        } else {
            const errorData = await res.json();
            alert(errorData.error); // Báo lỗi nếu sân đang có người đặt
        }
    };

    // Hàm hủy lịch
    const handleCancelBooking = async (id: number) => {
        if (!window.confirm("Hủy lịch đặt này?")) return;
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`/api/bookings?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (res.ok) {
            alert("Đã hủy lịch thành công!");
            fetchBookings();
        }
        if (res.ok) { fetchBookings(); }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>

            <h1 style={{ color: '#d35400' }}>🛠️ Bảng Điều Khiển Quản Trị (Admin)</h1>
            <button
                onClick={() => {
                    localStorage.removeItem('admin_token'); // Vứt chìa khóa đi
                    navigate('/login');// Đẩy về trang đăng nhập
                }}
                style={{ padding: '10px 20px', backgroundColor: '#7f8c8d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
                Đăng xuất
            </button>
            {/* ================= PHẦN QUẢN LÝ SÂN PICKLEBALL ================= */}
            <h2 style={{ color: '#27ae60', marginTop: '30px' }}>1. Quản lý Cơ sở vật chất (Sân)</h2>
            <div style={{ display: 'flex', gap: '30px' }}>
                <div style={{ flex: 1, backgroundColor: '#eafaf1', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
                    <h3>Thêm sân mới</h3>
                    <form onSubmit={handleCreateCourt} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input type="text" placeholder="Tên sân" required value={courtFormData.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCourtFormData({ ...courtFormData, name: e.target.value })} style={{ padding: '8px' }} />
                        <input type="text" placeholder="Vị trí" required value={courtFormData.location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCourtFormData({ ...courtFormData, location: e.target.value })} style={{ padding: '8px' }} />
                        <input type="number" placeholder="Giá tiền/Giờ" required value={courtFormData.pricePerHour} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCourtFormData({ ...courtFormData, pricePerHour: e.target.value })} style={{ padding: '8px' }} />
                        <button type="submit" style={{ padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Tạo Sân Mới</button>
                    </form>
                </div>

                <div style={{ flex: 2 }}>
                    <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#27ae60', color: 'white' }}>
                                <th>Mã Sân</th><th>Tên Sân</th><th>Vị Trí</th><th>Giá/Giờ</th><th>Thao tác</th>
                            </tr>
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

            <hr style={{ margin: '40px 0', border: '1px solid #ccc' }} />

            {/* ================= PHẦN QUẢN LÝ LỊCH ĐẶT ================= */}
            <h2 style={{ color: '#2c3e50' }}>2. Lịch đặt sân hiện tại</h2>
            {loading ? <p>Đang tải...</p> : bookings.length === 0 ? <p>Chưa có lịch đặt nào.</p> : (
                <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '40px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th>Mã Booking</th><th>Khách hàng</th><th>Sân</th><th>Ngày chơi</th><th>Khung giờ</th><th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((b) => (
                            <tr key={b.id}>
                                <td style={{ textAlign: 'center' }}>#{b.id}</td>
                                <td><strong>{b.user.name}</strong></td><td>{b.court.name}</td><td>{b.bookDate}</td><td>{b.timeSlot}</td>
                                <td style={{ textAlign: 'center' }}><button onClick={() => handleCancelBooking(b.id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>Hủy lịch</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <hr style={{ margin: '40px 0', border: '1px solid #ccc' }} />

            {/* ================= PHẦN QUẢN LÝ THÀNH VIÊN ================= */}
            <h2 style={{ color: '#2c3e50' }}>3. Quản lý thành viên</h2>
            <div style={{ display: 'flex', gap: '30px' }}>
                <div style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', height: 'fit-content' }}>
                    <h3>Thêm thành viên</h3>
                    <form onSubmit={handleRegisterUser} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input type="text" placeholder="Họ và tên" required value={userFormData.name} onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })} style={{ padding: '8px' }} />
                        <input type="email" placeholder="Email" required value={userFormData.email} onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })} style={{ padding: '8px' }} />
                        <input type="text" placeholder="Số điện thoại" value={userFormData.phone} onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })} style={{ padding: '8px' }} />
                        <button type="submit" style={{ padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Đăng ký</button>
                    </form>
                </div>
                <div style={{ flex: 2 }}>
                    <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                <th>ID</th><th>Họ Tên</th><th>Email</th><th>SĐT</th>
                            </tr>
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