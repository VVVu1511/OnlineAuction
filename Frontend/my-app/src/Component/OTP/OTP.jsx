import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";


export default function VerifyOtp() {
    const { state } = useLocation();
    const userId = state?.userId;
    const navigate = useNavigate();

    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("http://localhost:3000/account/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, otp }),
        });

        const data = await res.json();
        setMessage(data.message);

        if (data.success) {
            alert("OTP verified! You can now login.");
            navigate("/login");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Verify OTP</h2>

            <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
            />

            <button type="submit">Verify OTP</button>
            {message && <p>{message}</p>}
        </form>
    );
}
