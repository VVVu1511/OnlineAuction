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
        
        // reset getElementById("search")
        document.getElementById("search").value = "";

        navigate(`/category/all?keyword=${keyword}`);
    };

    return (
        <header className="bg-red-600 text-white text-sm shadow">
            <div className="max-w-7xl mx-auto px-4 py-2 space-y-2">

                {/* Auth line */}
                <div className="flex justify-end items-center gap-3 text-xs opacity-90">
                {!isLoggedIn ? (
                    <>
                    <span
                        onClick={() => navigate("/register")}
                        className="cursor-pointer hover:underline"
                    >
                        Đăng ký
                    </span>
                    <span>|</span>
                    <span
                        onClick={() => navigate("/login")}
                        className="cursor-pointer hover:underline"
                    >
                        Đăng nhập
                    </span>
                    </>
                ) : (
                    <div className="flex items-center gap-3">
                    <FaUser
                        size={14}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => navigate("/profile")}
                    />
                    <span
                        onClick={handleLogout}
                        className="cursor-pointer hover:underline"
                    >
                        Logout
                    </span>
                    </div>
                )}
                </div>

                {/* Main */}
                <div className="flex items-center gap-4">
                <h1
                    onClick={() => navigate("/")}
                    className="text-xl md:text-2xl font-bold cursor-pointer whitespace-nowrap"
                >
                    Online Auction
                </h1>

                {/* Search */}
                <div className="flex flex-1 max-w-xl">
                    <input
                    id="search"
                    placeholder="Tìm sản phẩm..."
                    className="
                        w-full px-3 py-2
                        rounded-l-md
                        text-gray-800
                        bg-white
                        focus:outline-none
                        focus:ring-2 focus:ring-red-300
                    "
                    />
                    <button
                    onClick={handleSearch}
                    className="
                        bg-red-500
                        px-4
                        rounded-r-md
                        hover:bg-red-700
                        transition
                    "
                    >
                    <FaSearch className="text-white text-sm" />
                    </button>
                </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
