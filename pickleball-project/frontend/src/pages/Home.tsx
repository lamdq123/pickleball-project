import { useEffect, useState, type FormEvent } from 'react';

// Khai báo kiểu dữ liệu
interface User { id: number; name: string; email: string; phone: string | null; }
interface Court { id: number; name: string; location: string; pricePerHour: number; }

function Home() {
    const [users, setUsers] = useState<User[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);

    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [bookingData, setBookingData] = useState({ userId: '', bookDate: '', timeSlot: '17:00 - 18:00' });

    // Lấy dữ liệu Sân và Khách hàng (để đưa vào ô chọn người đặt)
    useEffect(() => {
        fetch('/api/users').then(r => r.json()).then(setUsers);
        fetch('/api/courts').then(r => r.json()).then(setCourts);
    }, []);

    // Hàm xử lý đặt sân đã có tính năng chống trùng lịch
    const handleBookCourt = async (e: FormEvent) => {
        e.preventDefault();
        if (!bookingData.userId) return alert("Vui lòng chọn người đặt!");

        try {
            const res = await fetch('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: bookingData.userId,
                    courtId: selectedCourt?.id,
                    bookDate: bookingData.bookDate,
                    timeSlot: bookingData.timeSlot
                }),
            });

            if (res.ok) {
                alert("🎉 Đặt sân thành công! Bạn có thể xem lịch ở trang Admin.");
                setSelectedCourt(null);
            } else {
                const errorData = await res.json();
                alert(errorData.error);
            }
        } catch (error) {
            console.error("Lỗi:", error);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ color: '#27ae60' }}>🎾 Chọn sân Pickleball của bạn</h1>

            {/* DANH SÁCH SÂN */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {courts.map((court) => (
                    <div key={court.id} style={{ border: '2px solid #27ae60', borderRadius: '10px', padding: '20px', width: '250px', backgroundColor: '#eafaf1' }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>{court.name}</h3>
                        <p>📍 {court.location}</p>
                        <p>💰 {court.pricePerHour.toLocaleString('vi-VN')} đ/giờ</p>
                        <button
                            onClick={() => setSelectedCourt(court)}
                            style={{ width: '100%', padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}
                        >
                            Đặt sân này
                        </button>
                    </div>
                ))}
            </div>

            {/* FORM ĐẶT SÂN KHI ĐƯỢC CHỌN */}
            {selectedCourt && (
                <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fff3cd', border: '1px solid #ffe69c', borderRadius: '8px' }}>
                    <h3>Tiến hành đặt: {selectedCourt.name}</h3>
                    <form onSubmit={handleBookCourt} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <select required value={bookingData.userId} onChange={(e) => setBookingData({ ...bookingData, userId: e.target.value })} style={{ padding: '8px' }}>
                            <option value="">-- Chọn khách hàng --</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                        <input type="date" required value={bookingData.bookDate} onChange={(e) => setBookingData({ ...bookingData, bookDate: e.target.value })} style={{ padding: '8px' }} />
                        <select value={bookingData.timeSlot} onChange={(e) => setBookingData({ ...bookingData, timeSlot: e.target.value })} style={{ padding: '8px' }}>
                            <option value="17:00 - 18:00">17:00 - 18:00</option>
                            <option value="18:00 - 19:00">18:00 - 19:00</option>
                            <option value="19:00 - 20:00">19:00 - 20:00</option>
                        </select>
                        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#d35400', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>Xác nhận đặt</button>
                        <button type="button" onClick={() => setSelectedCourt(null)} style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '5px' }}>Hủy</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Home;