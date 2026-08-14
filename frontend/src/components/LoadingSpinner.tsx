export default function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center py-20 w-full h-full min-h-75">
            {/* Vòng tròn xoay (Spin) màu xanh */}
            <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4 shadow-sm"></div>
            {/* Dòng chữ nhấp nháy (Pulse) */}
            <p className="text-slate-500 font-medium animate-pulse tracking-wide">Đang tải dữ liệu...</p>
        </div>
    );
}