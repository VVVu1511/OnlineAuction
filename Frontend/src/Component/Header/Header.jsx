import { useNavigate } from "react-router-dom";
import { FaSearch, FaUser } from "react-icons/fa";
import { useState, useEffect } from "react";

function Header() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("user")
    );

    useEffect(() => {
        const syncAuth = () => {
            setIsLoggedIn(!!localStorage.getItem("user"));
        };

        // 🔥 custom auth event
        window.addEventListener("auth-change", syncAuth);

        return () => window.removeEventListener("auth-change", syncAuth);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");

        // 🔔 notify Header
        window.dispatchEvent(new Event("auth-change"));

        navigate("/");
    };

    const handleSearch = () => {
        const keyword = document.getElementById("search").value.trim();
        if (!keyword) return;
        navigate("/productGridWithCat", { state: { keyword } });
    };

    return (
        <header className="bg-red-600 text-white text-sm">
            <div className="max-w-7xl mx-auto px-4 py-2">

                {/* Auth line */}
                <div className="flex justify-end gap-2 mb-1">
                    {!isLoggedIn ? (
                        <>
                            <span onClick={() => navigate("/register")} className="cursor-pointer">
                                Đăng ký
                            </span>
                            <span>|</span>
                            <span onClick={() => navigate("/login")} className="cursor-pointer">
                                Đăng nhập
                            </span>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <FaUser
                                size={14}
                                className="cursor-pointer"
                                onClick={() => navigate("/profile")}
                            />
                            <span onClick={handleLogout} className="cursor-pointer hover:underline">
                                Logout
                            </span>
                        </div>
                    )}
                </div>

                {/* Main */}
                <div className="flex items-center gap-3">
                    <h1
                        onClick={() => navigate("/")}
                        className="text-2xl font-semibold cursor-pointer"
                    >
                        Online Auction
                    </h1>

                    <div className="flex flex-1">
                        <input
                            id="search"
                            placeholder="Tìm sản phẩm..."
                            className="w-full px-3 py-1.5 rounded-l-md text-gray-800"
                        />
                        <button
                            onClick={handleSearch}
                            className="bg-red-200 px-3 rounded-r-md"
                        >
                            <FaSearch className="text-gray-500 text-sm" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
