import { type FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

interface Court { id: number; name: string; location: string; pricePerHour: number; imageUrl?: string; }

interface BookingModalProps {
    selectedCourt: Court;
    bookDate: string;
    setBookDate: (date: string) => void;
    timeSlot: string;
    setTimeSlot: (slot: string) => void;
    bookedSlots: string[];
    TIME_SLOTS: string[];
    onClose: () => void;
    onSubmit: (e: FormEvent, finalPrice: number) => void; // 👉 Thêm finalPrice để báo cho Home biết
}

export default function BookingModal({
    selectedCourt, bookDate, setBookDate, timeSlot, setTimeSlot, bookedSlots, TIME_SLOTS, onClose, onSubmit
}: BookingModalProps) {

    // 👉 State lưu trữ Mã giảm giá
    const [promoCode, setPromoCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);

    // Hàm xử lý áp mã
    const handleApplyPromo = () => {
        const code = promoCode.trim().toUpperCase();
        if (code === 'GIAM20K') {
            setDiscountAmount(20000);
            toast.success(' Áp dụng mã GIAM20K thành công!');
        } else if (code === 'VIP10') {
            const discount = selectedCourt.pricePerHour * 0.1; // Giảm 10%
            setDiscountAmount(discount);
            toast.success(' Áp dụng mã VIP10 giảm 10%!');
        } else {
            setDiscountAmount(0);
            toast.error(' Mã giảm giá không hợp lệ hoặc đã hết hạn!');
        }
    };

    // Tính tiền thanh toán cuối cùng (Không được để số âm)
    const finalPrice = Math.max(selectedCourt.pricePerHour - discountAmount, 0);

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative transform transition-all scale-100">

                {/* Nút Tắt (X) */}
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 bg-slate-100 hover:bg-red-50 rounded-full p-2 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <h3 className="text-2xl font-bold text-slate-800 mb-6 pr-8">
                    Tạo lịch đặt sân
                </h3>

                {/* 👉 Hiển thị Tên sân & Giá gốc */}
                <div className="bg-blue-50/50 p-4 rounded-2xl mb-6 border border-blue-100/50">
                    <p className="text-slate-500 text-sm font-medium mb-1">Sân đang chọn:</p>
                    <p className="text-lg font-bold text-blue-700 mb-3">{selectedCourt.name}</p>
                    <div className="flex justify-between items-center pt-3 border-t border-blue-100">
                        <span className="text-slate-600 font-medium">Đơn giá:</span>
                        <span className="text-lg font-extrabold text-slate-800">{selectedCourt.pricePerHour.toLocaleString('vi-VN')} đ/giờ</span>
                    </div>
                </div>

                <form onSubmit={(e) => onSubmit(e, finalPrice)} className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex flex-col flex-1">
                            <label className="text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Ngày chơi</label>
                            <input type="date" required value={bookDate} onChange={e => setBookDate(e.target.value)} className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 transition-all font-medium text-slate-700" />
                        </div>

                        <div className="flex flex-col flex-1">
                            <label className="text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Khung giờ</label>
                            <select required value={timeSlot} onChange={e => setTimeSlot(e.target.value)} className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 transition-all cursor-pointer font-medium text-slate-700">
                                <option value="" disabled>-- Chọn giờ --</option>
                                {TIME_SLOTS.map(slot => {
                                    const isBooked = bookedSlots.includes(slot);
                                    return (
                                        <option key={slot} value={slot} disabled={isBooked} className={isBooked ? 'text-red-400 line-through' : 'text-slate-800'}>
                                            {slot} {isBooked ? '(Hết chỗ)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    {/* 👉 Giao diện Nhập Mã Giảm Giá */}
                    <div className="flex flex-col mt-2">
                        <label className="text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Mã giảm giá</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Nhập mã (VD: GIAM20K)"
                                value={promoCode}
                                onChange={e => setPromoCode(e.target.value)}
                                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-full bg-slate-50 uppercase transition-all font-bold text-emerald-600 placeholder:font-normal"
                            />
                            <button
                                type="button"
                                onClick={handleApplyPromo}
                                className="px-5 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors whitespace-nowrap shadow-md"
                            >
                                Áp dụng
                            </button>
                        </div>
                    </div>

                    {/* 👉 Hiển thị Tổng thanh toán */}
                    <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-200">
                        <span className="text-slate-500 font-bold uppercase tracking-wider">Tổng thanh toán:</span>
                        <div className="text-right">
                            {discountAmount > 0 && (
                                <p className="text-sm text-slate-400 line-through mb-0.5">{selectedCourt.pricePerHour.toLocaleString('vi-VN')} đ</p>
                            )}
                            <p className="text-3xl font-extrabold text-red-500">{finalPrice.toLocaleString('vi-VN')} đ</p>
                        </div>
                    </div>

                    <button type="submit" className="mt-2 w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                        XÁC NHẬN ĐẶT SÂN
                    </button>
                </form>
            </div>
        </div>
    );
}