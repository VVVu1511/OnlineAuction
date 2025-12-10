import { useEffect, useState } from "react";

export default function UpgradeRequests({ token }) {
    const [requests, setRequests] = useState([]);

    // Load all users
    const loadData = () => {
        fetch("http://localhost:3000/account/all", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setRequests(data.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAction = async (id, action) => {
        await fetch(`http://localhost:3000/account/${action}/${id}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
        });

        loadData(); // reload UI
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
