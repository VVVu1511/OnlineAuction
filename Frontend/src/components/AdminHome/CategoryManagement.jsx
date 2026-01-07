import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { LoadingContext } from "../../context/LoadingContext";
import { useConfirmModal } from "../../context/ConfirmModalContext";
import { useResultModal } from "../../context/ResultModalContext";
import * as categoryService from "../../services/category.service";
import * as productService from "../../services/product.service";

export default function CategoryManagement() {
    const { user } = useContext(AuthContext);
    const { setLoading } = useContext(LoadingContext);
    const { showResult } = useResultModal();
    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const { showConfirm } = useConfirmModal();

    const loadCategories = async () => {
        try {
            setLoading(true);
            const res = await categoryService.getAllCategories();
            setCategories(res.data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;

        loadCategories();
    }, [user]);

    const handleAddCategory = () => {
        const name = newCat.trim();

        if (!name) {
            showResult({
                success: false,
                message: "Tên category không được để trống"
            });
            return;
        }

        showConfirm({
            title: "Thêm danh mục",
            message: `Bạn có chắc chắn muốn thêm danh mục "${name}" không?`,
            onConfirm: async () => {
                try {
                    setLoading(true);

                    const res = await categoryService.addCategory(name);

                    setCategories(prev => [...prev, res.data]);
                    setNewCat("");

                    showResult({
                        success: true,
                        message: `Đã thêm danh mục "${name}"`
                    });
                } catch (err) {
                    showResult({
                        success: false,
                        message:
                            err.response?.data?.message ||
                            "Thêm danh mục thất bại"
                    });
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleUpdateCategory = (id) => {
        const name = editingText.trim();
        if (!name) return;

        showConfirm({
            title: "Cập nhật danh mục",
            message: `Bạn có chắc chắn muốn đổi tên thành "${name}" không?`,
            onConfirm: async () => {
                try {
                    setLoading(true);

                    await categoryService.updateCategory(id, name);

                    setCategories(prev =>
                        prev.map(c =>
                            c.id === id
                                ? { ...c, description: name }
                                : c
                        )
                    );

                    setEditingId(null);

                    showResult({
                        success: true,
                        message: "Cập nhật danh mục thành công"
                    });
                } catch (err) {
                    showResult({
                        success: false,
                        message:
                            err.response?.data?.message ||
                            "Cập nhật danh mục thất bại"
                    });
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleDeleteCategory = (id) => {
        showConfirm({
            title: "Xóa danh mục",
            message: "Bạn có chắc chắn muốn xóa danh mục này không?",
            onConfirm: async () => {
                try {
                    setLoading(true);

                    const products = await productService.getProductsByCategory(id);

                    if (products.data.length > 0) {
                        showResult({
                            success: false,
                            message: "Không thể xóa danh mục đã có sản phẩm"
                        });
                        return;
                    }

                    await categoryService.deleteCategory(id);

                    setCategories(prev => prev.filter(c => c.id !== id));

                    showResult({
                        success: true,
                        message: "Xóa danh mục thành công"
                    });
                } catch (err) {
                    showResult({
                        success: false,
                        message:
                            err.response?.data?.message ||
                            "Xóa danh mục thất bại"
                    });
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const [catError, setCatError] = useState("");
    const [editError, setEditError] = useState("");

    const validateCategory = (name, currentId = null) => {
        if (!name.trim()) return "Tên danh mục không được để trống";

        const duplicated = categories.some(
            c =>
                c.description.toLowerCase() === name.trim().toLowerCase() &&
                c.id !== currentId
        );
        if (duplicated) return "Danh mục đã tồn tại";

        return "";
    };

    return (
        <section>
            <h2 className="text-2xl font-bold mb-4">Quản Lý Danh Mục</h2>

            <div className="flex gap-2 mb-3">
                <input
                    value={newCat}
                    onChange={e => {
                        setNewCat(e.target.value);
                        setCatError("");
                    }}
                    className={`border px-3 py-2 rounded w-64 ${
                        catError ? "border-red-500" : ""
                    }`}
                    placeholder="New category"
                />
                <button
                    onClick={() => {
                        const err = validateCategory(newCat);
                        if (err) {
                            setCatError(err);
                            return;
                        }
                        handleAddCategory();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded"
                >
                    Thêm
                </button>
            </div>

            {catError && (
                <p className="text-sm text-red-600 mb-3">{catError}</p>
            )}

            {categories.map(c => (
                <div key={c.id} className="flex gap-2 items-center mb-2">
                    {editingId === c.id ? (
                        <>
                            <input
                                value={editingText}
                                onChange={e => {
                                    setEditingText(e.target.value);
                                    setEditError("");
                                }}
                                className={`border px-2 py-1 rounded ${
                                    editError ? "border-red-500" : ""
                                }`}
                            />

                            <button
                                onClick={() => {
                                    const err = validateCategory(editingText, c.id);

                                    if (err) {
                                        setEditError(err);
                                        return;
                                    }

                                    handleUpdateCategory(c.id);
                                }}
                                className="text-green-600 hover:text-green-800"
                            >
                                ✔
                            </button>

                            {editError && (
                                <p className="text-xs text-red-600 ml-2">
                                    {editError}
                                </p>
                            )}
                        </>
                    ) : (
                        <>
                            <span className="min-w-[200px]">{c.description}</span>
                            <button
                                onClick={() => {
                                    setEditingId(c.id);
                                    setEditingText(c.description);
                                    setEditError("");
                                }}
                                className="text-blue-600 text-sm"
                            >
                                Sửa
                            </button>
                        </>
                    )}

                    <button
                                onClick={() => {
                                    handleDeleteCategory(c.id);
                                    loadCategories();
                                }}
                                className="text-red-600 text-sm"
                            >
                                Xóa
                            </button>
                </div>
            ))}

        </section>
    );
}
