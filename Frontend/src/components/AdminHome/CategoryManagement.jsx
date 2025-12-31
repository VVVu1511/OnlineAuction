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

    useEffect(() => {
        if (!user) return;

        const loadCategories = async () => {
            try {
                setLoading(true);
                const res = await categoryService.getAllCategories();
                setCategories(res.data || []);
            } finally {
                setLoading(false);
            }
        };

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

    return (
        <section>
            <h2 className="text-2xl font-bold mb-4">Quản lý Category</h2>

            <div className="flex gap-2 mb-4">
                <input
                    value={newCat}
                    onChange={e => setNewCat(e.target.value)}
                    className="border px-3 py-2 rounded"
                    placeholder="New category"
                />
                <button
                    onClick={handleAddCategory}
                    className="bg-blue-600 text-white px-4 rounded"
                >
                    Thêm
                </button>
            </div>

            {categories.map(c => (
                <div key={c.id} className="flex gap-2 items-center mb-2">
                    {editingId === c.id ? (
                        <>
                            <input
                                value={editingText}
                                onChange={e => setEditingText(e.target.value)}
                                className="border px-2 py-1"
                            />
                            <button onClick={() => handleUpdateCategory(c.id)}>✔</button>
                        </>
                    ) : (
                        <>
                            <span className="flex-1">{c.description}</span>
                            <button onClick={() => {
                                setEditingId(c.id);
                                setEditingText(c.description);
                            }}>✏</button>
                            <button onClick={() => handleDeleteCategory(c.id)}>🗑</button>
                        </>
                    )}
                </div>
            ))}
        </section>
    );
}
