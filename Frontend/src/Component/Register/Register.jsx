import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import * as accountService from "../../service/account.service";

export default function Register() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [address, setAddress] = useState("");
    const [password, setPassword] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");

    /* ================= SUBMIT ================= */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!captchaToken) {
            alert("Please verify reCAPTCHA!");
            return;
        }

        const userData = {
            email,
            fullName,
            address,
            password,
            captcha: captchaToken,
        };

        try {
            const res = await accountService.sendOtp(email);

            if (res.success) {
                alert("OTP đã được gửi qua email!");
                navigate("/verify-otp", { state: { userData } });
            } else {
                alert(res.message || "Send OTP failed");
            }
        } catch (err) {
            console.error(err);
            alert("Server error!");
        }
    };

    /* ================= OAUTH ================= */
    const handleOAuthLogin = (url) => {
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        window.open(
            url,
            "_blank",
            `width=${width},height=${height},top=${top},left=${left}`
        );

        window.addEventListener("message", (event) => {
            if (event.origin !== "http://localhost:3000") return;

            const { token } = event.data;
            if (token) {
                localStorage.setItem("token", token);
                navigate("/");
            }
        });
    };

    const GOOGLE_AUTH_URL = "http://localhost:3000/auth/google";
    const FACEBOOK_AUTH_URL = "http://localhost:3000/auth/facebook";

    /* ================= UI ================= */
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 space-y-5"
            >
                <h2 className="text-2xl font-bold text-center text-gray-800">
                    Đăng Ký
                </h2>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                    />
                </div>

                {/* Full Name */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Full Name
                    </label>
                    <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nguyen Van A"
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                    />
                </div>

                {/* Address */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Address
                    </label>
                    <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Đường ABC, Hà Nội"
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="********"
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                    />
                </div>

                {/* CAPTCHA */}
                <div className="flex justify-center">
                    <ReCAPTCHA
                        sitekey="6Ld8pBksAAAAAG6ByWiUXsH77Do6NLFkH1W0DAAx"
                        onChange={setCaptchaToken}
                    />
                </div>

                {/* OAuth */}
                <div className="flex justify-center gap-4">
                    <button
                        type="button"
                        onClick={() => handleOAuthLogin(FACEBOOK_AUTH_URL)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        <FaFacebook /> Facebook
                    </button>

                    <button
                        type="button"
                        onClick={() => handleOAuthLogin(GOOGLE_AUTH_URL)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                        <FaGoogle /> Google
                    </button>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
                >
                    Đăng Ký
                </button>
            </form>
        </div>
    );
}
