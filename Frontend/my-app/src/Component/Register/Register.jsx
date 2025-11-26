import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { FaFacebook, FaGoogle } from "react-icons/fa";

function Register() {
    const navigate = useNavigate();

    const [captchaToken, setCaptchaToken] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = {
            email: document.querySelector("#email").value,
            fullName: document.querySelector("#fullName").value,
            address: document.querySelector("#address").value,
            password: document.querySelector("#password").value,
            captcha: captchaToken
        };

        if (!captchaToken) {
            alert("Please verify reCAPTCHA!");
            return;
        }

        fetch("http://localhost:3000/account/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(result => {
                console.log("Success", result);
                alert("Register success!");
                navigate("/login");
            })
            .catch(err => {
                console.error("Error", err);
            });
    };

    const GOOGLE_AUTH_URL = "http://localhost:3000/auth/google";
    const FACEBOOK_AUTH_URL = "http://localhost:3000/auth/facebook";

    
    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "80vh" }}
        >
            <form
                className="w-100 w-md-50 border p-4 rounded shadow"
                style={{ maxWidth: "1000px", minWidth: "600px" }}
                onSubmit={handleSubmit}
            >
                <h2 className="text-center mb-4">Đăng Ký</h2>

                {/* Email */}
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                        Email address
                    </label>
                    <input
                        type="email"
                        required
                        className="form-control"
                        id="email"
                        placeholder="you@example.com"
                    />
                </div>

                {/* Full Name */}
                <div className="mb-3">
                    <label htmlFor="fullName" className="form-label">
                        Full Name
                    </label>
                    <input
                        type="text"
                        required
                        className="form-control"
                        id="fullName"
                        placeholder="Nguyen Van A"
                    />
                </div>

                {/* Address */}
                <div className="mb-3">
                    <label htmlFor="address" className="form-label">
                        Address
                    </label>
                    <input
                        type="text"
                        required
                        className="form-control"
                        id="address"
                        placeholder="123 Đường ABC, Hà Nội"
                    />
                </div>

                {/* Password */}
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                        Password
                    </label>
                    <input
                        type="password"
                        required
                        className="form-control"
                        id="password"
                        placeholder="********"
                    />
                </div>

                {/* reCAPTCHA */}
                <div className="mb-3 d-flex justify-content-center">
                    <ReCAPTCHA
                        sitekey="YOUR_RECAPTCHA_SITE_KEY"
                        onChange={(token) => setCaptchaToken(token)}
                    />
                </div>

                {/* Social login */}
                <div className="d-flex justify-content-center align-items-center mb-3 gap-3">
                    <button
                        type="button"
                        className="btn btn-primary d-flex align-items-center gap-2"
                        onClick={() => (window.location.href = FACEBOOK_AUTH_URL)}
                    >
                        <FaFacebook /> Facebook
                    </button>

                    <button
                        type="button"
                        className="btn btn-danger d-flex align-items-center gap-2"
                        onClick={() => (window.location.href = GOOGLE_AUTH_URL)}
                    >
                        <FaGoogle /> Google
                    </button>
                </div>

                {/* Submit button */}
                <button type="submit" className="btn btn-success w-100">
                    Đăng Ký
                </button>
            </form>
        </div>
    );
}

export default Register;
