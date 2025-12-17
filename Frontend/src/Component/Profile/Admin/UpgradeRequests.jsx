import { useEffect, useState } from "react";
import * as accountService from "../../../service/account.service.jsx";

export default function UpgradeRequests({ token }) {
    const [requests, setRequests] = useState([]);

    const loadData = async () => {
        try {
            const res = await accountService.getAllAccounts();
            setRequests(res.data || []);
        } catch (err) {
            console.error("Load accounts error:", err);
            alert(err.response?.data?.message || "Không tải được danh sách account");
        }
    };

    useEffect(() => {
        if (token) loadData();
    }, [token]);

    const handleAction = async (id, action) => {
        try {
            await accountService.handleAccountAction(id, action);
            loadData();
        } catch (err) {
            console.error("Account action error:", err);
            alert(err.response?.data?.message || "Thao tác thất bại");
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">
                Upgrade Requests
            </h3>

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
