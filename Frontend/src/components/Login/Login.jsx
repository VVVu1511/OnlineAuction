import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import * as accountService from "../../services/account.service.jsx";
import { FaEnvelope, FaLock } from "react-icons/fa";

export default function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await accountService.login(email, password);
            login(res.data);
            navigate("/");
        } catch {
            setError("Email hoặc mật khẩu không đúng");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
            <form
                onSubmit={handleSubmit}
                className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg space-y-5"
            >
                <h1 className="mb-5 text-2xl font-bold text-center text-blue-600">
                    Đăng nhập
                </h1>

                {error && (
                    <div className="bg-red-100 text-red-600 px-4 py-2 rounded text-sm">
                        {error}
                    </div>
                )}

                {/* Email */}
                <div className="relative">
                    <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg
                                focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </div>

                {/* Password */}
                <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg
                                focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </div>

                {/* Forgot password */}
                <div className="text-right">
                    <Link
                        to="/forgot-password"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Quên mật khẩu?
                    </Link>
                </div>

                {/* Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg
                            font-semibold hover:bg-blue-700 transition"
                >
                    Đăng nhập
                </button>

                {/* Register */}
                <p className="mt-5 text-center text-sm text-gray-600">
                    Chưa có tài khoản?{" "}
                    <Link
                        to="/register"
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Đăng ký
                    </Link>
                </p>
            </form>
        </div>
    );
}
