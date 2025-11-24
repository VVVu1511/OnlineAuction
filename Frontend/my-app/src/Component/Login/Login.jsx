import { FaFacebook, FaGoogle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Login() {
    const handleLogin = () => {
        
    }
    
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh"}}>
            <form className="w-100 border p-4 rounded shadow" style={{ maxWidth: '1000px' , minWidth: '600px'}}>
                <h2 className="text-center mb-4">Đăng Nhập</h2>

                {/* Email */}
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input type="email" required className="form-control" id="email" placeholder="you@example.com" />
                </div>

                {/* Password */}
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" required className="form-control" id="password" placeholder="********" />
                </div>

                {/* Remember Me */}
                <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" id="rememberMe" />
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
                <button type="submit" onClick={handleLogin} className="btn btn-success w-100">
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
