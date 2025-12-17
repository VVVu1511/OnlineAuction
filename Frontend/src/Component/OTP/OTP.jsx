import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import * as accountService from "../../service/account.service.jsx";

export default function VerifyOtp() {
    const { state } = useLocation();
    const userData = state?.userData;
    const navigate = useNavigate();

    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!otp || !userData?.email) return;

        try {
            setLoading(true);

            // 1️⃣ Verify OTP
            const otpRes = await accountService.verifyOtp(userData.email, otp);
            setMessage(otpRes.message);

            if (!otpRes.success) return;

            // 2️⃣ OTP đúng → Register
            const regRes = await accountService.register(userData);

            if (regRes.success) {
                alert("Registration successful! You can now login.");
                navigate("/login");
            } else {
                alert(regRes.message || "Registration failed");
            }
        } catch (err) {
            console.error("OTP/Register error:", err);
            alert(err.response?.data?.message || "Server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <form
                onSubmit={handleSubmit}
                className="
                    w-full
                    max-w-md
                    bg-white
                    p-8
                    rounded-2xl
                    shadow-lg
                "
            >
                <h2 className="text-2xl font-bold text-center mb-6">
                    Verify OTP
                </h2>

                <p className="text-sm text-gray-600 text-center mb-4">
                    Please enter the OTP sent to your email
                </p>

                {/* OTP Input */}
                <div className="mb-4">
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        className="
                            w-full
                            px-4
                            py-3
                            text-center
                            tracking-widest
                            text-lg
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

                {/* Message */}
                {message && (
                    <p className="text-center text-sm mb-4 text-blue-600">
                        {message}
                    </p>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`
                        w-full
                        py-3
                        rounded-xl
                        font-semibold
                        text-white
                        transition
                        ${
                            loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                        }
                    `}
                >
                    {loading ? "Verifying..." : "Verify OTP"}
                </button>

                {/* Back to login */}
                <p className="text-center text-sm text-gray-600 mt-4">
                    Already verified?{" "}
                    <span
                        onClick={() => navigate("/login")}
                        className="text-red-600 font-medium cursor-pointer hover:underline"
                    >
                        Login
                    </span>
                </p>
            </form>
        </div>
    );
}
