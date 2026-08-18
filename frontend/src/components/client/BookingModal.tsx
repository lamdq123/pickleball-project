import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';

interface BookingModalProps {
    selectedCourt: any;
    bookDate: string;
    setBookDate: (val: string) => void;
    timeSlot: string;
    setTimeSlot: (val: string) => void;
    bookedSlots: string[];
    TIME_SLOTS: string[];
    onClose: () => void;
    onSubmit: (e: FormEvent, finalPrice: number) => void;
}

export default function BookingModal({ selectedCourt, bookDate, setBookDate, timeSlot, setTimeSlot, bookedSlots, TIME_SLOTS, onClose, onSubmit }: BookingModalProps) {
    const [promoCode, setPromoCode] = useState('');
    const [discountPercent, setDiscountPercent] = useState(0);

    // ==========================================
    // 💡 LOGIC TÍNH TIỀN AN TOÀN (SAFE CALCULATION)
    // ==========================================
    let isGoldenHour = false;
    let finalPrice = selectedCourt?.pricePerHour || 0;

    // 1. Chỉ kiểm tra Giờ vàng nếu timeSlot và thông số Giờ vàng ĐÃ TỒN TẠI
    if (timeSlot && selectedCourt?.goldenHourStart && selectedCourt?.goldenHourEnd && selectedCourt?.goldenDiscount) {
        const bookStartHour = parseInt(timeSlot.split(':')[0]); // VD: "16:00 - 17:00" -> lấy 16
        const goldenStartHour = parseInt(selectedCourt.goldenHourStart.split(':')[0]); // VD: "16:00" -> lấy 16
        const goldenEndHour = parseInt(selectedCourt.goldenHourEnd.split(':')[0]);

        // Nếu giờ khách đặt nằm trong khoảng vàng
        if (bookStartHour >= goldenStartHour && bookStartHour < goldenEndHour) {
            isGoldenHour = true;
            // Trừ tiền theo % giảm giá giờ vàng của sân đó
            finalPrice = finalPrice - (finalPrice * selectedCourt.goldenDiscount / 100);
        }
    }

    // 2. Tính tiếp Mã giảm giá (Nếu khách nhập mã hợp lệ)
    if (discountPercent > 0) {
        finalPrice = finalPrice - (finalPrice * discountPercent / 100);
    }

    // Hàm gọi API check mã giảm giá
    const handleApplyPromo = async () => {
        if (!promoCode) return;
        // 👉 CHẶN NGAY NẾU GIÁ SÂN ĐÃ VỀ 0Đ
        if (finalPrice <= 0) {
            toast.error('Giá sân đã được giảm 100%, không thể áp dụng thêm mã!');
            setPromoCode(''); // Xóa luôn chữ khách vừa nhập cho gọn
            return; // Dừng lại, không gọi API nữa
        }
        try {
            const res = await fetch(`/api/promos?code=${promoCode}`);
            if (res.ok) {
                // Giả định API của em trả về object có chứa số % giảm
                const data = await res.json();
                setDiscountPercent(data.discount || 10); // Default giảm 10% nếu API chưa chuẩn
                toast.success('Áp dụng mã giảm giá thành công!');
            } else {
                toast.error('Mã giảm giá không hợp lệ hoặc đã hết hạn!');
                setDiscountPercent(0);
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi kiểm tra mã!');
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">

                {/* Header Modal */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">Đặt Sân</h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold transition-colors">✕</button>
                </div>

                {/* Tóm tắt thông tin Sân */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                    <h4 className="font-bold text-lg text-slate-800">{selectedCourt.name}</h4>
                    <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">📍 {selectedCourt.location}</p>
                    <p className="text-slate-500 text-sm mt-1">Giá gốc: {selectedCourt.pricePerHour.toLocaleString('vi-VN')} đ/giờ</p>
                </div>

                <form onSubmit={(e) => onSubmit(e, finalPrice)} className="space-y-4">
                    {/* Chọn ngày */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Ngày chơi</label>
                        <input type="date" required min={new Date().toISOString().split('T')[0]} value={bookDate} onChange={e => setBookDate(e.target.value)} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    {/* Chọn giờ */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Khung giờ</label>
                        {bookDate ? (
                            <div className="grid grid-cols-2 gap-3">
                                {TIME_SLOTS.map(slot => {
                                    const isBooked = bookedSlots.includes(slot);

                                    // 💡 KIỂM TRA XEM Ô NÀY CÓ PHẢI LÀ GIỜ VÀNG KHÔNG
                                    let isSlotGolden = false;
                                    if (selectedCourt?.goldenHourStart && selectedCourt?.goldenHourEnd && selectedCourt?.goldenDiscount) {
                                        const slotStartHour = parseInt(slot.split(':')[0]);
                                        const goldenStartHour = parseInt(selectedCourt.goldenHourStart.split(':')[0]);
                                        const goldenEndHour = parseInt(selectedCourt.goldenHourEnd.split(':')[0]);
                                        if (slotStartHour >= goldenStartHour && slotStartHour < goldenEndHour) {
                                            isSlotGolden = true;
                                        }
                                    }

                                    // 💡 GÁN CLASS MÀU SẮC DỰA TRÊN TRẠNG THÁI
                                    let labelClasses = "border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ";

                                    if (isBooked) {
                                        labelClasses += "bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed"; // Đã được đặt
                                    } else if (timeSlot === slot) {
                                        labelClasses += "border-blue-600 bg-blue-50 text-blue-700 shadow-md shadow-blue-500/20"; // Đang được chọn
                                    } else if (isSlotGolden) {
                                        labelClasses += "border-amber-300 bg-amber-50 hover:border-amber-400 hover:bg-amber-100 text-amber-900"; // Là giờ vàng
                                    } else {
                                        labelClasses += "border-slate-200 hover:border-blue-400 text-slate-700"; // Giờ bình thường
                                    }

                                    return (
                                        <label key={slot} className={labelClasses}>
                                            <input type="radio" name="timeSlot" value={slot} checked={timeSlot === slot} onChange={e => setTimeSlot(e.target.value)} disabled={isBooked} className="hidden" />
                                            <span className="text-sm font-bold z-10">{slot}</span>

                                            {/* Hiện huy hiệu giảm giá nếu là Giờ Vàng và chưa bị người khác đặt */}
                                            {isSlotGolden && !isBooked && (
                                                <span className="text-[10px] font-extrabold text-amber-600 mt-1 z-10 bg-amber-200/50 px-2 py-0.5 rounded-full">
                                                    ✨ -{selectedCourt.goldenDiscount}%
                                                </span>
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-lg border border-dashed border-slate-200 text-center">Vui lòng chọn ngày trước</p>
                        )}
                    </div>

                    {/* KHU VỰC TÍNH TIỀN (CHỈ HIỆN KHI ĐÃ CHỌN GIỜ) */}
                    {timeSlot && (
                        <div className="mt-6 border-t border-slate-100 pt-5 space-y-4">

                            {/* Bảng báo Giờ Vàng */}
                            {isGoldenHour && (
                                <div className="flex justify-between items-center text-sm font-bold text-amber-600 bg-amber-50 px-4 py-3 border border-amber-200 rounded-xl animate-fade-in-up">
                                    <span>✨ Giảm giá Giờ Vàng (-{selectedCourt.goldenDiscount}%)</span>
                                    <span>- {((selectedCourt.pricePerHour * selectedCourt.goldenDiscount) / 100).toLocaleString('vi-VN')} đ</span>
                                </div>
                            )}

                            {/* Bảng nhập Mã giảm giá */}
                            <div className="flex gap-2">
                                <input type="text" placeholder="Nhập mã ưu đãi..." value={promoCode} onChange={e => setPromoCode(e.target.value)} className="flex-1 px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl outline-none focus:border-blue-500 text-sm uppercase" />
                                <button type="button" onClick={handleApplyPromo} className="px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold transition-colors shadow-md">ÁP DỤNG</button>
                            </div>

                            {/* Hiển thị chiết khấu từ Mã */}
                            {discountPercent > 0 && (
                                <div className="flex justify-between items-center text-sm font-bold text-emerald-600">
                                    <span>🎟 Mã ưu đãi (-{discountPercent}%)</span>
                                    <span>Đã áp dụng</span>
                                </div>
                            )}

                            {/* TỔNG TIỀN CUỐI CÙNG */}
                            <div className="flex justify-between items-end pt-3">
                                <span className="font-bold text-slate-500 uppercase tracking-wider text-xs">Thành tiền:</span>
                                <span className="text-3xl font-extrabold text-blue-600 tracking-tight">{finalPrice.toLocaleString('vi-VN')} đ</span>
                            </div>
                        </div>
                    )}

                    {/* Nút Hủy và Submit */}
                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={onClose} className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-colors text-lg">
                            HỦY
                        </button>
                        <button type="submit" disabled={!timeSlot || !bookDate} className="w-2/3 bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-blue-500/30 text-lg">
                            XÁC NHẬN
                        </button>
                    </div>
                </form>
            </div>
        </div >
    );
}