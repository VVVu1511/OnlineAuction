import { useEffect, useState } from "react";
import ProductCard from "../../ProductCard/ProductCard.jsx";
import * as productService from "../../../service/product.service.jsx";

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
        <div className="p-4">
            <h3 className="text-xl font-semibold mb-4">
                Product Management
            </h3>

            <div className="flex flex-wrap gap-4">
                {products.map(p => (
                    <div
                        key={p.id}
                        className="w-[220px] flex flex-col"
                    >
                        <ProductCard
                            data={p}
                            liked={false}
                        />

                        <button
                            onClick={() => removeProduct(p.id)}
                            className="
                                mt-2
                                w-full
                                rounded-lg
                                bg-red-600
                                px-3
                                py-2
                                text-white
                                font-medium
                                hover:bg-red-700
                                transition
                            "
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
