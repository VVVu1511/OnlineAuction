import { useEffect, useState } from "react";

export default function UserManagement({ token }) {
    const [users, setUsers] = useState([]);

    // GET ALL USERS
    useEffect(() => {
        fetch("http://localhost:3000/account/all", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => setUsers(data.data))
            .catch(err => console.error("Fetch users error:", err));
    }, [token]);


    // DELETE USER
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            const res = await fetch(`http://localhost:3000/account/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ id })
            });

            const data = await res.json();

            if (!data.success) {
                alert("Cannot delete user");
                return;
            }

            // update UI
            setUsers(prev => prev.filter(u => u.id !== id));

        } catch (err) {
            console.error("Delete user error:", err);
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
