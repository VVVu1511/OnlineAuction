import { FaFacebook, FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import * as accountService from "../../service/account.service.jsx";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const data = await accountService.login(email, password);

            if (data.success && data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userEmail", email);

                const profile = await accountService.getProfile();
                localStorage.setItem("role", profile.role_description);

                navigate("/");
            } else {
                alert(data.message || "Login failed");
            }
        } catch (err) {
            console.error("Login error:", err);
            alert("Server error during login");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <form
                onSubmit={handleLogin}
                className="
                    w-full
                    max-w-lg
                    bg-white
                    p-8
                    rounded-2xl
                    shadow-lg
                "
            >
                <h2 className="text-2xl font-bold text-center mb-6">
                    Đăng Nhập
                </h2>

                {/* Email */}
                <div className="mb-4">
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Email address
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="
                            w-full
                            px-4
                            py-2
                            rounded-xl
                            border
                            border-gray-300
                            focus:outline-none
                            focus:ring-2
                            focus:ring-red-200
                            focus:border-red-500
                        "
                    />
                </div>

                {/* Password */}
                <div className="mb-4">
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="
                            w-full
                            px-4
                            py-2
                            rounded-xl
                            border
                            border-gray-300
                            focus:outline-none
                            focus:ring-2
                            focus:ring-red-200
                            focus:border-red-500
                        "
                    />
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2 mb-6">
                    <input
                        id="rememberMe"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    />
                    <label
                        htmlFor="rememberMe"
                        className="text-sm text-gray-700"
                    >
                        Remember me
                    </label>
                </div>

                {/* Social Login */}
                <div className="flex gap-3 mb-6">
                    <button
                        type="button"
                        className="
                            flex-1
                            flex
                            items-center
                            justify-center
                            gap-2
                            py-2
                            rounded-xl
                            bg-blue-600
                            text-white
                            font-medium
                            hover:bg-blue-700
                            transition
                        "
                    >
                        <FaFacebook />
                        Facebook
                    </button>

                    <button
                        type="button"
                        className="
                            flex-1
                            flex
                            items-center
                            justify-center
                            gap-2
                            py-2
                            rounded-xl
                            bg-red-500
                            text-white
                            font-medium
                            hover:bg-red-600
                            transition
                        "
                    >
                        <FaGoogle />
                        Google
                    </button>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="
                        w-full
                        py-3
                        rounded-xl
                        bg-green-600
                        text-white
                        font-semibold
                        hover:bg-green-700
                        transition
                    "
                >
                    Đăng Nhập
                </button>

                {/* Register */}
                <p className="text-center text-sm text-gray-600 mt-4">
                    Chưa có tài khoản?{" "}
                    <span
                        onClick={() => navigate("/register")}
                        className="text-red-600 font-medium cursor-pointer hover:underline"
                    >
                        Đăng ký
                    </span>
                </p>
            </form>
        </div>
    );
}

export default Login;
