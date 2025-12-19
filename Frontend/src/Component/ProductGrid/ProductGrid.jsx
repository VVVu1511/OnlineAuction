import { useState, useEffect } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../ProductCard/ProductCard";
import * as productService from "../../service/product.service.jsx";
import * as accountService from "../../service/account.service.jsx";
import {LoadingContext} from "../../context/LoadingContext.jsx";
import { useContext } from "react";

export default function ProductGrid() {
    const location = useLocation();

    const { categoryId } = useParams();

    const [sortType, setSortType] = useState(null);
    const [products, setProducts] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;
    const [searchParams] = useSearchParams();
    //get user
    const user = JSON.parse(localStorage.getItem("user"));
    const [keyword, setKeyword] = useState("");
    const { setLoading } = useContext(LoadingContext);

    /* ================= FETCH PRODUCTS ================= */
    useEffect(() => {
    const fetchProducts = async () => {
        const key = searchParams.get("keyword");
        setKeyword(key);

        try {
            let res;
            setLoading(true);

            // 🔍 Có keyword → search
            if (key) {
                res = await productService.searchProducts(key, categoryId !== "all" ? categoryId : null);
            }
            // 📂 Có category (khác all) → filter category
            else if (categoryId && categoryId !== "all") {

                res = await productService.getProductsByCategory(categoryId);
            }
            // 📦 All products
            else {
                res = await productService.getAllProducts();
            }

            setProducts(res.data || []);
            setCurrentPage(1);
        } catch (err) {
            console.error("Fetch products error:", err);
        } finally {
            setLoading(false);
        }
    };

    fetchProducts();

    }, [categoryId, searchParams]);

    /* ================= FETCH WATCHLIST ================= */
    useEffect(() => {
        if(!user) return;
        if(user.role !== 'bidder') return;

        const fetchWatchlist = async () => {
            try {
                setLoading(true);

                const res = await accountService.getWatchlist();
                if (res.success) setFavorites(res.data);
            } catch (err) {
                console.error("Fetch watchlist error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWatchlist();
    }, [user]);

    /* ================= SORT ================= */
    const handleSort = (type) => {
        setSortType(type);

        setLoading(true);

        const sorted = [...products];
        if (type === "time") {
            sorted.sort((a, b) => b.time_left - a.time_left);
        } else if (type === "price") {
            sorted.sort((a, b) => a.current_price - b.current_price);
        }

        setProducts(sorted);
        setCurrentPage(1);

        setLoading(false);
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
            {
                keyword && (
                    <h2 className="text-lg font-medium mb-4">
                        Kết quả tìm kiếm cho "{keyword}"
                    </h2>
                )
            }
            
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
                        liked={user ? isFavorite(product) : false}
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
