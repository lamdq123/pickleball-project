import { useEffect, useState, type FormEvent } from 'react';

// Khai báo kiểu dữ liệu
interface User { id: number; name: string; email: string; phone: string | null; }
interface Court { id: number; name: string; location: string; pricePerHour: number; }

function Home() {
    const [users, setUsers] = useState<User[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);

    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [bookingData, setBookingData] = useState({ userId: '', bookDate: '', timeSlot: '17:00 - 18:00' });
    // Thêm danh sách TẤT CẢ các ca trong ngày (có thể thêm bớt tùy ý)
    const ALL_TIME_SLOTS = ["17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00"];

    // Thêm State này để chứa danh sách các ca đã bị người khác đặt
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    // Lấy dữ liệu Sân và Khách hàng (để đưa vào ô chọn người đặt)
    useEffect(() => {
        fetch('/api/users').then(r => r.json()).then(setUsers);
        fetch('/api/courts').then(r => r.json()).then(setCourts);
    }, []);

    useEffect(() => {
        // Chỉ gọi API khi đã chọn Sân và đã chọn Ngày
        if (selectedCourt && bookingData.bookDate) {
            fetch(`/api/check-slots?courtId=${selectedCourt.id}&date=${bookingData.bookDate}`)
                .then(r => r.json())
                .then(data => {
                    setBookedSlots(data); // Lưu danh sách các giờ đã bị đặt vào State
                    setBookingData(prev => ({ ...prev, timeSlot: '' })); // Reset lại giờ khách đang chọn
                });
        } else {
            setBookedSlots([]); // Nếu chưa chọn ngày thì xóa trắng danh sách
        }
    }, [selectedCourt, bookingData.bookDate]);
    // Hàm xử lý đặt sân đã có tính năng chống trùng lịch
    const handleBookCourt = async (e: FormEvent) => {
        e.preventDefault();
        if (!bookingData.userId) return alert("Vui lòng chọn người đặt!");

        if (!bookingData.timeSlot) return alert("Vui lòng chọn một khung giờ chơi!"); // hàm kiểm tra xem khách đã chọn giờ chưa

        try {
            const res = await fetch('/api/bookings', {
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
                        {/* DANH SÁCH GIỜ (THÔNG MINH) */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '10px 0' }}>
                            {ALL_TIME_SLOTS.map(slot => {
                                const isBooked = bookedSlots.includes(slot); // Kiểm tra xem giờ này có nằm trong danh sách đen không
                                const isSelected = bookingData.timeSlot === slot; // Giờ này khách đang bấm chọn

                                return (
                                    <button
                                        key={slot}
                                        type="button"
                                        disabled={isBooked} // Khóa nút nếu đã có người đặt
                                        onClick={() => setBookingData({ ...bookingData, timeSlot: slot })}
                                        style={{
                                            padding: '10px 15px',
                                            backgroundColor: isBooked ? '#bdc3c7' : isSelected ? '#d35400' : '#ffffff',
                                            color: isBooked ? '#7f8c8d' : isSelected ? '#ffffff' : '#2c3e50',
                                            border: `2px solid ${isSelected ? '#d35400' : '#bdc3c7'}`,
                                            cursor: isBooked ? 'not-allowed' : 'pointer',
                                            borderRadius: '5px',
                                            fontWeight: 'bold',
                                            transition: '0.2s'
                                        }}
                                    >
                                        {isBooked ? 'Đã hết' : slot}
                                    </button>
                                )
                            })}
                        </div>
                        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#d35400', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>Xác nhận đặt</button>
                        <button type="button" onClick={() => setSelectedCourt(null)} style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '5px' }}>Hủy</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Home;