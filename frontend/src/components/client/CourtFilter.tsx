interface CourtFilterProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    priceFilter: string;
    setPriceFilter: (filter: string) => void;
}

export default function CourtFilter({ searchTerm, setSearchTerm, priceFilter, setPriceFilter }: CourtFilterProps) {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 mb-8">
            {/* Ô Tìm kiếm */}
            <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Tìm tên sân hoặc khu vực..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium"
                />
            </div>

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