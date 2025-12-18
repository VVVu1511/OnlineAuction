import { useNavigate } from "react-router-dom";
import { useState } from "react";
import * as accountService from "../../service/account.service.jsx";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await accountService.login(email, password);

            if (!res.success) {
                alert(res.message || "Login failed");
                return;
            }

            // ✅ store user (ONLY this)
            localStorage.setItem("user", JSON.stringify(res.data));

            // 🔔 notify Header
            window.dispatchEvent(new Event("auth-change"));

            navigate("/");
            
        } catch (err) {
            console.error("Login error:", err);
            alert("Server error during login");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <form
                onSubmit={handleLogin}
                className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg"
            >
                <h2 className="text-2xl font-bold text-center mb-6">
                    Đăng Nhập
                </h2>

                {/* Email */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        required
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border"
                    />
                </div>

                {/* Password */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        required
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border"
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                >
                    Đăng Nhập
                </button>

                <p className="text-center text-sm mt-4">
                    Chưa có tài khoản?{" "}
                    <span
                        onClick={() => navigate("/register")}
                        className="text-red-600 cursor-pointer hover:underline"
                    >
                        Đăng ký
                    </span>
                </p>
            </form>
        </div>
    );
}

export default Login;
