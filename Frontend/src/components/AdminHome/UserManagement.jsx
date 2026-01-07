import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { LoadingContext } from "../../context/LoadingContext";
import * as accountService from "../../services/account.service";
import { useConfirmModal } from "../../context/ConfirmModalContext";
import { useResultModal } from "../../context/ResultModalContext";

export default function UserManagement() {
    const { user } = useContext(AuthContext);
    const { setLoading } = useContext(LoadingContext);

    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const { showConfirm } = useConfirmModal();
    const { showResult } = useResultModal();

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await accountService.getAllUsers();
            setUsers(res.data || []);
            setRequests(res.data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
            if (user) loadUsers();
        }, [user]);

    const handleDelete = (id) => {
        showConfirm({
            title: "Xác nhận xóa",
            message: "Bạn có chắc chắn muốn xóa user này không?",
            onConfirm: async () => {
                try {
                    setLoading(true);

                    await accountService.deleteUser(id);
                    setUsers(prev => prev.filter(u => u.id !== id));

                    showResult({
                        success: true,
                        message: "Xóa user thành công"
                    });
                } catch (err) {
                    console.error("Delete user error:", err);

                    showResult({
                        success: false,
                        message:
                            err.response?.data?.message ||
                            "Xóa user thất bại"
                    });
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleResetPassword = (email) => {
        showConfirm({
            title: "Xác nhận reset mật khẩu",
            message: "Reset mật khẩu và gửi email cho user này?",
            onConfirm: async () => {
                try {
                    setLoading(true);

                    await accountService.resetPassword(email, "123456");

                    showResult({
                        success: true,
                        message: "Đã reset mật khẩu và gửi email cho người dùng"
                    });
                } catch (err) {
                    console.error("Reset password error:", err);

                    showResult({
                        success: false,
                        message:
                            err.response?.data?.message ||
                            "Reset mật khẩu thất bại"
                    });
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    return (
        <section>
            <h2>Quản Lý Người Dùng</h2>
            
            <div className="mt-3 overflow-x-auto bg-white rounded-lg shadow">
                
                <table className="min-w-full border border-gray-200 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 border text-left">Email</th>
                            <th className="px-4 py-2 border text-left">Role</th>
                            <th className="px-4 py-2 border text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.length === 0 && (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="text-center py-4 text-gray-500"
                                >
                                    Không có người dùng
                                </td>
                            </tr>
                        )}

                        {users.map((u) => (
                            <tr
                                key={u.id}
                                className="hover:bg-gray-50 transition"
                            >
                                <td className="px-4 py-2 border">
                                    {u.email}
                                </td>

                                <td className="px-4 py-2 border capitalize">
                                    {u.role}
                                </td>

                                <td className="px-4 py-2 border">
                                    <div className="flex justify-center gap-3">
                                        <button
                                            onClick={() => handleResetPassword(u.email)}
                                            className="px-3 py-1 rounded text-blue-600 hover:bg-blue-50 hover:text-blue-800 transition"
                                        >
                                            Reset mật khẩu
                                        </button>

                                        <button
                                            onClick={() => handleDelete(u.id)}
                                            className="px-3 py-1 rounded text-red-600 hover:bg-red-50 hover:text-red-800 transition"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            <UpgradeRequests user={user} />
        </section>
    );
}

function UpgradeRequests({ user }) {
    const [requests, setRequests] = useState([]);
    const { showConfirm } = useConfirmModal();
    const { showResult } = useResultModal();

    const loadData = async () => {
        try {
            const res = await accountService.getAllUsers();
            setRequests(res.data || []);
            
        } catch (err) {
            console.error("Load accounts error:", err);
            alert(err.response?.data?.message || "Không tải được danh sách account");
        }
    };

    useEffect(() => {
        if (user) loadData();
    
    }, [user]);

    const handleAction = (id, action) => {
        const actionTextMap = {
            approve: "duyệt",
            deny: "từ chối"
        };

        showConfirm({
            title: "Xác nhận thao tác",
            message: `Bạn có chắc chắn muốn ${actionTextMap[action]} tài khoản này không?`,
            onConfirm: async () => {
                try {
                    await accountService.handleAccountAction(id, action);

                    loadData();

                    showResult({
                        success: true,
                        message: `Đã ${actionTextMap[action]} tài khoản thành công`
                    });
                } catch (err) {
                    console.error("Account action error:", err);

                    showResult({
                        success: false,
                        message:
                            err.response?.data?.message ||
                            "Thao tác thất bại"
                    });
                }
            }
        });
    };

    return (
        <div className="bg-white mt-5">
            <h2 className="text-xl font-semibold mb-4">
                Upgrade Requests
            </h2>

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 border text-left">Username</th>
                            <th className="px-4 py-2 border text-left">Email</th>
                            <th className="px-4 py-2 border text-center">Request Sell</th>
                            <th className="px-4 py-2 border text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {requests
                            .filter(r => r.request_sell === true)
                            .map(r => (
                                <tr
                                    key={r.id}
                                    className="hover:bg-gray-50 transition"
                                >
                                    <td className="px-4 py-2 border">
                                        {r.full_name}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        {r.email}
                                    </td>
                                    <td className="px-4 py-2 border text-center font-semibold text-orange-600">
                                        YES
                                    </td>
                                    <td className="px-4 py-2 border">
                                        <div className="flex justify-center gap-3">
                                            <button
                                                onClick={() => handleAction(r.id, "approve")}
                                                className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600 transition"
                                                title="Approve"
                                            >
                                                ✔
                                            </button>

                                            <button
                                                onClick={() => handleAction(r.id, "deny")}
                                                className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
                                                title="Deny"
                                            >
                                                ✖
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                        {requests.filter(r => r.request_sell).length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-center py-4 text-gray-500"
                                >
                                    Không có yêu cầu nâng cấp
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
