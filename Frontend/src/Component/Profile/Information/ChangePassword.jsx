import { useContext, useState } from "react";
import * as accountService from "../../../service/account.service.jsx";
import {LoadingContext} from "../../../context/LoadingContext.jsx";
import { Eye, EyeOff } from "lucide-react";

export default function ChangePassword() {
    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const {setLoading} = useContext(LoadingContext);
    const [oldPassIncorrect, setOldPassIncorrect] = useState(false);
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);


    const handleChange = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    try {
        setLoading(true);

        console.log("Old Password:", oldPass);
        console.log("New Password:", newPass);

        const res = await accountService.changePassword(
            {
                old_password: oldPass,
                new_password: newPass,
            },
            user.id
        );

        // backend thường trả { success, message }
        if (res?.success) {
            alert("Đổi mật khẩu thành công");
        } else {
            alert(res?.message || "Đổi mật khẩu thất bại");
        }

    } catch (err) {
        setOldPassIncorrect(true);

        // Axios error
        // alert(
        //     err.response?.data?.message ||
        //     err.message ||
        //     "Lỗi server"
        // );

    } finally {
        setLoading(false); // 👈 QUAN TRỌNG NHẤT
    }

    };


    return (
        <div className="bg-white rounded-xl p-6 shadow mt-6">
            <h2 className="font-semibold mb-4">Đổi mật khẩu</h2>

            <div className="relative mb-3">
                <input
                    type={showOldPass ? "text" : "password"}
                    placeholder="Mật khẩu cũ"
                    value={oldPass}
                    onChange={(e) => setOldPass(e.target.value)}
                    onFocus={() => setOldPassIncorrect(false)}
                    className="border rounded-lg px-3 py-2 w-full pr-10"
                />

                <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                    {showOldPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            <div className="relative mb-3">
                <input
                    type={showNewPass ? "text" : "password"}
                    placeholder="Mật khẩu mới"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    onFocus={() => setOldPassIncorrect(false)}
                    className="border rounded-lg px-3 py-2 w-full pr-10"
                />

                <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                    {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {/* Old Pass Incorrect */}
            {oldPassIncorrect && (
                <p className="text-red-500 text-sm mb-3">
                    Mật khẩu cũ không đúng
                </p>
            )}

            <button
                onClick={handleChange}
                className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
                Đổi mật khẩu
            </button>
        </div>
    );
}
