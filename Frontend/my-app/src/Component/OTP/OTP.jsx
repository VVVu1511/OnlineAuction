import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import * as accountService from "../../service/account.service.jsx"

export default function VerifyOtp() {
    const { state } = useLocation();
    const userData = state?.userData;
    const navigate = useNavigate();

    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");

    console.log("Received userData from Register:", userData); // DEBUG

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        console.log("Submitting OTP:", otp);
        console.log("User data:", userData);

        // 1️⃣ Verify OTP
        const otpRes = await accountService.verifyOtp(userData.email, otp);

        console.log("Verify OTP response:", otpRes);
        setMessage(otpRes.message);

        if (!otpRes.success) return;

        // 2️⃣ OTP đúng → Register
        const regRes = await accountService.register(userData);

        console.log("Register response:", regRes);

        if (regRes.success) {
            alert("Registration successful! You can now login.");
            navigate("/login");
        } else {
            alert(regRes.message || "Registration failed");
        }
    } catch (err) {
        console.error("OTP/Register error:", err);
        alert(err.response?.data?.message || "Server error");
    }
};

    return (
        <form className="p-5" onSubmit={handleSubmit}>
            <h2>Verify OTP</h2>

            <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
            />

            <button type="submit">Verify OTP</button>

            {message && <p>{message}</p>}
        </form>
    );
}
