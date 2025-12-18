import { useEffect, useState } from "react";
import * as accountService from "../../../service/account.service.jsx";

export default function UserManagement({ user }) {
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

        if (user) loadUsers();
    }, [user]);

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
        <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold mb-4">User Management</h3>

            {users.length === 0 ? (
                <p className="text-gray-500">Không có user nào</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left px-4 py-2 border-b">Email</th>
                                <th className="text-center px-4 py-2 border-b w-40">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map(u => (
                                <tr
                                    key={u.id}
                                    className="hover:bg-gray-50 transition"
                                >
                                    <td className="px-4 py-2 border-b">
                                        {u.email}
                                    </td>

                                    <td className="px-4 py-2 border-b">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                className="px-3 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
