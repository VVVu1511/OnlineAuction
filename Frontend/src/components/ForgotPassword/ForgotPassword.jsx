import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as accountService from "../../services/account.service.jsx";
import { FaEnvelope, FaLock, FaKey } from "react-icons/fa";
import Back from "../Back/Back.jsx"

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /* STEP 1: Send OTP */
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await accountService.sendOtp(email);
            setSuccess("OTP đã được gửi tới email");
            setStep(2);
        } catch {
            setError("Không gửi được OTP");
        }
    };

    /* STEP 2: Verify OTP */
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await accountService.verifyOtp(email, otp);
            setSuccess("Xác thực OTP thành công");
            setStep(3);
        } catch {
            setError("OTP không hợp lệ");
        }
    };

    /* STEP 3: Change password */
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await accountService.resetPassword(email, newPassword);
            
            navigate("/login");
        } catch {
            setError("Không thể đổi mật khẩu");
        }
    };

    const [errorr, setErrorr] = useState("");

    const validateEmail = (email) => {
        if (!email.trim()) return "Email không được để trống";
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) return "Email không hợp lệ";
        return "";
    };

    const validateOtp = (otp) => {
        if (!otp.trim()) return "OTP không được để trống";
        if (!/^\d{6}$/.test(otp)) return "OTP phải gồm 6 chữ số";
        return "";
    };

    const validatePassword = (pwd) => {
        if (!pwd) return "Mật khẩu không được để trống";
        if (pwd.length < 6) return "Mật khẩu tối thiểu 6 ký tự";
        return "";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
            
            <form className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg space-y-5">
                <Back to="/login" />

                <h1 className="mb-5 text-2xl font-bold text-center text-blue-600">
                    Quên mật khẩu
                </h1>

                {error && (
                    <div className="bg-red-100 text-red-600 px-4 py-2 rounded text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 text-green-600 px-4 py-2 rounded text-sm">
                        {success}
                    </div>
                )}

                {/* STEP 1 */}
                {step === 1 && (
                    <>
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="email"
                                placeholder="Nhập email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg
                                        focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            />

                            {errorr && (
                                <p className="text-sm text-red-600 mt-2 text-center">
                                    {errorr}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                const err = validateEmail(email);
                                if (err) {
                                    setErrorr(err);
                                    return;
                                }
                                setErrorr("");
                                handleSendOtp();
                            }}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg
                                    font-semibold hover:bg-blue-700 transition"
                        >
                            Gửi OTP
                        </button>

                    </>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <>
                        <div className="relative">
                            <FaKey className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Nhập OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg
                                        focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            />

                            {errorr && (
                                <p className="text-sm text-red-600 mt-2 text-center">
                                    {errorr}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                const err = validateOtp(otp);
                                if (err) {
                                    setErrorr(err);
                                    return;
                                }
                                setErrorr("");
                                handleVerifyOtp();
                            }}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg
                                    font-semibold hover:bg-blue-700 transition"
                        >
                            Xác nhận OTP
                        </button>

                    </>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="password"
                                placeholder="Mật khẩu mới"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg
                                        focus:outline-none focus:ring-2 focus:ring-blue-400"
                                required
                            />

                            {errorr && (
                                <p className="text-sm text-red-600 mt-2 text-center">
                                    {errorr}
                                </p>
                            )}

                        </div>

                        <button
                            onClick={() => {
                                const err = validatePassword(newPassword);
                                if (err) {
                                    setErrorr(err);
                                    return;
                                }
                                setErrorr("");
                                handleChangePassword();
                            }}
                            className="w-full bg-green-600 text-white py-2 rounded-lg
                                    font-semibold hover:bg-green-700 transition"
                        >
                            Đổi mật khẩu
                        </button>
                    </>
                )}
            </form>
        </div>
    );
}
