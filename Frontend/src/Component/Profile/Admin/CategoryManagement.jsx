import { useEffect, useState } from "react";
import * as categoryService from "../../../service/category.service.jsx";

export default function CategoryManagement({ user }) {
    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");

    const [loading, setLoading] = useState(false);

    // LOAD
    useEffect(() => {
        if (!user) return;

        const loadCategories = async () => {
            try {
                setLoading(true);
                const res = await categoryService.getAllCategories();
                setCategories(res.data || []);
            } catch (err) {
                alert(err.response?.data?.message || "Không tải được category");
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, [user]);

    // ADD
    const handleAdd = async () => {
        if (!newCat.trim()) {
            alert("Tên category không được để trống");
            return;
        }

        try {
            const res = await categoryService.addCategory(newCat.trim());
            if (!res.success) throw new Error(res.message);

            setCategories(prev => [...prev, res.category]);
            setNewCat("");
        } catch (err) {
            alert(err.message || "Thêm category thất bại");
        }
    };

    // UPDATE
    const handleUpdate = async (id) => {
        if (!editingText.trim()) {
            alert("Tên category không hợp lệ");
            return;
        }

        try {
            const res = await categoryService.updateCategory(id, editingText.trim());
            if (!res.success) throw new Error(res.message);

            setCategories(prev =>
                prev.map(c =>
                    c.id === id ? { ...c, description: editingText.trim() } : c
                )
            );

            setEditingId(null);
            setEditingText("");
        } catch (err) {
            alert(err.message || "Cập nhật thất bại");
        }
    };

    // DELETE
    const handleDelete = async (id) => {
        if (!window.confirm("Xóa category này?")) return;

        try {
            const res = await categoryService.deleteCategory(id);
            if (!res.success) throw new Error(res.message);

            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            alert(err.message || "Không thể xóa category");
        }
    };

    return (
        <div className="border p-4 rounded">
            <h3 className="mb-3">Category Management</h3>

            {loading && <p>Đang tải...</p>}

            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th width="200">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map(c => (
                        <tr key={c.id}>
                            <td>
                                {editingId === c.id ? (
                                    <input
                                        className="form-control"
                                        value={editingText}
                                        onChange={e => setEditingText(e.target.value)}
                                    />
                                ) : (
                                    c.description
                                )}
                            </td>
                            <td>
                                {editingId === c.id ? (
                                    <>
                                        <button className="btn btn-success btn-sm me-2"
                                            onClick={() => handleUpdate(c.id)}>
                                            Save
                                        </button>
                                        <button className="btn btn-secondary btn-sm"
                                            onClick={() => {
                                                setEditingId(null);
                                                setEditingText("");
                                            }}>
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn btn-warning btn-sm me-2"
                                            onClick={() => {
                                                setEditingId(c.id);
                                                setEditingText(c.description);
                                            }}>
                                            Edit
                                        </button>
                                        <button className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(c.id)}>
                                            Delete
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <hr />

            <h5>Thêm Category mới</h5>
            <div className="d-flex gap-2">
                <input
                    className="form-control"
                    value={newCat}
                    placeholder="Tên category"
                    onChange={e => setNewCat(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleAdd}>
                    Add
                </button>
            </div>
        </div>
    );
}
