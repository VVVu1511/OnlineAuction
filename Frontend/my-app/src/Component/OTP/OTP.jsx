import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function VerifyOtp() {
    const { state } = useLocation();
    const userData = state?.userData;
    const navigate = useNavigate();

    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");

    console.log("Received userData from Register:", userData); // DEBUG

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Submitting OTP:", otp); // DEBUG
        console.log(userData);

        // Step 1: Verify OTP
        const res = await fetch("http://localhost:3000/account/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userData.email, otp }),
        });

        const data = await res.json();
        console.log("Verify OTP response:", data); // DEBUG
        setMessage(data.message);

        if (!data.success) return;

        // Step 2: OTP correct → register user
        try {
            console.log("Registering user:", userData); // DEBUG

            const regRes = await fetch("http://localhost:3000/account/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            const regData = await regRes.json();

            console.log("Register API response:", regData); // DEBUG

            if (regData.success) {
                alert("Registration successful! You can now login.");
                navigate("/login");
            } else {
                alert(regData.message || "Registration failed");
            }
        } catch (err) {
            console.error("Registration error:", err);
            alert("Server error during registration");
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
