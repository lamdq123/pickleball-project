import { useState, useEffect, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';

export default function AdminPromos() {
    const [promos, setPromos] = useState<any[]>([]);
    const [form, setForm] = useState({ code: '', discount: '', isPercent: false });
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
        const res = await fetch('/api/promos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
        });
        if (res.ok) {
            toast.success('Đã tạo mã giảm giá!');
            setForm({ code: '', discount: '', isPercent: false });
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
                <h3 className="text-lg font-bold text-slate-800 mb-6 border-l-4 border-emerald-500 pl-3">Tạo Mã Giảm Giá</h3>
                <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Mã code</label>
                        <input type="text" required placeholder="VD: VIP10" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg uppercase" />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Mức giảm</label>
                        <input type="number" required placeholder="VD: 10 hoặc 20000" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg" />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <input type="checkbox" id="isPercent" checked={form.isPercent} onChange={e => setForm({ ...form, isPercent: e.target.checked })} className="w-5 h-5 cursor-pointer" />
                        <label htmlFor="isPercent" className="text-sm font-bold text-slate-600 cursor-pointer">Giảm theo %</label>
                    </div>
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg cursor-pointer">TẠO MÃ</button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Mã CODE</th>
                            <th className="px-6 py-4 font-semibold">Mức giảm</th>
                            <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {promos.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold text-emerald-600 text-lg">{p.code}</td>
                                <td className="px-6 py-4 font-bold text-slate-700">{p.isPercent ? `${p.discount}%` : `${p.discount.toLocaleString('vi-VN')} đ`}</td>
                                <td className="px-6 py-4 text-center"><button onClick={() => handleDelete(p.id)} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-bold cursor-pointer">Xóa</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}