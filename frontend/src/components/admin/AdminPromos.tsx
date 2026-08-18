import { useState, useEffect, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';

export default function AdminPromos() {
    const [promos, setPromos] = useState<any[]>([]);
    // 👉 Thêm description, validFrom, validTo vào state
    const [form, setForm] = useState({ code: '', discount: '', isPercent: false, description: '', validFrom: '', validTo: '' });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPromos = async () => {
            setIsLoading(true);
            try {
                await fetchPromos();
            } finally {
                setIsLoading(false);
            }
        };
        loadPromos();
    }, []);

    const fetchPromos = async () => {
        const res = await fetch('/api/promos');
        if (res.ok) setPromos(await res.json());
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-75 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();

        // 💡 KIỂM TRA LOGIC NGÀY THÁNG
        if (form.validFrom && form.validTo && form.validTo < form.validFrom) {
            toast.error('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!');
            return;
        }

        const res = await fetch('/api/promos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
        });
        
        if (res.ok) {
            toast.success('Đã tạo mã giảm giá thành công!');
            // 👉 Đặt lại form về rỗng sau khi tạo xong
            setForm({ code: '', discount: '', isPercent: false, description: '', validFrom: '', validTo: '' });
            fetchPromos();
        } else toast.error((await res.json()).error);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Xóa mã giảm giá này?")) return;
        const res = await fetch(`/api/promos?id=${id}`, { method: 'DELETE' });
        if (res.ok) { toast.success('Đã xóa!'); fetchPromos(); }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 border-l-4 border-emerald-500 pl-3">Tạo Mã Giảm Giá Sự Kiện</h3>
                
                <form onSubmit={handleCreate} className="space-y-4">
                    {/* HÀNG 1: THÔNG TIN CƠ BẢN */}
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Mã code <span className="text-red-500">*</span></label>
                            <input type="text" required placeholder="VD: VIP10" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg uppercase outline-none focus:border-emerald-500" />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Mức giảm <span className="text-red-500">*</span></label>
                            <input type="number" required placeholder="VD: 10 hoặc 20000" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg outline-none focus:border-emerald-500" />
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <input type="checkbox" id="isPercent" checked={form.isPercent} onChange={e => setForm({ ...form, isPercent: e.target.checked })} className="w-5 h-5 cursor-pointer accent-emerald-600" />
                            <label htmlFor="isPercent" className="text-sm font-bold text-slate-600 cursor-pointer w-24">Giảm theo %</label>
                        </div>
                    </div>

                    {/* HÀNG 2: THÔNG TIN SỰ KIỆN (Mô tả, Từ ngày, Đến ngày) */}
                    <div className="flex flex-col md:flex-row gap-4 items-end bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-emerald-700 uppercase mb-2 block">Mô tả sự kiện</label>
                            <input type="text" placeholder="VD: Siêu Sale 8/8" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 border border-emerald-200 bg-white rounded-lg outline-none focus:border-emerald-500" />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-emerald-700 uppercase mb-2 block">Từ ngày (Mở bán)</label>
                            <input type="date" value={form.validFrom} onChange={e => setForm({ ...form, validFrom: e.target.value })} className="w-full px-4 py-3 border border-emerald-200 bg-white rounded-lg outline-none focus:border-emerald-500 cursor-pointer" />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-emerald-700 uppercase mb-2 block">Đến ngày (Hết hạn)</label>
                            <input type="date" value={form.validTo} onChange={e => setForm({ ...form, validTo: e.target.value })} className="w-full px-4 py-3 border border-emerald-200 bg-white rounded-lg outline-none focus:border-emerald-500 cursor-pointer" />
                        </div>
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg cursor-pointer transition-colors shadow-md h-11.5 whitespace-nowrap">TẠO MÃ NGAY</button>
                    </div>
                </form>
            </div>

            {/* BẢNG HIỂN THỊ DANH SÁCH MÃ GIẢM GIÁ */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-200">
                        <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Mã CODE</th>
                                <th className="px-6 py-4 font-semibold">Mô tả</th>
                                <th className="px-6 py-4 font-semibold">Mức giảm</th>
                                <th className="px-6 py-4 font-semibold text-center">Thời hạn</th>
                                <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {promos.map(p => {
                                // 💡 Tính toán xem mã này đã HẾT HẠN hay CHƯA TỚI NGÀY không
                                const today = new Date().toISOString().split('T')[0];
                                const isExpired = p.validTo && today > p.validTo;
                                const isNotStarted = p.validFrom && today < p.validFrom;
                                
                                return (
                                    <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${isExpired ? 'opacity-60 grayscale' : ''}`}>
                                        <td className="px-6 py-4 font-bold text-emerald-600 text-lg">
                                            {p.code}
                                            {/* Hiển thị nhãn Badge tùy theo trạng thái */}
                                            {isExpired && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200 align-middle">HẾT HẠN</span>}
                                            {isNotStarted && <span className="ml-2 text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200 align-middle">SẮP MỞ</span>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">{p.description || '--'}</td>
                                        <td className="px-6 py-4 font-bold text-slate-700">{p.isPercent ? `${p.discount}%` : `${p.discount.toLocaleString('vi-VN')} đ`}</td>
                                        <td className="px-6 py-4 text-center text-sm font-medium text-slate-500">
                                            {p.validFrom || p.validTo ? (
                                                <div className="flex flex-col gap-1 items-center">
                                                    {p.validFrom && <span className="bg-slate-100 px-2 py-1 rounded">Từ: {p.validFrom}</span>}
                                                    {p.validTo && <span className="bg-slate-100 px-2 py-1 rounded">Đến: {p.validTo}</span>}
                                                </div>
                                            ) : 'Không giới hạn'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-bold cursor-pointer transition-colors border border-transparent hover:border-red-200">Xóa</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}