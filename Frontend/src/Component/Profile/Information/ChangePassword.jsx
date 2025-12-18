import { useState } from "react";



export default function ChangePassword() {
    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");

    const handleChange = async () => {
        const res = await accountService.changePassword({
            old_password: oldPass,
            new_password: newPass,
        }, JSON.parse(localStorage.getItem("user")).id);

        if (res.success) alert("Đổi mật khẩu thành công");
        else alert(res.message);
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow mt-6">
            <h2 className="font-semibold mb-4">Đổi mật khẩu</h2>

            <input
                type="password"
                placeholder="Mật khẩu cũ"
                onChange={(e) => setOldPass(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full mb-3"
            />

            <input
                type="password"
                placeholder="Mật khẩu mới"
                onChange={(e) => setNewPass(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full mb-3"
            />

            <button
                onClick={handleChange}
                className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
                Đổi mật khẩu
            </button>
        </div>
    );
}
