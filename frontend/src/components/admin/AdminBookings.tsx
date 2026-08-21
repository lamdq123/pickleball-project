import { useState, useEffect, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';
import { formatDate } from '../../utils/date';

export default function AdminBookings() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 👉 1. STATE QUẢN LÝ MODAL HỦY SÂN
    const [cancelModalData, setCancelModalData] = useState<{ id: number; isOpen: boolean }>({ id: 0, isOpen: false });
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Admin lấy toàn bộ danh sách đặt sân
            const res = await fetch('/api/bookings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Sắp xếp lịch mới nhất lên đầu
                setBookings(data.sort((a: any, b: any) => b.id - a.id));
            }
        } catch (error) {
            toast.error('Lỗi khi tải danh sách đặt sân!');
        } finally {
            setIsLoading(false);
        }
    };

    // 👉 2. HÀM MỞ BẢNG MODAL THAY VÌ DÙNG WINDOW.PROMPT
    const openCancelModal = (id: number) => {
        setCancelModalData({ id, isOpen: true });
        setCancelReason(''); // Xóa trắng lý do cũ (nếu có)
    };

    // 👉 3. HÀM CHÍNH THỨC GỬI LỆNH HỦY LÊN SERVER
    const confirmCancelBooking = async (e: FormEvent) => {
        e.preventDefault();
        const { id } = cancelModalData;
        const finalReason = cancelReason.trim();
        if (!finalReason) {
            toast.error('Vui lòng nhập lý do hủy lịch!');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/bookings?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: finalReason })
            });

            if (res.ok) {
                toast.success('Đã hủy lịch đặt và gửi thông báo cho khách!');
                fetchBookings(); // Load lại danh sách
                setCancelModalData({ id: 0, isOpen: false }); // Đóng modal
            } else {
                const data = await res.json();
                toast.error(data.error || 'Có lỗi xảy ra!');
            }
        } catch (error) {
            toast.error('Lỗi server!');
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 animate-fade-in-up">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="text-blue-600">📅</span> Quản lý Lịch đặt sân
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                            <th className="p-4 rounded-tl-xl font-bold">ID</th>
                            <th className="p-4 font-bold">Khách hàng</th>
                            <th className="p-4 font-bold">Sân</th>
                            <th className="p-4 font-bold">Thời gian</th>
                            <th className="p-4 rounded-tr-xl font-bold text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="p-4 font-bold text-slate-700">#{booking.id}</td>
                                <td className="p-4">
                                    <div className="font-bold text-slate-800">{booking.user.name}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{booking.user.phone}</div>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-blue-600">{booking.court.name}</div>
                                </td>
                                <td className="p-4">
                                    <div className="font-medium text-slate-700 bg-slate-100 inline-block px-2 py-1 rounded-md text-sm">{formatDate(booking.bookDate)}</div>
                                    <div className="text-sm text-slate-500 mt-1 font-medium">{booking.timeSlot}</div>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => openCancelModal(booking.id)}
                                        className="text-sm px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                                    >
                                        Hủy
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bookings.length === 0 && (
                    <div className="text-center py-12 text-slate-500">Chưa có lịch đặt sân nào.</div>
                )}
            </div>

            {/* 👉 4. BẢNG MODAL NHẬP LÝ DO HỦY SÂN */}
            {cancelModalData.isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setCancelModalData({ id: 0, isOpen: false })} // Bấm ra ngoài để tắt
                >
                    <div
                        className="bg-white rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">⚠️</span>
                            <h3 className="text-xl font-black text-slate-800">Xác nhận hủy lịch</h3>
                        </div>

                        <p className="text-slate-500 mb-6 text-sm">
                            Vui lòng nhập lý do hủy sân để thông báo cho khách hàng qua Email (ví dụ: Bảo trì sân, Lỗi hệ thống, Sân đã được đặt...).
                        </p>

                        <form onSubmit={confirmCancelBooking} className="space-y-4">
                            <textarea
                                rows={3}
                                placeholder="Nhập lý do hủy sân..."
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 resize-none transition-shadow"
                                required
                            ></textarea>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setCancelModalData({ id: 0, isOpen: false })}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                                >
                                    Đóng
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors cursor-pointer"
                                >
                                    Xác nhận hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}