import { useEffect, useState } from "react";
import * as categoryService from "../../service/category.service.jsx"

export default function CategoryManagement({ token }) {
    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await categoryService.getAllCategories();
                setCategories(res.data || []);
            } catch (err) {
                console.error("Load categories error:", err);
                alert(err.response?.data?.message || "Không tải được category");
            }
        };

        if (token) loadCategories();
    }, [token]);



    // DELETE
    const handleDelete = async (id) => {
        try {
            const res = await categoryService.deleteCategory(id);

            if (!res.success) {
                alert("Cannot delete category (it may have products)");
                return;
            }

            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error("Delete error:", err);
            alert(err.response?.data?.message || "Xóa category thất bại");
        }
    };


    // ADD CATEGORY
    const handleAdd = async () => {
        if (!newCat.trim()) {
            alert("Category name cannot be empty");
            return;
        }

        try {
            const res = await categoryService.addCategory(newCat);

            if (!res.success) {
                alert(res.message || "Failed to add category");
                return;
            }

            setCategories(prev => [...prev, res.category]);
            setNewCat("");
        } catch (err) {
            console.error("Add error:", err);
            alert(err.response?.data?.message || "Thêm category thất bại");
        }
    };



    // UPDATE CATEGORY
    const handleUpdate = async (id) => {
        try {
            const res = await categoryService.updateCategory(id, editingText);

            if (!res.message?.includes("successfully")) {
                alert("Update failed");
                return;
            }

            setCategories(prev =>
                prev.map(c =>
                    c.id === id ? { ...c, description: editingText } : c
                )
            );

            setEditingId(null);
            setEditingText("");
        } catch (err) {
            console.error("Update error:", err);
            alert(err.response?.data?.message || "Cập nhật category thất bại");
        }
    };



    return (
        <div>
            <h3>Category Management</h3>

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {categories.map(c => (
                        <tr key={c.id}>
                            <td>
                                {editingId === c.id ? (
                                    <input
                                        type="text"
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                    />
                                ) : (
                                    c.description
                                )}
                            </td>

                            <td>
                                {editingId === c.id ? (
                                    <>
                                        <button onClick={() => handleUpdate(c.id)}>
                                            Save
                                        </button>
                                        <button onClick={() => {
                                            setEditingId(null);
                                            setEditingText("");
                                        }}>
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                setEditingId(c.id);
                                                setEditingText(c.description);
                                            }}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(c.id)}
                                        >
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

            <h4>Add New Category</h4>
            <input
                type="text"
                value={newCat}
                placeholder="Category name"
                onChange={(e) => setNewCat(e.target.value)}
            />
            <button onClick={handleAdd}>Add</button>
        </div>
    );
}
