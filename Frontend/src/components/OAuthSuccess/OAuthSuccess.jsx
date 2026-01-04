// OAuthSuccess.jsx
import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext.jsx";

export default function OAuthSuccess() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const res = await axios.get(
                "http://localhost:3000/auth/me",
                { withCredentials: true }
            );

            console.log(res);

            login(res.data);          // ✅ set sessionStorage
            navigate("/");            // về trang chủ
        };

        fetchUser();
    }, []);

    return <p className="text-center mt-10">Đang đăng nhập...</p>;
}
