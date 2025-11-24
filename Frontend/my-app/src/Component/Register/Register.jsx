import { useNavigate } from "react-router-dom";
import { FaFacebook, FaGoogle } from 'react-icons/fa';

function Register() {
    const navigate = useNavigate();
    
    const handleSubmit = () => {
        const data = {
            email: document.querySelector("#exampleInputEmail1").value,
            fullName: document.querySelector("#fullName").value,
            address: document.querySelector("#address").value,
            password: document.querySelector("#password").value,
        }

        fetch("http://localhost:3000/account/register", {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data) 
        })
        .then(response => response.json())
        .then(result => {
            console.log("Success", result);
        })
        .then(error => {
            console.error("Error: ", error);
        })
    }

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <form className="w-100 w-md-50 border p-4 rounded shadow" style={{ maxWidth: '1000px' , minWidth: '600px'}}>
                <h2 className="text-center mb-4">Đăng Ký</h2>

                {/* Email */}
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input type="email" required className="form-control" id="email" placeholder="you@example.com" />
                </div>

                {/* Full Name */}
                <div className="mb-3">
                    <label htmlFor="fullName" className="form-label">Full Name</label>
                    <input type="text" required className="form-control" id="fullName" placeholder="Nguyen Van A" />
                </div>

                {/* Address */}
                <div className="mb-3">
                    <label htmlFor="address" className="form-label">Address</label>
                    <input type="text" required className="form-control" id="address" placeholder="123 Đường ABC, Hà Nội" />
                </div>

                {/* Password */}
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" required className="form-control" id="password" placeholder="********" />
                </div>

                {/* Checkbox */}
                <div className="mb-3 form-check">
                    <input required type="checkbox" className="form-check-input" id="notRobot" />
                    <label className="form-check-label" htmlFor="notRobot">I'm not a robot</label>
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
                <button type="submit" onClick={handleSubmit} className="btn btn-success w-100">
                    Đăng Ký
                </button>
            </form>
        </div>
    );
}

export default Register;
