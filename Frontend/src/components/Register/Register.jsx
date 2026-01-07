import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import * as accountService from "../../services/account.service.jsx";
import Back from "../Back/Back.jsx";
import ReCAPTCHA from "react-google-recaptcha";
import { LoadingContext } from "../../context/LoadingContext.jsx";

export default function Register() {
    const navigate = useNavigate();
    const [captcha, setCaptcha] = useState(null);
    const { setLoading } = useContext(LoadingContext);

    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        address: "",
        otp: "",
    });
    
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const checkEmail = async (email) => {
        const res = await accountService.checkEmail(email);
        return res.exists;
    };

    const validateStep1 = async () => {
        const newErrors = {};

        if (!form.fullName.trim()) {
            newErrors.fullName = "Họ tên không được để trống";
        }

        if (!form.email.trim()) {
            newErrors.email = "Email không được để trống";
        } else if (!emailRegex.test(form.email)) {
            newErrors.email = "Email không hợp lệ";
        } else {
            const exists = await checkEmail(form.email);
            if (exists) {
                newErrors.email = "Email đã được sử dụng";
            }
        }

        if (!form.password) {
            newErrors.password = "Mật khẩu không được để trống";
        } else if (form.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        if (!form.address.trim()) {
            newErrors.address = "Địa chỉ không được để trống";
        }

        if (!captcha) {
            newErrors.captcha = "Vui lòng xác nhận captcha";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const sendOtp = async () => {
        const isValid = await validateStep1();
        if (!isValid) return;

        try {
            setLoading(true);
            await accountService.sendOtp(form.email);
            setStep(2);
        } catch {
            setErrors({ general: "Không gửi được OTP" });
        } finally {
            setLoading(false);
        }
    };

    const verifyOtpAndRegister = async () => {
        const newErrors = {};

        if (!form.otp || form.otp.trim() === "") {
            newErrors.otp = "Vui lòng nhập OTP";
        } else if (!/^\d{6}$/.test(form.otp)) {
            newErrors.otp = "OTP phải gồm 6 chữ số";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setErrors({});
            setLoading(true);

            await accountService.verifyOtp(form.email, form.otp);

            await accountService.register({
                fullName: form.fullName,
                email: form.email,
                password: form.password,
                address: form.address,
                role: 1,
                captcha,
            });

            navigate("/login");
        } catch (err) {
            setErrors({
                otp: "OTP không hợp lệ hoặc đã hết hạn"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96 space-y-4">
                <Back />

                <h1 className="text-2xl font-semibold text-center">Register</h1>

                {step === 1 && (
                    <>
                        <input
                            name="fullName"
                            placeholder="Full name"
                            onChange={handleChange}
                            className={`mt-5 w-full border px-4 py-2 rounded ${
                                errors.fullName ? "border-red-500" : ""
                            }`}
                        />
                        {errors.fullName && (
                            <p className="text-red-500 text-sm">{errors.fullName}</p>
                        )}

                        <input
                            name="email"
                            placeholder="Email"
                            onChange={handleChange}
                            className={`w-full border px-4 py-2 rounded ${
                                errors.email ? "border-red-500" : ""
                            }`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm">{errors.email}</p>
                        )}

                        <input
                            name="password"
                            type="password"
                            placeholder="Password (≥ 6 chars)"
                            onChange={handleChange}
                            className={`w-full border px-4 py-2 rounded ${
                                errors.password ? "border-red-500" : ""
                            }`}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm">{errors.password}</p>
                        )}

                        <input
                            name="address"
                            placeholder="Address"
                            onChange={handleChange}
                            className={`w-full border px-4 py-2 rounded ${
                                errors.address ? "border-red-500" : ""
                            }`}
                        />
                        {errors.address && (
                            <p className="text-red-500 text-sm">{errors.address}</p>
                        )}

                        {/* CAPTCHA */}
                        <ReCAPTCHA
                            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                            onChange={(token) => setCaptcha(token)}
                            className="mt-3"
                        />

                        <button
                            onClick={sendOtp}
                            className="mt-3 w-full bg-blue-600 text-white py-2 rounded
                                    hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Đăng kí
                        </button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <input
                            name="otp"
                            placeholder="Enter OTP"
                            onChange={handleChange}
                            className={`mt-5 w-full border px-4 py-2 rounded ${
                                errors.otp ? "border-red-500" : ""
                            }`}
                        />

                        {errors.otp && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.otp}
                            </p>
                        )}

                        <button
                            onClick={verifyOtpAndRegister}
                            className="mt-3 w-full bg-green-600 text-white py-2 rounded
                                    hover:bg-green-700 disabled:bg-gray-400"
                        >
                            Xác nhận OTP
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
