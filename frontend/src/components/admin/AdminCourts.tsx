import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';

interface Court { 
    id: number; name: string; location: string; pricePerHour: number; imageUrl?: string;
    goldenHourStart?: string; goldenHourEnd?: string; goldenDiscount?: number;
}

export default function AdminCourts() {
    const [courts, setCourts] = useState<Court[]>([]);
    const [courtFormData, setCourtFormData] = useState({ 
        name: '', location: '', pricePerHour: '', imageUrl: '', 
        goldenHourStart: '', goldenHourEnd: '', goldenDiscount: '' 
    });
    const [editingCourtId, setEditingCourtId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const HOURS = ['05:00', '06:00', '07:00', '17:00', '18:00', '19:00', '20:00'];

    const getHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('customer_token')}`,
        'Content-Type': 'application/json'
    });

    const fetchCourts = async () => {
        setIsLoading(true);
        const res = await fetch('/api/courts', { headers: getHeaders() });
        if (res.ok) setCourts(await res.json());
        setIsLoading(false);
    };

    useEffect(() => { fetchCourts(); }, []);

    const handleSubmitCourt = async (e: FormEvent) => {
        e.preventDefault();

        // 💡 KIỂM TRA RÀNG BUỘC GIỜ VÀNG: Nếu điền 1 ô thì phải điền đủ 3 ô
        const hasGoldenStart = !!courtFormData.goldenHourStart;
        const hasGoldenEnd = !!courtFormData.goldenHourEnd;
        const hasDiscount = !!courtFormData.goldenDiscount;

        if (hasGoldenStart || hasGoldenEnd || hasDiscount) {
            if (!hasGoldenStart || !hasGoldenEnd || !hasDiscount) {
                toast.error("Vui lòng nhập đầy đủ Cả 3 thông tin Giờ Vàng (Bắt đầu, Kết thúc, Giảm giá) hoặc để trống toàn bộ!");
                return; // Chặn không cho gửi lên Backend
            }
        }

        const method = editingCourtId ? 'PUT' : 'POST';
        const body = { ...courtFormData, pricePerHour: Number(courtFormData.pricePerHour), id: editingCourtId };

        const res = await fetch('/api/courts', { method, headers: getHeaders(), body: JSON.stringify(body) });

        if (res.ok) {
            toast.success(editingCourtId ? "Đã cập nhật thông tin sân!" : "Thêm sân mới thành công!");
            setCourtFormData({ name: '', location: '', pricePerHour: '', imageUrl: '', goldenHourStart: '', goldenHourEnd: '', goldenDiscount: '' });
            setEditingCourtId(null);
            fetchCourts();
        } else toast.error((await res.json()).error);
    };

    const handleDeleteCourt = async (id: number) => {
        if (!window.confirm("Xóa sân này? Hệ thống sẽ báo lỗi nếu sân đang có lịch đặt.")) return;
        const res = await fetch(`/api/courts?id=${id}`, { method: 'DELETE', headers: getHeaders() });
        if (res.ok) fetchCourts(); else toast.error((await res.json()).error);
    };

    const handleEditCourtClick = (court: Court) => {
        setEditingCourtId(court.id);
        setCourtFormData({ 
            name: court.name, location: court.location, pricePerHour: court.pricePerHour.toString(), imageUrl: court.imageUrl || '',
            goldenHourStart: court.goldenHourStart || '', 
            goldenHourEnd: court.goldenHourEnd || '', 
            goldenDiscount: court.goldenDiscount?.toString() || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 💡 LOGIC: Xử lý khi Admin chọn Giờ Bắt Đầu
    const handleStartHourChange = (e: any) => {
        const newStart = e.target.value;
        let newEnd = courtFormData.goldenHourEnd;
        
        // Nếu đã có giờ kết thúc, kiểm tra xem nó có bị lỗi logic (<= giờ bắt đầu) không
        if (newStart && newEnd) {
            const startHour = parseInt(newStart.split(':')[0]);
            const endHour = parseInt(newEnd.split(':')[0]);
            if (endHour <= startHour) {
                newEnd = ''; // Reset giờ kết thúc về rỗng để bắt Admin chọn lại
            }
        }
        setCourtFormData({ ...courtFormData, goldenHourStart: newStart, goldenHourEnd: newEnd });
    };

    // 💡 LOGIC: Lọc danh sách Giờ Kết Thúc hợp lệ
    const availableEndHours = HOURS.filter(h => {
        if (!courtFormData.goldenHourStart) return true; // Nếu chưa chọn giờ bắt đầu thì hiện tất cả
        const startHour = parseInt(courtFormData.goldenHourStart.split(':')[0]);
        const endHour = parseInt(h.split(':')[0]);
        return endHour > startHour; // Chỉ giữ lại các giờ kết thúc LỚN HƠN giờ bắt đầu
    });

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 border-l-4 border-blue-500 pl-3">
                    {editingCourtId ? 'Sửa thông tin Sân' : 'Thêm sân mới'}
                </h3>
                <form onSubmit={handleSubmitCourt} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tên sân <span className="text-red-500">*</span></label>
                        {/* 👉 Thuộc tính required cho bắt buộc nhập */}
                        <input type="text" required value={courtFormData.name} onChange={e => setCourtFormData({ ...courtFormData, name: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Vị trí <span className="text-red-500">*</span></label>
                        <input type="text" required value={courtFormData.location} onChange={e => setCourtFormData({ ...courtFormData, location: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Giá (VNĐ/giờ) <span className="text-red-500">*</span></label>
                        <input type="number" required value={courtFormData.pricePerHour} onChange={e => setCourtFormData({ ...courtFormData, pricePerHour: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Link Ảnh (Tùy chọn)</label>
                        <input type="url" placeholder="https://..." value={courtFormData.imageUrl} onChange={e => setCourtFormData({ ...courtFormData, imageUrl: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    {/* KHU VỰC CẤU HÌNH GIỜ VÀNG */}
                    <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-amber-50 p-4 rounded-xl border border-amber-200 mt-2">
                        <div className="w-full">
                            <label className="text-xs font-bold text-amber-700 uppercase mb-2 block">Bắt đầu giờ vàng</label>
                            <select value={courtFormData.goldenHourStart} onChange={handleStartHourChange} className="w-full px-4 py-3 border border-amber-200 bg-white rounded-lg focus:ring-2 focus:ring-amber-500 outline-none">
                                <option value="">-- Không áp dụng --</option>
                                {HOURS.map(h => <option key={`start-${h}`} value={h}>{h}</option>)}
                            </select>
                        </div>
                        <div className="w-full">
                            <label className="text-xs font-bold text-amber-700 uppercase mb-2 block">Kết thúc giờ vàng</label>
                            <select value={courtFormData.goldenHourEnd} onChange={e => setCourtFormData({ ...courtFormData, goldenHourEnd: e.target.value })} className="w-full px-4 py-3 border border-amber-200 bg-white rounded-lg focus:ring-2 focus:ring-amber-500 outline-none">
                                <option value="">-- Chọn giờ --</option>
                                {/* 👉 Chỉ render các mốc giờ hợp lệ từ mảng availableEndHours */}
                                {availableEndHours.map(h => <option key={`end-${h}`} value={h}>{h}</option>)}
                            </select>
                        </div>
                        <div className="w-full">
                            <label className="text-xs font-bold text-amber-700 uppercase mb-2 block">Giảm giá (%)</label>
                            <input type="number" min="1" max="100" placeholder="Ví dụ: 10" value={courtFormData.goldenDiscount} onChange={e => setCourtFormData({ ...courtFormData, goldenDiscount: e.target.value })} className="w-full px-4 py-3 border border-amber-200 bg-white rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                    </div>

                    <div className="lg:col-span-4 mt-2 flex gap-3">
                        <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md">
                            {editingCourtId ? 'LƯU THAY ĐỔI' : 'THÊM SÂN MỚI'}
                        </button>
                        {editingCourtId && (
                            <button type="button" onClick={() => { setEditingCourtId(null); setCourtFormData({ name: '', location: '', pricePerHour: '', imageUrl: '', goldenHourStart: '', goldenHourEnd: '', goldenDiscount: '' }); }} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-8 rounded-lg">
                                HỦY
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courts.map(court => (
                        <div key={court.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div>
                                {court.imageUrl && <img src={court.imageUrl} alt={court.name} className="w-full h-32 object-cover rounded-lg mb-4" />}
                                <h4 className="text-xl font-bold text-slate-800">{court.name}</h4>
                                <p className="text-slate-500 text-sm mt-2 flex items-center gap-1">📍 {court.location}</p>
                                <p className="text-emerald-600 font-bold mt-4 text-lg">{court.pricePerHour.toLocaleString('vi-VN')} <span className="text-sm font-normal text-slate-500">đ/giờ</span></p>
                                
                                {/* Thêm Badge hiển thị Giờ Vàng ra danh sách cho dễ nhìn */}
                                {court.goldenHourStart && court.goldenHourEnd && (
                                    <p className="mt-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-lg inline-block">
                                        ✨ Giờ vàng: {court.goldenHourStart} - {court.goldenHourEnd} (-{court.goldenDiscount}%)
                                    </p>
                                )}
                            </div>
                            <div className="mt-6 flex gap-2">
                                <button onClick={() => handleEditCourtClick(court)} className="flex-1 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-colors border border-blue-100">Sửa</button>
                                <button onClick={() => handleDeleteCourt(court.id)} className="flex-1 py-2.5 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors border border-red-100">Xóa</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}