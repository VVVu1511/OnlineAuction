import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { LoadingContext } from "../../context/LoadingContext";
import * as productService from "../../services/product.service";
import ProductCard from "../ProductCard/ProductCard.jsx"

export default function ProductManagement() {
    const { user } = useContext(AuthContext);
    const { setLoading } = useContext(LoadingContext);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        if (!user) return;

        const loadProducts = async () => {
            try {
                setLoading(true);
                const res = await productService.getAllProducts();
                setProducts(res.data || []);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [user]);

    const removeProduct = async (id) => {
        if (!window.confirm("Gỡ bỏ sản phẩm này?")) return;

        try {
            setLoading(true);
            await productService.removeProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
        } finally {
            setLoading(false);
        }
    };

    return (
        <section>
            <h2 className="text-2xl font-bold mb-6">Quản lý Sản phẩm</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {products.map(p => (
                    <div
                        key={p.id}
                        className="relative bg-white border rounded-lg shadow-sm hover:shadow-md transition"
                    >
                        <ProductCard product={p} />

                        {/* Footer */}
                        <div className="border-t px-3 py-3">
                            <button
                                onClick={() => removeProduct(p.id)}
                                className="
                                    w-full
                                    text-red-600
                                    text-sm
                                    font-semibold
                                    text-center
                                    py-2
                                    rounded-md
                                    transition
                                    hover:bg-red-50
                                    hover:text-red-700
                                    active:scale-95
                                "
                            >
                                Gỡ bỏ
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
