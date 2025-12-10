import { useEffect, useState } from "react";

export default function CategoryManagement({ token }) {
    const [categories, setCategories] = useState([]);
    const [newCat, setNewCat] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");

    // Load categories
    useEffect(() => {
        fetch("http://localhost:3000/category/all", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setCategories(data.data));
    }, [token]);


    // DELETE
    const handleDelete = async (id) => {
        try {
            const res = await fetch("http://localhost:3000/category", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ id })
            });

            const data = await res.json();

            if (!data.success) {
                alert("Cannot delete category (it may have products)");
                return;
            }

            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error("Delete error:", err);
        }
    };


    // ADD CATEGORY
    const handleAdd = async () => {
        if (!newCat.trim()) {
            alert("Category name cannot be empty");
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/category", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ description: newCat })
            });

            const data = await res.json();

            if (!data.success) {
                alert(data.message || "Failed to add category");
                return;
            }

            setCategories(prev => [...prev, data.category]);
            setNewCat("");
        } catch (err) {
            console.error("Add error:", err);
        }
    };


    // UPDATE CATEGORY
    const handleUpdate = async (id) => {
        try {
            const res = await fetch("http://localhost:3000/category", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    id,
                    description: editingText
                })
            });

            const data = await res.json();

            if (!data.message.includes("successfully")) {
                alert("Update failed");
                return;
            }

            // Update UI
            setCategories(prev =>
                prev.map(c =>
                    c.id === id ? { ...c, description: editingText } : c
                )
            );

            setEditingId(null);
            setEditingText("");

        } catch (err) {
            console.error("Update error:", err);
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
