import { FaFacebook, FaGoogle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Login() {
    const navigate = useNavigate();

    // State for inputs
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault(); // prevent form reload

        console.log("Login attempt:", { email, password, rememberMe });

        try {
            const res = await fetch("http://localhost:3000/account/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data.success && data.token) {
                // Save token for future API requests
                localStorage.setItem("token", data.token);

                // Optionally save user email or other info if needed
                localStorage.setItem("userEmail", email);

                console.log("Token saved:", data.token);

                // Navigate to home page
                navigate("/");

            } else {
                alert(data.message || "Login failed");
            }

        } catch (err) {
            console.error("Login error:", err);
            alert("Server error during login");
        }
    };


    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh"}}>
            <form 
                className="w-100 border p-4 rounded shadow" 
                style={{ maxWidth: '1000px' , minWidth: '600px'}}
                onSubmit={handleLogin}
            >
                <h2 className="text-center mb-4">Đăng Nhập</h2>

                {/* Email */}
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input 
                        type="email" 
                        required 
                        className="form-control" 
                        id="email" 
                        placeholder="you@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* Password */}
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input 
                        type="password" 
                        required 
                        className="form-control" 
                        id="password" 
                        placeholder="********" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {/* Remember Me */}
                <div className="mb-3 form-check">
                    <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="rememberMe" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                </div>

                {/* Social login */}
                <div className="d-flex justify-content-center align-items-center mb-3 gap-3">
                    <button type="button" className="btn btn-primary d-flex align-items-center gap-2">
                        <FaFacebook /> Facebook
                    </button>
                    <button type="button" className="btn btn-danger d-flex align-items-center gap-2">
                        <FaGoogle /> Google
                    </button>
                </div>

                {/* Submit button */}
                <button type="submit" className="btn btn-success w-100">
                    Đăng Nhập
                </button>

                {/* Register link */}
                <p className="text-center mt-3">
                    Chưa có tài khoản? <a href="/register">Đăng ký</a>
                </p>
            </form>
        </div>
    );
}

export default Login;
