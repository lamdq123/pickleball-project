interface CourtFilterProps {
    priceFilter: string;
    setPriceFilter: (filter: string) => void;
}

export default function CourtFilter({ priceFilter, setPriceFilter }: CourtFilterProps) {
    return (
        <div className="flex justify-end mb-8">
            {/* Ô Dropdown Lọc giá */}
            <div className="w-full md:w-56">
                <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium cursor-pointer"
                >
                    <option value="all">Tất cả danh mục sân</option>
                    <option value="under100">Sân thường (Dưới 100k/giờ)</option>
                    <option value="vip">Sân VIP (Từ 100k/giờ)</option>
                </select>
            </div>
        </div>
    );
}