interface QRModalProps {
    qrUrl: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function QRModal({ qrUrl, onConfirm, onCancel }: QRModalProps) {
    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center transform transition-all scale-100">
                <h3 className="text-2xl font-bold text-blue-600 mb-2">Quét mã thanh toán</h3>
                <p className="text-slate-500 text-sm mb-6">Sử dụng App ngân hàng hoặc Momo để quét</p>

                <div className="border border-slate-200 p-3 rounded-xl inline-block mb-6 bg-slate-50 shadow-inner">
                    <img src={qrUrl} alt="QR Code" className="w-56 h-56 object-contain rounded-lg" />
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md shadow-emerald-600/30"
                    >
                        ✅ TÔI ĐÃ CHUYỂN KHOẢN
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold py-3 rounded-xl transition-colors"
                    >
                        ❌ HỦY GIAO DỊCH
                    </button>
                </div>
            </div>
        </div>
    );
}