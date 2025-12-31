import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import { FaUser, FaSearch, FaSignOutAlt } from "react-icons/fa";

export default function Header() {
    const { user, logout } = useContext(AuthContext);
    const [keyword, setKeyword] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e?.preventDefault();
        if (!keyword.trim()) return;

        navigate(`/search/${encodeURIComponent(keyword.trim())}`);
        setKeyword("");
    };

    const handleLogout = () => {
        logout();
        navigate("/"); // hoặc "/"
    };

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">

                {/* Logo */}
                <Link
                    to="/"
                    className="text-xl font-bold text-blue-600 !no-underline whitespace-nowrap"
                >
                    Online Auction
                </Link>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex-1 mx-6 flex">
                    <input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="flex-1 border border-r-0 rounded-l-lg px-4 py-2
                                   focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                    <button
                        type="button"
                        onClick={handleSearch}
                        className="px-4 bg-blue-600 text-white rounded-r-lg
                                   hover:bg-blue-500 transition
                                   flex items-center justify-center"
                    >
                        <FaSearch />
                    </button>
                </form>

                {/* Right */}
                <div className="flex items-center gap-4 whitespace-nowrap">
                    {!user ? (
                        <>
                            <Link
                                to="/register"
                                className="text-gray-600 hover:text-blue-600 !no-underline"
                            >
                                Register
                            </Link>
                            <Link
                                to="/login"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg
                                           hover:bg-blue-700 !no-underline"
                            >
                                Login
                            </Link>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            {/* User icon */}
                            <div className="flex items-center gap-1 text-gray-700">
                                <FaUser />
                                <span className="text-sm font-medium">
                                    {user.fullName || "User"}
                                </span>
                            </div>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1 text-red-500
                                           hover:text-red-600 transition"
                            >
                                <FaSignOutAlt />
                                <span className="text-sm">Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
