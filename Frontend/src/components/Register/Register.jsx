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
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const isStep1Valid =
        form.fullName.trim() !== "" &&
        emailRegex.test(form.email) &&
        form.password.length >= 6 &&
        form.address.trim() !== "" &&
        captcha;

    const isOtpValid = form.otp.trim().length === 6;

    const sendOtp = async () => {
        if (!isStep1Valid) {
            setError("Vui lòng nhập đầy đủ thông tin hợp lệ");
            return;
        }

        try {
            setError("");
            setLoading(true);

            await accountService.sendOtp(form.email);
            setStep(2);
        } catch {
            setError("Không gửi được OTP");
        } finally {
            setLoading(false);
        }
    };


    const verifyOtpAndRegister = async () => {
        if (!isOtpValid) {
            setError("OTP phải gồm 6 chữ số");
            return;
        }

        try {
            setError("");
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
        } catch {
            setError("OTP không hợp lệ");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96 space-y-4">
                <Back />

                <h1 className="text-2xl font-semibold text-center">Register</h1>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                {step === 1 && (
                    <>
                        <input
                            name="fullName"
                            placeholder="Full name"
                            onChange={handleChange}
                            className={`mt-5 w-full border px-4 py-2 rounded ${
                                form.fullName === "" && error ? "border-red-500" : ""
                            }`}
                        />

                        <input
                            name="email"
                            placeholder="Email"
                            onChange={handleChange}
                            className={`w-full border px-4 py-2 rounded ${
                                form.email && !emailRegex.test(form.email)
                                    ? "border-red-500"
                                    : ""
                            }`}
                        />

                        <input
                            name="password"
                            type="password"
                            placeholder="Password (≥ 6 chars)"
                            onChange={handleChange}
                            className={`w-full border px-4 py-2 rounded ${
                                form.password && form.password.length < 6
                                    ? "border-red-500"
                                    : ""
                            }`}
                        />

                        <input
                            name="address"
                            placeholder="Address"
                            onChange={handleChange}
                            className={`w-full border px-4 py-2 rounded ${
                                form.address === "" && error ? "border-red-500" : ""
                            }`}
                        />

                        {/* CAPTCHA */}
                        <ReCAPTCHA
                            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                            onChange={(token) => setCaptcha(token)}
                            className="mt-3"
                        />

                        <button
                            onClick={sendOtp}
                            disabled={!isStep1Valid}
                            className="mt-3 w-full bg-blue-600 text-white py-2 rounded
                                    hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Send OTP
                        </button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <input
                            name="otp"
                            placeholder="Enter OTP"
                            onChange={handleChange}
                            className="w-full border px-4 py-2 rounded"
                        />

                        <button
                            onClick={verifyOtpAndRegister}
                            disabled={!isOtpValid}
                            className="w-full bg-green-600 text-white py-2 rounded
                                    hover:bg-green-700 disabled:bg-gray-400"
                        >
                            Verify & Register
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
