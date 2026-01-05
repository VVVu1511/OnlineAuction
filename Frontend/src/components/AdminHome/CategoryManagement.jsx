import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { LoadingContext } from "../../context/LoadingContext";
import * as categoryService from "../../services/category.service";
import * as productService from "../../services/product.service";

export default function CategoryManagement() {
    const { user } = useContext(AuthContext);
    const { setLoading } = useContext(LoadingContext);

    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");

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

    const handleAddCategory = async () => {
        if (!newCat.trim()) return alert("Tên category không được để trống");

        try {
            setLoading(true);
            const res = await categoryService.addCategory(newCat.trim());
            setCategories(prev => [...prev, res.data]);
            setNewCat("");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCategory = async (id) => {
        if (!editingText.trim()) return;

        try {
            setLoading(true);
            
            await categoryService.updateCategory(id, editingText.trim());
            setCategories(prev =>
                prev.map(c =>
                    c.id === id ? { ...c, description: editingText } : c
                )
            );
            setEditingId(null);

        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Xóa category này?")) return;

        try {
            setLoading(true);
            const products = await productService.getProductsByCategory(id);

            if (products.data.length > 0) {
                alert("Không thể xóa danh mục đã có sản phẩm");
                return;
            }

            await categoryService.deleteCategory(id);
            setCategories(prev => prev.filter(c => c.id !== id));
        } finally {
            setLoading(false);
        }
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
