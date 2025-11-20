import { useNavigate } from "react-router-dom";


function Register(){
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
            <form className="w-50 border p-4"> 
                <p className="h2 text-center">Đăng Ký</p>

                <div class="mb-3">
                    <label for="exampleInputEmail1" class="form-label">Email address</label>
                    <input type="email" required class="form-control" id="email" aria-describedby="emailHelp" />
                </div>
                <div className="mb-3">
                    <label htmlFor="" className="form-label">Full Name</label>
                    <input type="text" required className="form-control" id="fullName"/>
                </div>
                <div className="mb-3">
                    <label htmlFor="" className="form-label">Address</label>
                    <input type="text" required className="form-control" id="address" />
                </div>
                <div class="mb-3">
                    <label for="exampleInputPassword1" class="form-label">Password</label>
                    <input type="password" required class="form-control" id="password" />
                </div>
                <div class="mb-3 form-check">
                    <input required type="checkbox" class="form-check-input" id="notRobot" />
                    <label class="form-check-label" for="exampleCheck1">I'm not a robot</label>
                </div>

                <div className="d-flex justify-content-center">
                    <p className="me-2">Facebook</p>
                    <i className="mt-1 fa-brands fa-facebook"></i>

                    <p className="ms-5 me-5">|</p>

                    <p className="me-2">Google</p>
                    <i className="mt-1 fa-brands fa-google"></i>
                </div>

                <button type="submit" onClick={() => handleSubmit()}  class="btn btn-primary">Submit</button>
            </form>


    );
}


export default Register;