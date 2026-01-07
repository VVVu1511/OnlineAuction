import { useContext, useEffect, useState } from "react";
import ProductCard from "../ProductCard/ProductCard.jsx";
import * as productService from "../../services/product.service.jsx";
import * as categoryService from "../../services/category.service.jsx";
import Back from "../Back/Back.jsx";
import { LoadingContext } from "../../context/LoadingContext";

export default function AdvancedSearch() {
    const [keyword, setKeyword] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [category, setCategory] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [categories, setCategories] = useState([]);
    const [results, setResults] = useState([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const { setLoading } = useContext(LoadingContext);

    useEffect(() => {
        categoryService.getAllCategories()
            .then(res => setCategories(res.data || []));
    }, []);

    const fetchSearch = async (page) => {
        try {
            setLoading(true);

            const res = await productService.advancedSearch({
                keyword,
                minPrice,
                maxPrice,
                category,
                fromDate,
                toDate,
                page,
                limit: 5
            });

            setResults(res.data || []);
            setPagination(res.pagination);
            setPage(page);

        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => fetchSearch(1);
    const changePage = (newPage) => fetchSearch(newPage);

    return (
        <div className="px-6">
            <Back />

            <h1 className="mt-5 text-2xl font-semibold mb-6">🔍 Tìm kiếm nâng cao</h1>

            {/* ===== FORM ===== */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <input
                    placeholder="Tên sản phẩm"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    className="border p-2 rounded"
                />

                <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">-- Tất cả danh mục --</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.description}</option>
                    ))}
                </select>

                <input
                    type="number"
                    placeholder="Giá từ"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    className="border p-2 rounded"
                />

                <input
                    type="number"
                    placeholder="Giá đến"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className="border p-2 rounded"
                />

                <input
                    type="date"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                    className="border p-2 rounded"
                />

                <input
                    type="date"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                    className="border p-2 rounded"
                />
            </div>

            <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-8"
            >
                Tìm kiếm
            </button>

            {/* ===== KẾT QUẢ ===== */}
            {results.length === 0 && (
                <h2 className="mt-3 text-xl font-semibold mb-4 text-gray-500">
                    Không có kết quả phù hợp
                </h2>
            )}

            <div className="mt-3 grid grid-cols-5 gap-4">
                {results.map(p => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>

            {/* ===== PAGINATION ===== */}
            {pagination && pagination.totalPages > 0 && (
                <div className="flex justify-center gap-2 mt-8">
                    <button
                        disabled={page === 1}
                        onClick={() => changePage(page - 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        ←
                    </button>

                    {Array.from({ length: pagination.totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => changePage(i + 1)}
                            className={`px-3 py-1 border rounded
                                ${page === i + 1 ? "bg-blue-600 text-white" : ""}`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        disabled={page === pagination.totalPages}
                        onClick={() => changePage(page + 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        →
                    </button>
                </div>
    )}


        </div>
    );
}