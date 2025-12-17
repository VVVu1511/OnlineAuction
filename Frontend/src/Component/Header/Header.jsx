import { useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaUser } from "react-icons/fa";
import { useState, useEffect } from "react";

function Header() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        setIsLoggedIn(false);
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
                            <span
                                onClick={() => navigate("/register")}
                                className="cursor-pointer hover:opacity-80"
                            >
                                Đăng ký
                            </span>
                            <span>|</span>
                            <span
                                onClick={() => navigate("/login")}
                                className="cursor-pointer hover:opacity-80"
                            >
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
                            <span
                                onClick={handleLogout}
                                className="cursor-pointer hover:underline"
                            >
                                Logout
                            </span>
                        </div>
                    )}
                </div>

                {/* Main row */}
                <div className="flex items-center gap-3">
                    
                    {/* Logo */}
                    <h1
                        onClick={() => navigate("/")}
                        className="text-2xl font-semibold cursor-pointer whitespace-nowrap"
                    >
                        Online Auction
                    </h1>

                    {/* Search */}
                    <div className="flex flex-1">
                        <input
                            id="search"
                            type="text"
                            placeholder="Tìm sản phẩm..."
                            className="
                                w-full px-3 py-1.5
                                rounded-l-md
                                text-gray-800
                                focus:outline-none
                                bg-white
                            "
                        />
                        <button
                            onClick={handleSearch}
                            className="
                                bg-red-200 px-3
                                rounded-r-md
                                flex items-center justify-center
                                hover:bg-red-400 hover:text-white
                                transition-colors
                            "
                        >
                            <FaSearch className="text-gray-500 text-sm " />
                        </button>
                    </div>

                    {/* Cart */}
                    <FaShoppingCart
                        size={18}
                        className="cursor-pointer"
                        onClick={() => navigate("/cart")}
                    />
                </div>
            </div>
        </header>
    );
}

export default Header;
