import { useState, useEffect } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import { useLocation } from 'react-router-dom';
import * as productService from "../../service/product.service.jsx"
import * as accountService from "../../service/account.service.jsx"

function ProductGrid() {
    const location = useLocation();
    const { current_category_id, keyword } = location.state || {};

    const [sortType, setSortType] = useState(null);
    const [products, setProducts] = useState([]);
    const [favorites, setFavorites] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 5;

    const token = localStorage.getItem("token"); // <-- lấy token trực tiếp

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                let data;

                if (current_category_id) {
                    data = await productService.getProductsByCategory(current_category_id);
                } else if (keyword) {
                    data = await productService.searchProducts(keyword);
                } else {
                    return;
                }

                setProducts(data.data);
                setCurrentPage(1);
            } catch (err) {
                console.error("Fetch products error:", err);
            }
        };

        fetchProducts();
    }, [current_category_id, keyword]);

    // Fetch favorites if token exists
    useEffect(() => {
        if (!token) return;

        const fetchWatchlist = async () => {
            try {
                const data = await accountService.getWatchlist();
                if (data.success && data.data) {
                    setFavorites(data.data);
                }
            } catch (err) {
                console.error("Error fetching watchlist:", err);
            }
        };

        fetchWatchlist();
    }, [token]);

    const handleSort = (type) => {
        setSortType(type);

        let sorted = [...products];
        if (type === 'time') {
            sorted.sort((a, b) => b.time_left - a.time_left);
        } else if (type === 'price') {
            sorted.sort((a, b) => a.price - b.price);
        }

        setProducts(sorted);
        setCurrentPage(1);
    };

    const indexOfLast = currentPage * productsPerPage;
    const indexOfFirst = indexOfLast - productsPerPage;
    const currentProducts = products.slice(indexOfFirst, indexOfLast);

    const rows = [];
    for (let i = 0; i < currentProducts.length; i += 5) {
        rows.push(currentProducts.slice(i, i + 5));
    }

    const totalPages = Math.ceil(products.length / productsPerPage);

    const isFavorite = (product) => favorites.some(f => f.id === product.id);

    return (
        <div>
            {/* Sorting buttons */}
            <div className="d-flex mb-3 gap-2 p-5">
                <button 
                    className={`btn btn-primary ${sortType === 'time' ? 'active' : ''}`}
                    onClick={() => handleSort('time')}
                >
                    Thời gian giảm dần
                </button>

                <button 
                    className={`btn btn-primary ${sortType === 'price' ? 'active' : ''}`}
                    onClick={() => handleSort('price')}
                >
                    Giá tăng dần
                </button>
            </div>

            {/* Product Grid */}
            <div className="container">
                {rows.map((row, rowIndex) => (
                    <div className="row mb-3" key={rowIndex}>
                        {row.map((product, index) => (
                            <div className="col-2" key={index}>
                                <ProductCard 
                                    data={product} 
                                    liked={token ? isFavorite(product) : false} 
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-center mt-4 gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                    <button
                        key={num}
                        className={`btn btn-outline-primary ${num === currentPage ? 'active' : ''}`}
                        onClick={() => setCurrentPage(num)}
                    >
                        {num}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default ProductGrid;
