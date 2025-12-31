import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as accountService from "../../services/account.service.jsx";
import Back from "../Back/Back.jsx"

export default function Register() {
    const navigate = useNavigate();

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

    const sendOtp = async () => {
        try {
            await accountService.sendOtp(form.email);
            setStep(2);
        } catch {
            setError("Không gửi được OTP");
        }
    };

    const verifyOtpAndRegister = async () => {
        try {
            await accountService.verifyOtp(form.email, form.otp);

            await accountService.register({
                fullName: form.fullName,
                email: form.email,
                password: form.password,
                address: form.address,
                role: 1,
                captcha: "test",
            });

            navigate("/login");
        } catch {
            setError("OTP không hợp lệ");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96 space-y-4">
                <h1 className="text-2xl font-semibold text-center">Register</h1>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                {step === 1 && (
                    <>
                        <input name="fullName" placeholder="Full name" onChange={handleChange}
                            className="mt-5 w-full border px-4 py-2 rounded" />
                        <input name="email" placeholder="Email" onChange={handleChange}
                            className="w-full border px-4 py-2 rounded" />
                        <input name="password" type="password" placeholder="Password" onChange={handleChange}
                            className="w-full border px-4 py-2 rounded" />
                        <input name="address" placeholder="Address" onChange={handleChange}
                            className="w-full border px-4 py-2 rounded" />

                        <button
                            onClick={sendOtp}
                            className="mt-5 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
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
                            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                        >
                            Verify & Register
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
