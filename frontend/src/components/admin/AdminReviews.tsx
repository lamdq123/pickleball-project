import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';

export default function AdminReviews() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadReviews = async () => {
            setIsLoading(true);
            try {
                await fetchReviews();
            } finally {
                setIsLoading(false);
            }
        };

        loadReviews();
    }, []);

    const fetchReviews = async () => {
        const res = await fetch('/api/reviews');
        if (res.ok) setReviews(await res.json());
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-75 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm("Xóa đánh giá này?")) return;
        const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
        if (res.ok) { toast.success('Đã xóa đánh giá!'); fetchReviews(); }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100"><h3 className="text-lg font-bold text-slate-800">Quản lý Đánh giá từ Khách hàng</h3></div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Khách hàng</th>
                            <th className="px-6 py-4 font-semibold">Tên Sân</th>
                            <th className="px-6 py-4 font-semibold">Số Sao</th>
                            <th className="px-6 py-4 font-semibold">Bình luận</th>
                            <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {reviews.map(r => (
                            <tr key={r.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold text-slate-700">{r.user?.name}</td>
                                <td className="px-6 py-4 text-blue-600 font-semibold">{r.court?.name}</td>
                                <td className="px-6 py-4 text-amber-500 font-bold">{"★".repeat(r.rating)}</td>
                                <td className="px-6 py-4 text-slate-600 italic">"{r.comment}"</td>
                                <td className="px-6 py-4 text-center"><button onClick={() => handleDelete(r.id)} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-bold cursor-pointer">Gỡ bỏ</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}