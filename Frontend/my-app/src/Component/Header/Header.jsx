import { useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart } from 'react-icons/fa';

function Header() {
    const navigate = useNavigate();

    const handleSignUp = () => navigate('/register');
    const handleSignIn = () => navigate('/login');

    return (
        <div className="bg-danger text-white p-3 ">
            {/* Top links */}
            <div className="d-flex justify-content-end align-items-center mb-2">
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
            </div>

            {/* Logo + Search + Cart */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                
                {/* Logo */}
                <div className="d-flex align-items-center">
                    <h2 className="mb-0">Online Auction</h2>
                </div>

                {/* Search bar with icon */}
                <div className="flex-grow-1 mx-3">
                    <div className="input-group">
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Tra cứu sản phẩm..." 
                        />
                        <span className="input-group-text bg-white">
                            <FaSearch color="gray" />
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
