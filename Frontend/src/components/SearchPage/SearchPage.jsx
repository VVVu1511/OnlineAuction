import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import * as productService from "../../services/product.service.jsx";
import ProductCard from "../ProductCard/ProductCard.jsx";
import Back from "../Back/Back.jsx";

import { LoadingContext } from "../../context/LoadingContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";

const PAGE_SIZE = 5;

export default function SearchPage() {
    const { keyword } = useParams();
    const decodedKeyword = decodeURIComponent(keyword);

    const { setLoading } = useContext(LoadingContext);
    const { user } = useContext(AuthContext); // chưa dùng

    const [products, setProducts] = useState([]);
    const [sort, setSort] = useState("time_desc");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    /* =========================
    LOAD SEARCH (SERVER SIDE)
    ========================= */
    useEffect(() => {

        const load = async () => {
            try {
                setLoading(true);

                console.log(decodedKeyword);

                const res = await productService.searchProducts(
                    decodedKeyword,
                    {
                        page,
                        pageSize: PAGE_SIZE,
                        sort
                    }
                );

                console.log(res);

                setProducts(res.data || []);
                setTotalPages(res.pagination.totalPages || 1);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        load();

    }, [decodedKeyword, page, sort, setLoading]);

    return (
        <div className="px-6">
            <Back />

            <h1 className="mt-5 text-2xl font-semibold mb-4">
                Kết quả tìm kiếm: “{decodedKeyword}”
            </h1>

            {/* ===== SORT ===== */}
            <div className="flex gap-3 mb-6">
                <Select value={sort} onChange={(v) => {
                    setSort(v);
                    setPage(1); // đổi sort → về page 1
                }} />
            </div>

            {/* ===== CONTENT ===== */}
            {products.length === 0 ? (
                <p>Không tìm thấy sản phẩm</p>
            ) : (
                <div className="grid grid-cols-5 gap-4">
                    {products.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            )}

            {/* ===== PAGINATION ===== */}
            {totalPages >= 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`px-3 py-1 rounded border
                                ${
                                    page === i + 1
                                        ? "bg-blue-600 text-white"
                                        : "hover:bg-gray-100"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/* =========================
SORT SELECT
========================= */
function Select({ value, onChange }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border px-3 py-2 rounded"
        >
            <option value="time_desc">⏳ Kết thúc muộn → sớm</option>
            <option value="time_asc">⏳ Kết thúc sớm → muộn</option>
            <option value="price_asc">💰 Giá tăng dần</option>
        </select>
    );
}
