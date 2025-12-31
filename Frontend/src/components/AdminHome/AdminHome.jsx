import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { LoadingContext } from "../../context/LoadingContext.jsx";

import * as categoryService from "../../services/category.service.jsx";
import * as productService from "../../services/product.service.jsx";
import * as accountService from "../../services/account.service.jsx";

export default function AdminHome() {
    const { user } = useContext(AuthContext);
    const { setLoading } = useContext(LoadingContext);

    /* =========================
        CATEGORY MANAGEMENT
    ========================= */
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
            } catch (err) {
                alert("Không tải được category");
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
        } catch {
            alert("Thêm category thất bại");
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
        } catch {
            alert("Cập nhật thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Xóa category này?")) return;

        try {
            setLoading(true);
            await categoryService.deleteCategory(id);
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch {
            alert("Không thể xóa category (đã có sản phẩm)");
        } finally {
            setLoading(false);
        }
    };

    /* =========================
        PRODUCT MANAGEMENT
    ========================= */
    const [products, setProducts] = useState([]);

    useEffect(() => {
        if (!user) return;

        const loadProducts = async () => {
            try {
                const res = await productService.getAllProducts();
                setProducts(res.data || []);
            } catch {
                alert("Không tải được sản phẩm");
            }
        };

        loadProducts();
    }, [user]);

    const removeProduct = async (id) => {
        if (!window.confirm("Gỡ bỏ sản phẩm này?")) return;

        try {
            await productService.removeProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch {
            alert("Xóa sản phẩm thất bại");
        }
    };

    /* =========================
        USER MANAGEMENT
    ========================= */
    const [users, setUsers] = useState([]);
    const [upgradeRequests, setUpgradeRequests] = useState([]);

    useEffect(() => {
        if (!user) return;

        const loadUsers = async () => {
            const res = await accountService.getAllUsers();
            setUsers(res.data || []);
        };

        const loadUpgradeRequests = async () => {
            const res = await accountService.getUpgradeRequests();
            setUpgradeRequests(res.data || []);
        };

        loadUsers();
        loadUpgradeRequests();
    }, [user]);

    const handleUserDelete = async (id) => {
        if (!window.confirm("Xóa user này?")) return;

        try {
            await accountService.deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch {
            alert("Xóa user thất bại");
        }
    };

    const handleUpgrade = async (id, action) => {
        try {
            await accountService.handleAccountAction(id, action);
            setUpgradeRequests(prev => prev.filter(r => r.id !== id));
        } catch {
            alert("Duyệt thất bại");
        }
    };

    /* =========================
        RENDER
    ========================= */
    return (
        <div className="space-y-12">

            {/* ===== CATEGORY ===== */}
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

            {/* ===== PRODUCT ===== */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Quản lý Sản phẩm</h2>

                {products.map(p => (
                    <div key={p.id} className="flex justify-between mb-2">
                        <span>{p.name}</span>
                        <button
                            onClick={() => removeProduct(p.id)}
                            className="text-red-600"
                        >
                            Gỡ bỏ
                        </button>
                    </div>
                ))}
            </section>

            {/* ===== USERS ===== */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Quản lý Người dùng</h2>

                {users.map(u => (
                    <div key={u.id} className="flex justify-between mb-2">
                        <span>{u.email} ({u.role})</span>
                        <button
                            onClick={() => handleUserDelete(u.id)}
                            className="text-red-600"
                        >
                            Xóa
                        </button>
                    </div>
                ))}

                <h3 className="mt-5 text-xl font-semibold mt-6 mb-2">
                    Yêu cầu nâng cấp Bidder → Seller
                </h3>

                {upgradeRequests.map(r => (
                    <div key={r.id} className="flex gap-2 mb-2">
                        <span className="flex-1">{r.email}</span>
                        <button onClick={() => handleUpgrade(r.id, "approve")}>✔</button>
                        <button onClick={() => handleUpgrade(r.id, "reject")}>✖</button>
                    </div>
                ))}
            </section>
        </div>
    );
}
