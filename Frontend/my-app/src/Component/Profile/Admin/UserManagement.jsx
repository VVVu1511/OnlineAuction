import { useEffect, useState } from "react";

export default function UserManagement({ token }) {
    const [users, setUsers] = useState([]);

    // GET ALL USERS
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const res = await accountService.getAllUsers();
                setUsers(res.data || []);
            } catch (err) {
                console.error("Fetch users error:", err);
                alert(err.response?.data?.message || "Không tải được danh sách user");
            }
        };

        if (token) loadUsers();
    }, [token]);



    // DELETE USER
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            const res = await accountService.deleteUser(id);

            if (!res.success) {
                alert("Cannot delete user");
                return;
            }

            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            console.error("Delete user error:", err);
            alert(err.response?.data?.message || "Xóa user thất bại");
        }
    };



    return (
        <div>
            <h3>User Management</h3>

            <table>
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map(u => (
                        <tr key={u.id}>
                            <td>{u.email}</td>

                            <td>
                                <button>Edit</button>

                                <button
                                    onClick={() => handleDelete(u.id)}
                                    style={{ marginLeft: "10px" }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
