import { useEffect, useState } from "react";
import * as accountService from "../../service/account.service.jsx"

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
        loadData();
    }, []);

    const handleAction = async (id, action) => {
        try {
            await accountService.handleAccountAction(id, action);
            loadData(); // reload UI
        } catch (err) {
            console.error("Account action error:", err);
            alert(err.response?.data?.message || "Thao tác thất bại");
        }
    };


    return (
        <div>
            <h3>Upgrade Requests</h3>

            <table border="1" cellPadding="8" style={{ marginTop: 10 }}>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Request Sell</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {requests
                        .filter((r) => r.request_sell === true) // 👈 chỉ lấy user đang yêu cầu nâng cấp
                        .map((r) => (
                            <tr key={r.id}>
                                <td>{r.full_name}</td>
                                <td>{r.email}</td>
                                <td>{r.request_sell ? "YES" : "NO"}</td>

                                <td style={{ display: "flex", gap: "10px" }}>
                                    <button
                                        style={{ color: "green", fontWeight: "bold" }}
                                        onClick={() => handleAction(r.id, "approve")}
                                    >
                                        ✔
                                    </button>

                                    <button
                                        style={{ color: "red", fontWeight: "bold" }}
                                        onClick={() => handleAction(r.id, "deny")}
                                    >
                                        ✖
                                    </button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}
