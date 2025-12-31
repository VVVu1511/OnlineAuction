import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { LoadingContext } from "../../context/LoadingContext";
import * as accountService from "../../services/account.service";

export default function UserManagement() {
    const { user } = useContext(AuthContext);
    const { setLoading } = useContext(LoadingContext);

    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await accountService.getAllUsers();
            setUsers(res.data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
            if (user) loadUsers();
        }, [user]);

        const handleDelete = async (id) => {
        if (!confirm("Bạn có chắc muốn xóa user này?")) return;

        try {
            setLoading(true);
            await accountService.deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } finally {
            setLoading(false);
        }
    };


    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Quản lý Người dùng</h2>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    + Thêm user
                </button>
            </div>

            {users.map(u => (
                <div
                    key={u.id}
                    className="flex justify-between items-center mb-2 border-b pb-1"
                >
                    <span
                        onClick={() => {
                            setEditingUser(u);
                            setShowEditModal(true);
                        }}
                        className="cursor-pointer hover:underline"
                    >
                        {u.email} ({u.role})
                    </span>

                    <button
                        onClick={() => handleDelete(u.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-semibold"
                    >
                        Xóa
                    </button>
                </div>
            ))}

            {showAddModal && (
                <AddUserModal
                    onClose={() => setShowAddModal(false)}
                    onAdded={() => loadUsers()}
                />
            )}

            {showEditModal && editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setShowEditModal(false)}
                    onUpdated={() => loadUsers()}
                />
            )}
        </section>
    );
}

function AddUserModal({ onClose, onAdded }) {
    const { setLoading } = useContext(LoadingContext);

    const [formUser, setFormUser] = useState({
        email: "",
        password: "",
        name: "",
        role: "BIDDER",
        address: "",
    });


    const submit = async () => {
        try {
            setLoading(true);
            
            const newUser =  await accountService.addUser(formUser);

            onAdded(newUser);
            onClose();
        } 
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-96 space-y-3">
                <h3 className="font-bold text-lg">Thêm User</h3>

                <input
                    placeholder="Email"
                    value={formUser.email}
                    onChange={e => setFormUser({ ...formUser, email: e.target.value })}
                    className="w-full border px-3 py-2"
                />

                <input
                    placeholder="Name"
                    value={formUser.name}
                    onChange={e => setFormUser({ ...formUser, name: e.target.value })}
                    className="w-full border px-3 py-2"
                />

                <select
                    value={formUser.role}
                    onChange={e => setFormUser({ ...formUser, role: e.target.value })}
                    className="w-full border px-3 py-2"
                >
                    <option value="BIDDER">Bidder</option>
                    <option value="SELLER">Seller</option>
                </select>

                <input
                    placeholder="Address"
                    value={formUser.address}
                    onChange={e => setFormUser({ ...formUser, address: e.target.value })}
                    className="w-full border px-3 py-2"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={formUser.password}
                    onChange={e => setFormUser({ ...formUser, password: e.target.value })}
                    className="w-full border px-3 py-2"
                />


                <div className="flex justify-end gap-2">
                    <button onClick={onClose}>Hủy</button>
                    <button onClick={submit} className="bg-green-600 text-white px-3 py-2 rounded">
                        Thêm
                    </button>
                </div>
            </div>
        </div>
    );
}

function EditUserModal({ user, onClose, onUpdated }) {
    const { setLoading } = useContext(LoadingContext);

    const [formUser, setFormUser] = useState({
        name: user.full_name || "",
        role: user.role === "seller" ? "SELLER" : "BIDDER",
        address: user.address || "",
    });


    const submit = async () => {
        try {
            setLoading(true);
            
            await accountService.updateUser(user.id, {
                name: formUser.name,
                role: formUser.role === "SELLER" ? 2 : 3,
                address: formUser.address,
            });

            onUpdated({
                ...user,
                ...formUser,
                role: formUser.role === "SELLER" ? 2 : 3,
            });

            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
            <div className="bg-white p-6 rounded w-96 space-y-3">
                <h3 className="font-bold text-lg">Cập nhật User</h3>

                <input value={user.email} disabled className="w-full border px-3 py-2 bg-gray-100" />

                <input
                    value={formUser.name}
                    onChange={e => setFormUser({ ...formUser, name: e.target.value })}
                    placeholder="Name"
                    className="w-full border px-3 py-2"
                />

                <select
                    value={formUser.role}
                    onChange={e => setFormUser({ ...formUser, role: e.target.value })}
                    className="w-full border px-3 py-2"
                >
                    <option value="BIDDER">Bidder</option>
                    <option value="SELLER">Seller</option>
                </select>

                <input
                    value={formUser.address}
                    onChange={e => setFormUser({ ...formUser, address: e.target.value })}
                    placeholder="Address"
                    className="w-full border px-3 py-2"
                />

                <div className="mt-3 flex justify-end gap-2">
                    <button onClick={onClose}>Hủy</button>
                    <button onClick={submit} className="bg-blue-600 text-white px-3 py-2 rounded">
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
}
