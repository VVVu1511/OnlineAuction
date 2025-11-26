import { useState, useEffect } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import { useLocation } from 'react-router-dom';

function ProductGrid() {
    const location = useLocation();
    const { category_id } = location.state || {};

    const [sortType, setSortType] = useState(null);
    const [products, setProducts] = useState([]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 5; // 3 rows * 5 columns

    useEffect(() => {
        if (!category_id) return;
        fetch(`http://localhost:3000/product/getByCat/${category_id}`)
            .then(res => res.json())
            .then(data => {
                setProducts(data.data);
                setCurrentPage(1); // reset page when category changes
            });
    }, [category_id]);

    // Sort products
    const handleSort = (type) => {
        setSortType(type);

        let sortedProducts = [...products];

        if (type === 'time') {
            sortedProducts.sort((a, b) => b.time_left - a.time_left);
        } else if (type === 'price') {
            sortedProducts.sort((a, b) => a.price - b.price);
        }

        setProducts(sortedProducts);
        setCurrentPage(1); // reset page after sorting
    };

    // --- Pagination logic ---
    const indexOfLast = currentPage * productsPerPage;
    const indexOfFirst = indexOfLast - productsPerPage;
    const currentProducts = products.slice(indexOfFirst, indexOfLast);

    // Split 5 per row
    const rows = [];
    for (let i = 0; i < currentProducts.length; i += 5) {
        rows.push(currentProducts.slice(i, i + 5));
    }

    const totalPages = Math.ceil(products.length / productsPerPage);

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
                                <ProductCard data={product} />
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-center mt-4 gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
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
