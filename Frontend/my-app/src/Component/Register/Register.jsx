    import { useState, useEffect } from "react";
    import { useNavigate } from "react-router-dom";
    import ReCAPTCHA from "react-google-recaptcha";
    import { FaFacebook, FaGoogle } from "react-icons/fa";

    function Register() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [address, setAddress] = useState("");
    const [password, setPassword] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");

    // --- Handle regular register with OTP ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!captchaToken) {
        alert("Please verify reCAPTCHA!");
        return;
        }

        const userData = { email, fullName, address, password, captcha: captchaToken };

        try {
        const res = await fetch("http://localhost:3000/account/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (data.success) {
            alert("OTP has been sent to your email. Please check.");
            navigate("/verify-otp", { state: { userData } });
        } else {
            alert(data.message || "Failed to send OTP");
        }
        } catch (err) {
        console.error(err);
        alert("Server error!");
        }
    };

    // --- OAuth Popup Handler ---
    const handleOAuthLogin = (url) => {
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
            url,
            "_blank",
            `width=${width},height=${height},top=${top},left=${left}`
        );

        window.addEventListener("message", (event) => {
            // Only accept messages from your backend
            if (event.origin !== "http://localhost:3000") return;

            const { token, user } = event.data;
            if (token) {
                localStorage.setItem("token", token);
                console.log("Logged in user:", user);
                navigate("/"); // redirect to home
            }
        });
    };

    const GOOGLE_AUTH_URL = "http://localhost:3000/auth/google";
    const FACEBOOK_AUTH_URL = "http://localhost:3000/auth/facebook";

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <form
            className="w-100 w-md-50 border p-4 rounded shadow"
            style={{ maxWidth: "1000px", minWidth: "600px" }}
            onSubmit={handleSubmit}
        >
            <h2 className="text-center mb-4">Đăng Ký</h2>

            <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
                type="email"
                required
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            </div>

            <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
                type="text"
                required
                className="form-control"
                placeholder="Nguyen Van A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
            />
            </div>

            <div className="mb-3">
            <label className="form-label">Address</label>
            <input
                type="text"
                required
                className="form-control"
                placeholder="123 Đường ABC, Hà Nội"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            </div>

            <div className="mb-3">
            <label className="form-label">Password</label>
            <input
                type="password"
                required
                className="form-control"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            </div>

            <div className="mb-3 d-flex justify-content-center">
            <ReCAPTCHA
                sitekey="6Ld8pBksAAAAAG6ByWiUXsH77Do6NLFkH1W0DAAx"
                onChange={(token) => setCaptchaToken(token)}
            />
            </div>

            <div className="d-flex justify-content-center align-items-center mb-3 gap-3">
            <button
                type="button"
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => handleOAuthLogin(FACEBOOK_AUTH_URL)}
            >
                <FaFacebook /> Facebook
            </button>

            <button
                type="button"
                className="btn btn-danger d-flex align-items-center gap-2"
                onClick={() => handleOAuthLogin(GOOGLE_AUTH_URL)}
            >
                <FaGoogle /> Google
            </button>
            </div>

            <button type="submit" className="btn btn-success w-100">
            Đăng Ký
            </button>
        </form>
        </div>
    );
    }

    export default Register;
