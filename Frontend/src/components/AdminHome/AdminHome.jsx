import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { LoadingContext } from "../../context/LoadingContext.jsx";

import * as categoryService from "../../services/category.service.jsx";
import * as productService from "../../services/product.service.jsx";
import * as accountService from "../../services/account.service.jsx";
import { useMemo } from "react";


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
            } catch {
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

            // 1️⃣ check sản phẩm
            const products = await productService.getProductsByCategory(id);

            if (products.data.length > 0) {
                alert("Không thể xóa danh mục đã có sản phẩm");
                return;
            }

            // 2️⃣ xoá category nếu không có sản phẩm
            await categoryService.deleteCategory(id);

            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            alert("Có lỗi xảy ra khi xoá danh mục");
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
                setLoading(true);
                const res = await productService.getAllProducts();
                setProducts(res.data || []);
            } catch {
                alert("Không tải được sản phẩm");
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
        } catch {
            alert("Xóa sản phẩm thất bại");
        } finally {
            setLoading(false);
        }
    };

    /* =========================
        USER MANAGEMENT
    ========================= */
    const [users, setUsers] = useState([]);
    const upgradeRequests = useMemo(() => {
        const now = Date.now();
        return users.filter(
            u =>
                u.request_sell === true &&
                new Date(u.request_expire).getTime() > now
        );
    }, [users]);

        
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [formUser, setFormUser] = useState({
        email: "",
        role: "bidder",
        password: "",
        address: ""
    });

    const openAddUser = () => {
        setEditingUser(null);
        setFormUser({
            email: "",
            role: "bidder",
            password: "",
        });
        setShowUserModal(true);
    };

    const openEditUser = (u) => {
        setEditingUser(u);
        setFormUser({
            email: u.email,
            role: u.role,
            password: "",
        });
        setShowUserModal(true);
    };

    const handleSubmitUser = async () => {
    try {
            setLoading(true);

            if (editingUser) {
                // UPDATE
                await accountService.updateUser(editingUser.id, {
                    email: formUser.email,
                    role: formUser.role,
                    ...(formUser.password && { password: formUser.password }),
                });

                setUsers(prev =>
                    prev.map(u =>
                        u.id === editingUser.id
                            ? { ...u, email: formUser.email, role: formUser.role }
                            : u
                    )
                );
            } else {
                // ADD
                const res = await accountService.addUser(formUser);
                setUsers(prev => [...prev, res.data]);
            }

            setShowUserModal(false);
        } catch {
            alert("Thao tác user thất bại");
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            setLoading(true);
            const [userRes, upgradeRes] = await Promise.all([
                accountService.getAllUsers(),

            ]);

            setUsers(userRes.data || []);

        } catch {
            alert("Không tải được user");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;

        loadUsers();
    }, [user]);

    const handleUserDelete = async (id) => {
        if (!window.confirm("Xóa user này?")) return;

        try {
            setLoading(true);
            await accountService.deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch {
            alert("Xóa user thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (id, action) => {
        try {
            setLoading(true);
            await accountService.handleAccountAction(id, action);
            await loadUsers();

        } catch {
            alert("Duyệt thất bại");
        } finally {
            setLoading(false);
        }
    };

    /* =========================
        RENDER
    ========================= */
    return (
        <div className="space-y-12">
            {/* CATEGORY */}
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

            {/* PRODUCT */}
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

            {/* USER */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">
                        Quản lý Người dùng
                    </h2>

                    <button
                        onClick={openAddUser}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        + Add User
                    </button>
                </div>

                {users.map(u => (
                    <div
                        key={u.id}
                        className="flex justify-between items-center mb-2"
                    >
                        <span
                            onClick={() => openEditUser(u)}
                            className="cursor-pointer hover:underline"
                        >
                            {u.email} ({u.role})
                        </span>

                        <button
                            onClick={() => handleUserDelete(u.id)}
                            className="text-red-600"
                        >
                            Xóa
                        </button>
                    </div>
                ))}

                {/* ===== UPGRADE REQUEST ===== */}
                <h3 className="mt-5 text-xl font-semibold mb-2">
                    Yêu cầu nâng cấp Bidder → Seller
                </h3>

                {upgradeRequests.length === 0 ? (
                    <p className="text-gray-500">Không có yêu cầu nào</p>
                ) : (
                    upgradeRequests.map(r => (
                        <div key={r.id} className="flex items-center gap-3 mb-2">
                            <span className="flex-1">{r.email}</span>
                            <button
                                onClick={() => handleUpgrade(r.id, "approve")}
                                className="px-2 py-1 bg-green-600 text-white rounded"
                            >
                                ✔
                            </button>
                            <button
                                onClick={() => handleUpgrade(r.id, "deny")}
                                className="px-2 py-1 bg-red-600 text-white rounded"
                            >
                                ✖
                            </button>
                        </div>
                    ))
                )}
            </section>
            
            {showUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded w-96 space-y-4">
                        <h3 className="text-xl font-bold">
                            {editingUser ? "Cập nhật User" : "Thêm User"}
                        </h3>

                        <input
                            value={formUser.email}
                            onChange={e =>
                                setFormUser({ ...formUser, email: e.target.value })
                            }
                            placeholder="Email"
                            className="w-full border px-3 py-2 rounded"
                        />

                        <select
                            value={formUser.role}
                            onChange={e =>
                                setFormUser({ ...formUser, role: e.target.value })
                            }
                            className="w-full border px-3 py-2 rounded"
                        >
                            <option value="3">Bidder</option>
                            <option value="2">Seller</option>
                            <option value="1">Admin</option>
                        </select>

                        <input
                            type="password"
                            value={formUser.password}
                            onChange={e =>
                                setFormUser({ ...formUser, password: e.target.value })
                            }
                            placeholder={
                                editingUser
                                    ? "Password mới (nếu đổi)"
                                    : "Password"
                            }
                            className="w-full border px-3 py-2 rounded"
                        />

                        <input
                            value={formUser.address}
                            onChange={e =>
                                setFormUser({ ...formUser, address: e.target.value })
                            }
                            placeholder="Address"
                            className="w-full border px-3 py-2 rounded"
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="px-3 py-2 border rounded"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmitUser}
                                className="px-3 py-2 bg-blue-600 text-white rounded"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
}
