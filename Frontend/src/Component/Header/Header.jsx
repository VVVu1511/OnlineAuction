import { useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUser } from 'react-icons/fa';
import { useState, useEffect } from 'react';

function Header() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check token on mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token); // true if token exists
    }, []);

    const handleSignUp = () => navigate('/register');
    const handleSignIn = () => navigate('/login');

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        setIsLoggedIn(false);
        navigate('/'); // redirect to home after logout
    };

    const [product, setProduct] = useState([]);
    const handleSearch = () => {
        const searchKW = document.getElementById("search").value.trim();
        if (!searchKW) return;
        navigate("/productGridWithCat", { state: { keyword: searchKW } });
    };

    return (
        <div className="bg-danger text-white p-3 ">
            {/* Top links */}
            <div className="d-flex justify-content-end align-items-center mb-2">
                {!isLoggedIn ? (
                    <>
                        <button 
                            className="btn btn-outline-light btn-sm me-2"
                            onClick={handleSignUp}
                        >
                            Đăng ký
                        </button>
                        <span className="me-2">|</span>
                        <button 
                            className="btn btn-outline-light btn-sm"
                            onClick={handleSignIn}
                        >
                            Đăng nhập
                        </button>
                    </>
                ) : (
                    <div className="d-flex align-items-center gap-2">
                        <FaUser 
                            size={20} 
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate("/profile")} 
                        />
                        <button 
                            className="btn btn-outline-light btn-sm"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>

            {/* Logo + Search + Cart */}
            <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
                {/* Logo */}
                <div className="d-flex align-items-center">
                    <h2 className="mb-0">Online Auction</h2>
                </div>

                {/* Search bar with icon */}
                <div className="flex-grow-1 mx-3">
                    <div className="input-group">
                        <input 
                            id="search"
                            type="text" 
                            className="form-control" 
                            placeholder="Tra cứu sản phẩm..." 
                        />
                        <span className="input-group-text bg-white">
                            <FaSearch onClick={handleSearch} color="gray" />
                        </span>
                    </div>
                </div>

                {/* Cart */}
                <div className="d-flex align-items-center">
                    <FaShoppingCart size={30} />
                </div>
            </div>
        </div>
    );
}

export default Header;
