function Register(){
    return (
        
            <form className="w-50 border p-4"> 
                <p className="h2 text-center">Dang Ky</p>

                <div class="mb-3">
                    <label for="exampleInputEmail1" class="form-label">Email address</label>
                    <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
                </div>
                <div className="mb-3">
                    <label htmlFor="" className="form-label">Full Name</label>
                    <input type="text" className="form-control" id="fullName"/>
                </div>
                <div className="mb-3">
                    <label htmlFor="" className="form-label">Address</label>
                    <input type="password" className="form-control" />
                </div>
                <div class="mb-3">
                    <label for="exampleInputPassword1" class="form-label">Password</label>
                    <input type="password" class="form-control" id="exampleInputPassword1" />
                </div>
                <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input" id="exampleCheck1" />
                    <label class="form-check-label" for="exampleCheck1">Recaptcha</label>
                </div>
                <button type="submit" class="btn btn-primary">Submit</button>
            </form>


    );
}


export default Register;