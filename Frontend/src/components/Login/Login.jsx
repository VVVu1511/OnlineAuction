import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import * as accountService from "../../services/account.service.jsx";
import { FaEnvelope, FaLock } from "react-icons/fa";
import Back from "../Back/Back.jsx"

export default function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;
        setError("");

        try {
            const res = await accountService.login(email, password);
            login(res.data);
            navigate("/");
        } catch {
            setError("Email hoặc mật khẩu không đúng");
        }
    };

    const [errors, setErrors] = useState({});
    const validate = () => {
        const newErrors = {};

        // Email
        if (!email.trim()) {
            newErrors.email = "Email không được để trống";
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = "Email không hợp lệ";
        }

        // Password
        if (!password) {
            newErrors.password = "Mật khẩu không được để trống";
        } else if (password.length < 6) {
            newErrors.password = "Mật khẩu tối thiểu 6 ký tự";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
            <form
                onSubmit={handleSubmit}
                className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg space-y-5"
            >
                <Back />

                <h1 className="mb-5 text-2xl font-bold text-center text-blue-600">
                    Đăng nhập
                </h1>

                {error && (
                    <div className="bg-red-100 text-red-600 px-4 py-2 rounded text-sm">
                        {error}
                    </div>
                )}

                {/* Email */}
                <div>
                    <div className="relative">
                        <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email)
                                    setErrors((prev) => ({ ...prev, email: undefined }));
                            }}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg
                                focus:outline-none focus:ring-2
                                ${
                                    errors.email
                                        ? "border-red-500 focus:ring-red-400"
                                        : "focus:ring-blue-400"
                                }`}
                        />
                    </div>

                    {errors.email && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <div className="relative">
                        <FaLock className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password)
                                    setErrors((prev) => ({ ...prev, password: undefined }));
                            }}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg
                                focus:outline-none focus:ring-2
                                ${
                                    errors.password
                                        ? "border-red-500 focus:ring-red-400"
                                        : "focus:ring-blue-400"
                                }`}
                        />
                    </div>

                    {errors.password && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.password}
                        </p>
                    )}
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

                {/* OR */}
                <div className="flex items-center my-4">
                    <div className="flex-grow h-px bg-gray-300"></div>
                    <span className="px-3 text-sm text-gray-500">HOẶC</span>
                    <div className="flex-grow h-px bg-gray-300"></div>
                </div>

                {/* Google Login */}
                <a
                    href="http://localhost:3000/auth/google"
                    className="
                        w-full flex items-center justify-center gap-3
                        border border-gray-300 rounded-lg py-2
                        font-semibold text-gray-700
                        hover:bg-gray-100 transition
                        !no-underline
                    "
                >
                    <img
                        src="https://developers.google.com/identity/images/g-logo.png"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    Đăng nhập bằng Google
                </a>

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
