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

    const handleSearchWithValidate = (e) => {
        e?.preventDefault();

        const err = validateKeyword(keyword);
        if (err) {
            setSearchError(err);
            return;
        }

        setSearchError("");
        handleSearch(); // giữ nguyên logic cũ
    };

    const handleLogout = () => {
        logout();
        navigate("/"); // hoặc "/"
    };

    const [searchError, setSearchError] = useState("");

    const validateKeyword = (kw) => {
        if (!kw.trim()) return "Vui lòng nhập từ khóa tìm kiếm";
        if (kw.trim().length < 2)
            return "Từ khóa phải có ít nhất 2 ký tự";
        return "";
    };

    return (
        <header className="bg-white shadow-md">
            <div className=" container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link
                    to="/"
                    className="text-xl font-bold text-blue-600 !no-underline whitespace-nowrap"
                >
                    Online Auction
                </Link>

                {/* Search */}
                {(!user || user.role === "bidder") && (
                    <form
                        onSubmit={handleSearchWithValidate}
                        className="flex-1 mx-6 flex flex-col"
                    >
                        {/* INPUT + BUTTON */}
                        <div className="flex">
                            <input
                                value={keyword}
                                onChange={(e) => {
                                    setKeyword(e.target.value);
                                    if (searchError) setSearchError("");
                                }}
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="flex-1 border border-r-0 rounded-l-lg px-4 py-2
                                        focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />

                            <button
                                type="submit"
                                className="px-4 bg-blue-600 text-white rounded-r-lg
                                        hover:bg-blue-500 transition
                                        flex items-center justify-center"
                            >
                                <FaSearch />
                            </button>
                        </div>

                        {/* ERROR MESSAGE */}
                        {searchError && (
                            <p className="text-sm text-red-600 mt-1 z-10">
                                {searchError}
                            </p>
                        )}
                    </form>
                )}

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
                            <Link to="/profile" className="!no-underline flex items-center gap-1 text-gray-700">
                                <FaUser />
                                <span className="text-sm font-medium">
                                    {user.full_name || "User"}
                                </span>
                            </Link>

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
