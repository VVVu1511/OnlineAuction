import { useEffect, useState } from "react";
import ProductCard from "../../ProductCard/ProductCard.jsx"; // import vào
import { useNavigate } from "react-router-dom";
import * as productService from "../../service/product.service.jsx"

export default function ProductManagement({ token }) {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const res = await productService.getAllProducts();
                setProducts(res.data || []);
            } catch (err) {
                console.error("Load products error:", err);
                alert(err.response?.data?.message || "Không tải được sản phẩm");
            }
        };

        if (token) loadProducts();
    }, [token]);



    // REMOVE PRODUCT
    const removeProduct = async (id) => {
        try {
            const res = await productService.removeProduct(id);

            if (!res.success) {
                alert("Cannot remove product");
                return;
            }

            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error("Remove error:", err);
            alert(err.response?.data?.message || "Xóa sản phẩm thất bại");
        }
    };

    

    return (
        <div>
            <h3>Product Management</h3>

            <div className="d-flex flex-wrap gap-3">
                {products.map(p => (
                    <div key={p.id}>

                        <ProductCard
                            data={p}
                            liked={false}   // admin không cần watchlist
                        />

                        <button
                            className="btn btn-danger mt-1 w-100"
                            onClick={() => removeProduct(p.id)}
                        >
                            Remove
                        </button>

                    </div>
                ))}
            </div>
        </div>
    );
}
