import { useEffect, useState } from "react";
import * as accountService from "../../../service/account.service";

export default function PersonalInformation() {
    const [user, setUser] = useState(null);
    const [editing, setEditing] = useState(false);

    const [fullName, setFullName] = useState("");
    const [address, setAddress] = useState("");

    /* ===== LOAD USER FROM LOCALSTORAGE ===== */
    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) return;

        const parsed = JSON.parse(stored);
        setUser(parsed);
        setFullName(parsed.full_name || "");
        setAddress(parsed.address || "");
    }, []);

    /* ===== UPDATE PROFILE ===== */
    const handleUpdate = async () => {
        try {
            const res = await accountService.updateProfile({
                full_name: fullName,
                address,
            }, user.id);

            if (res.success) {
                const updatedUser = {
                    ...user,
                    full_name: fullName,
                    address,
                };

                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);
                setEditing(false);
                alert("Cập nhật thành công");
            }
        } catch (err) {
            alert("Cập nhật thất bại");
        }
    };

    if (!user) return null;

    return (
        <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-4">
                Thông tin cá nhân
            </h2>

            {/* Họ tên */}
            <div className="mb-3">
                <label className="block text-sm mb-1">Họ tên</label>
                <input
                    disabled={!editing}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full"
                />
            </div>

            {/* Địa chỉ */}
            <div className="mb-3">
                <label className="block text-sm mb-1">Địa chỉ</label>
                <input
                    disabled={!editing}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full"
                />
            </div>

            {!editing ? (
                <button
                    onClick={() => setEditing(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    Chỉnh sửa
                </button>
            ) : (
                <div className="flex gap-2">
                    <button
                        onClick={handleUpdate}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg"
                    >
                        Lưu
                    </button>
                    <button
                        onClick={() => setEditing(false)}
                        className="bg-gray-400 text-white px-4 py-2 rounded-lg"
                    >
                        Hủy
                    </button>
                </div>
            )}
        </div>
    );
}
