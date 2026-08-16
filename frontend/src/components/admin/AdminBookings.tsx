import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';

interface Court { id: number; name: string; pricePerHour: number; }
interface Booking { id: number; court: Court; user: any; bookDate: string; timeSlot: string; }

export default function AdminBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('customer_token')}`,
        'Content-Type': 'application/json'
    });

    const fetchBookings = async () => {
        const res = await fetch('/api/bookings', { headers: getHeaders() });
        if (res.ok) setBookings(await res.json());
    };

    const fetchCourts = async () => {
        const res = await fetch('/api/courts', { headers: getHeaders() });
        if (res.ok) setCourts(await res.json());
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([fetchBookings(), fetchCourts()]);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-75 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    const handleCancelBooking = async (id: number) => {
        if (!window.confirm("Hủy lịch đặt này?")) return;
        const res = await fetch(`/api/bookings?id=${id}`, { method: 'DELETE', headers: getHeaders() });
        if (res.ok) fetchBookings(); else toast.error("Lỗi khi hủy lịch");
    };

    const handleUpdateBooking = async (e: FormEvent) => {
        e.preventDefault();
        if (!editingBooking) return;
        const res = await fetch('/api/bookings', {
            method: 'PUT', headers: getHeaders(),
            body: JSON.stringify({ id: editingBooking.id, courtId: editingBooking.court.id, bookDate: editingBooking.bookDate, timeSlot: editingBooking.timeSlot })
        });
        if (res.ok) {
            toast.success("Cập nhật lịch thành công!");
            setEditingBooking(null);
            fetchBookings();
        } else toast.error((await res.json()).error);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">Danh sách Lịch đặt sân</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Mã vé</th>
                            <th className="px-6 py-4 font-semibold">Khách hàng</th>
                            <th className="px-6 py-4 font-semibold">Sân</th>
                            <th className="px-6 py-4 font-semibold">Ngày & Giờ</th>
                            <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {bookings.map(b => (
                            <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-700">#{b.id}</td>
                                <td className="px-6 py-4 font-medium text-slate-900">{b.user?.name || 'Khách vãng lai'}</td>
                                <td className="px-6 py-4 text-blue-600 font-semibold">{b.court?.name || 'Sân đã xóa'}</td>
                                <td className="px-6 py-4 text-slate-600">
                                    <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs mr-2 font-bold">{b.bookDate}</span>
                                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">{b.timeSlot}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => setEditingBooking(b)} className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-bold mr-2">Sửa</button>
                                    <button onClick={() => handleCancelBooking(b.id)} className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-bold border border-transparent hover:border-red-200">Hủy</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingBooking && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Sửa Lịch Đặt #{editingBooking.id}</h3>
                        <form onSubmit={handleUpdateBooking} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Chuyển sang Sân khác</label>
                                <select required value={editingBooking.court.id} onChange={e => setEditingBooking({ ...editingBooking, court: { ...editingBooking.court, id: Number(e.target.value) } })} className="w-full border border-slate-200 p-3 rounded-lg outline-none focus:border-blue-500">
                                    {courts.map(c => <option key={c.id} value={c.id}>{c.name} - {c.pricePerHour.toLocaleString('vi-VN')}đ/h</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Đổi Ngày</label>
                                <input type="date" required value={editingBooking.bookDate} onChange={e => setEditingBooking({ ...editingBooking, bookDate: e.target.value })} className="w-full border border-slate-200 p-3 rounded-lg outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Đổi Khung giờ</label>
                                <select required value={editingBooking.timeSlot} onChange={e => setEditingBooking({ ...editingBooking, timeSlot: e.target.value })} className="w-full border border-slate-200 p-3 rounded-lg outline-none focus:border-blue-500">
                                    {["05:00 - 06:00", "06:00 - 07:00", "17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00"].map(slot => <option key={slot} value={slot}>{slot}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
                                <button type="button" onClick={() => setEditingBooking(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold">Hủy</button>
                                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md">Lưu thay đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}