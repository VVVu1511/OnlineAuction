import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { LoadingContext } from "../../context/LoadingContext";
import * as productService from "../../services/product.service";
import ProductCard from "../ProductCard/ProductCard.jsx"
import { useConfirmModal } from "../../context/ConfirmModalContext";
import { useResultModal } from "../../context/ResultModalContext";

export default function ProductManagement() {
    const { user } = useContext(AuthContext);
    const { setLoading } = useContext(LoadingContext);
    const [products, setProducts] = useState([]);
    const { showConfirm } = useConfirmModal();
    const { showResult } = useResultModal();

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

    const removeProduct = (id) => {
        showConfirm({
            title: "Gỡ bỏ sản phẩm",
            message: "Bạn có chắc chắn muốn gỡ bỏ sản phẩm này không?",
            onConfirm: async () => {
                try {
                    setLoading(true);

                    await productService.removeProduct(id);

                    setProducts(prev => prev.filter(p => p.id !== id));

                    showResult({
                        success: true,
                        message: "Gỡ bỏ sản phẩm thành công"
                    });
                } catch (err) {
                    showResult({
                        success: false,
                        message:
                            err.response?.data?.message ||
                            "Gỡ bỏ sản phẩm thất bại"
                    });
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    return (
        <section>
            <h2 className="text-2xl font-bold mb-6">Quản Lý Sản Phẩm</h2>

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
