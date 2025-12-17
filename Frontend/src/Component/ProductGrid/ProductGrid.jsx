import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "../ProductCard/ProductCard";
import * as productService from "../../service/product.service.jsx";
import * as accountService from "../../service/account.service.jsx";

export default function ProductGrid() {
    const location = useLocation();
    const { current_category_id, keyword } = location.state || {};

    const [sortType, setSortType] = useState(null);
    const [products, setProducts] = useState([]);
    const [favorites, setFavorites] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;

    const token = localStorage.getItem("token");

    /* ================= FETCH PRODUCTS ================= */
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                let res;

                if (current_category_id) {
                    res = await productService.getProductsByCategory(current_category_id);
                } else if (keyword) {
                    res = await productService.searchProducts(keyword);
                } else return;

                setProducts(res.data);
                setCurrentPage(1);
            } catch (err) {
                console.error("Fetch products error:", err);
            }
        };

        fetchProducts();
    }, [current_category_id, keyword]);

    /* ================= FETCH WATCHLIST ================= */
    useEffect(() => {
        if (!token) return;

        const fetchWatchlist = async () => {
            try {
                const res = await accountService.getWatchlist();
                if (res.success) setFavorites(res.data);
            } catch (err) {
                console.error("Fetch watchlist error:", err);
            }
        };

        fetchWatchlist();
    }, [token]);

    /* ================= SORT ================= */
    const handleSort = (type) => {
        setSortType(type);

        const sorted = [...products];
        if (type === "time") {
            sorted.sort((a, b) => b.time_left - a.time_left);
        } else if (type === "price") {
            sorted.sort((a, b) => a.current_price - b.current_price);
        }

        setProducts(sorted);
        setCurrentPage(1);
    };

    /* ================= PAGINATION ================= */
    const indexOfLast = currentPage * productsPerPage;
    const indexOfFirst = indexOfLast - productsPerPage;
    const currentProducts = products.slice(indexOfFirst, indexOfLast);

    const totalPages = Math.ceil(products.length / productsPerPage);

    const isFavorite = (product) =>
        favorites.some((f) => f.id === product.id);

    return (
        <div className="px-6 py-4">
            {/* ================= SORT BAR ================= */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => handleSort("time")}
                    className={`
                        px-4 py-2 rounded-lg text-sm font-medium
                        ${sortType === "time"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200"}
                    `}
                >
                    ⏱ Thời gian giảm dần
                </button>

                <button
                    onClick={() => handleSort("price")}
                    className={`
                        px-4 py-2 rounded-lg text-sm font-medium
                        ${sortType === "price"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200"}
                    `}
                >
                    💰 Giá tăng dần
                </button>
            </div>

            {/* ================= PRODUCT GRID ================= */}
            <div
                className="
                    grid
                    grid-cols-2
                    sm:grid-cols-3
                    md:grid-cols-4
                    lg:grid-cols-5
                    gap-4
                "
            >
                {currentProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        data={product}
                        liked={token ? isFavorite(product) : false}
                    />
                ))}
            </div>

            {/* ================= PAGINATION ================= */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`
                                    px-3 py-1 rounded-md text-sm
                                    ${page === currentPage
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 hover:bg-gray-200"}
                                `}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
