import { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import * as categoryService from "../../services/category.service.jsx";
import * as productService from "../../services/product.service.jsx";
import Back from "../Back/Back.jsx"
import ProductCard from "../ProductCard/ProductCard.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import { LoadingContext } from "../../context/LoadingContext.jsx";

const PAGE_SIZE = 5;

export default function CategoryPage() {
    const { id } = useParams();

    const [category, setCategory] = useState(null);
    const [childCategories, setChildCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(0);

    const [selectedCat, setSelectedCat] = useState(id);
    const [sortType, setSortType] = useState("endTimeDesc"); 
    const [currentPage, setCurrentPage] = useState(1);

    const { user } = useContext(AuthContext);
    const [pageLoading, setPageLoading] = useState(false);
    const {setLoading} = useContext(LoadingContext);

    /* =========================
       LOAD CATEGORY + CHILD
    ========================= */
    useEffect(() => {
        const loadCategory = async () => {
            try {
                setPageLoading(true);
                setLoading(true);

                const [catRes, childRes] = await Promise.all([
                    categoryService.getCategoryById(id),
                    categoryService.fetchChildCategory(id),
                ]);

                setCategory(catRes.data || catRes);
                setChildCategories(childRes.data || childRes);
            } catch (err) {
                console.error("Load category error:", err);
            } finally {
                setPageLoading(false);
                setLoading(false);
            }
        };

        loadCategory();
    }, [id, user]);

    /* =========================
    LOAD PRODUCTS
    ========================= */
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setPageLoading(true);
                setLoading(true);

                const res = await productService.getProductsByCategory(
                    selectedCat,
                    currentPage,
                    PAGE_SIZE,
                    sortType
                );

                setProducts(res.data);
                setTotalPages(res.totalPages);
            } catch (err) {
                console.error(err);
            } finally {
                setPageLoading(false);
                setLoading(false);
            }
        };

        loadProducts();
    }, [selectedCat, currentPage, sortType]);

    return (
        <div className="px-6">
            <Back />

            {/* ===== TITLE ===== */}
            <h1 className="mt-5 text-2xl font-semibold mb-4">
                {category?.description || "Danh mục"}
            </h1>

            {/* ===== FILTER CATEGORY ===== */}
            {childCategories.length > 0 && (
                <div className="flex gap-3 mb-4 flex-wrap">
                    <FilterButton
                        active={selectedCat === id}
                        onClick={() => setSelectedCat(id)}
                    >
                        Tất cả
                    </FilterButton>

                    {childCategories.map((c) => (
                        <FilterButton
                            key={c.id}
                            active={selectedCat === c.id}
                            onClick={() => setSelectedCat(c.id)}
                        >
                            {c.description}
                        </FilterButton>
                    ))}
                </div>
            )}

            {/* ===== SORT ===== */}
            <div className="flex gap-3 mb-6">
                <select
                    value={sortType}
                    onChange={(e) => setSortType(e.target.value)}
                    className="border rounded px-3 py-2"
                >
                    <option value="endTimeDesc">
                        ⏳ Kết thúc muộn → sớm
                    </option>
                    <option value="priceAsc">
                        💰 Giá tăng dần
                    </option>
                </select>
            </div>

            {/* ===== PRODUCT GRID ===== */}
            {pageLoading ? (
                <p>Đang tải sản phẩm...</p>
            ) : products.length === 0 ? (
                <p>Không có sản phẩm</p>
            ) : (
                <>
                    <div className="grid grid-cols-5 gap-4 mb-6">
                        {products.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>

                    {/* ===== PAGINATION ===== */}
                    <div className="flex gap-2 justify-center">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 border rounded
                                    ${
                                        currentPage === i + 1
                                            ? "bg-blue-600 text-white"
                                            : "hover:bg-gray-100"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

/* =========================
   FILTER BUTTON
========================= */
function FilterButton({ children, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded border text-sm transition
                ${
                    active
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white hover:bg-gray-100"
                }`}
        >
            {children}
        </button>
    );
}
