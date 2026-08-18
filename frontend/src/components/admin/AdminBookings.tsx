import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';

export default function AdminBookings() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const getHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('customer_token')}`,
        'Content-Type': 'application/json'
    });

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/bookings', { headers: getHeaders() });
            if (res.ok) {
                const data = await res.json();

                // 👉 1. SẮP XẾP MỚI NHẤT LÊN ĐẦU (ID giảm dần)
                const sortedData = data.sort((a: any, b: any) => b.id - a.id);
                setBookings(sortedData);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchBookings(); }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy lịch này?")) return;
        const res = await fetch(`/api/bookings?id=${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (res.ok) {
            toast.success("Đã hủy lịch thành công!");
            fetchBookings();
        } else {
            toast.error("Lỗi khi hủy lịch!");
        }
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
            <h3 className="text-xl font-bold text-slate-800 mb-6 border-l-4 border-blue-500 pl-3">Danh sách Lịch đặt sân</h3>

            {isLoading ? (
                <LoadingSpinner />
            ) : bookings.length === 0 ? (
                <div className="text-center py-10">
                    <span className="text-4xl block mb-2">📭</span>
                    <p className="text-slate-500 font-medium">Chưa có lịch đặt nào trên hệ thống.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-200">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="py-4 px-4 text-slate-500 font-bold text-xs uppercase tracking-wider">Mã vé</th>
                                <th className="py-4 px-4 text-slate-500 font-bold text-xs uppercase tracking-wider">Khách hàng</th>
                                <th className="py-4 px-4 text-slate-500 font-bold text-xs uppercase tracking-wider">Sân</th>
                                {/* 👉 2. THÊM TIÊU ĐỀ CỘT VỊ TRÍ */}
                                <th className="py-4 px-4 text-slate-500 font-bold text-xs uppercase tracking-wider">Vị trí</th>
                                <th className="py-4 px-4 text-slate-500 font-bold text-xs uppercase tracking-wider">Ngày & Giờ</th>
                                <th className="py-4 px-4 text-slate-500 font-bold text-xs uppercase tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(booking => (
                                <tr key={booking.id} className="border-b border-slate-50 hover:bg-blue-50/50 transition-colors">
                                    <td className="py-4 px-4 font-bold text-slate-700">#{booking.id}</td>
                                    <td className="py-4 px-4 font-bold text-slate-800">{booking.user?.name || 'Khách ẩn danh'}</td>
                                    <td className="py-4 px-4 text-blue-600 font-bold">{booking.court?.name}</td>

                                    {/* 👉 3. THÊM DỮ LIỆU CỘT VỊ TRÍ */}
                                    <td className="py-4 px-4 text-slate-600 text-sm">
                                        <span className="flex items-center gap-1">📍 {booking.court?.location}</span>
                                    </td>

                                    <td className="py-4 px-4">
                                        <div className="flex gap-2 text-xs font-bold">
                                            <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded-md">{booking.bookDate}</span>
                                            <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md">{booking.timeSlot}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 flex gap-2 font-bold text-sm justify-end cursor-pointer">
                                        <button
                                            onClick={() => handleDelete(booking.id)}
                                            className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-500 hover:border-red-500 hover:text-white transition-all shadow-sm cursor-pointer"
                                        >
                                            Hủy lịch
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}