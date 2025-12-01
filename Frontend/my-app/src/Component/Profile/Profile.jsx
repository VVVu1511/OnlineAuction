import { useEffect, useState } from "react";

function Profile() {
    //display
    //edit -> save -> fetch

    const [user, setUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [bidding, setBidding] = useState([]);
    const [won, setWon] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        fullName: "",
        oldPassword: "",
        newPassword: ""
    });

    const token = localStorage.getItem("token");

    useEffect(() => {
        // Fetch extra info from backend
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        const headers = { Authorization: `Bearer ${token}` };
            if(role === "bidder") {
                const [reviewsRes, favRes, bidRes, wonRes] = await Promise.all([
                    fetch("/account/rating", { headers }),
                    fetch("/product/watchlist", { headers }),
                    fetch("/user/bidding", { headers }),
                    fetch("/account/win", { headers }),
                ]);

                setReviews(await reviewsRes.json());
                setFavorites(await favRes.json());
                setBidding(await bidRes.json());
                setWon(await wonRes.json());

            } else if(role === "seller") {
                const [sellingRes, soldRes] = await Promise.all([
                fetch("/seller/products", { headers }),
                fetch("/seller/sold", { headers }),
                ]);
                setSelling(await sellingRes.json());
                setSold(await soldRes.json());
                
            } else if(role === "administrator") {
                const [usersRes, productsRes, categoriesRes] = await Promise.all([
                fetch("/admin/users", { headers }),
                fetch("/admin/products", { headers }),
                fetch("/admin/categories", { headers }),
                ]);
                setUsers(await usersRes.json());
                setProducts(await productsRes.json());
                setCategories(await categoriesRes.json());
            }
    };



    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveChanges = async () => {
        try {
            const res = await fetch("http://localhost:3000/user", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                alert("Profile updated successfully!");
                setEditMode(false);
                fetchProfileData();
            } else {
                alert(data.message || "Failed to update profile");
            }
        } catch (err) {
            console.error(err);
            alert("Server error!");
        }
    };

    if (!user) return <p>Loading...</p>;

    return (
        <div className="container mt-4">
            <h2>Profile</h2>

            {/* Edit User Info */}
            <div className="mb-4 border p-3 rounded">
                <h4>Thông tin cá nhân</h4>
                {!editMode ? (
                    <div>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Họ tên:</strong> {user.fullName || "Chưa cập nhật"}</p>
                        <button className="btn btn-primary" onClick={() => setEditMode(true)}>Chỉnh sửa</button>
                    </div>
                ) : (
                    <div>
                        <div className="mb-2">
                            <label>Email</label>
                            <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} />
                        </div>
                        <div className="mb-2">
                            <label>Họ tên</label>
                            <input type="text" className="form-control" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                        </div>
                        <div className="mb-2">
                            <label>Mật khẩu cũ</label>
                            <input type="password" className="form-control" name="oldPassword" value={formData.oldPassword} onChange={handleInputChange} />
                        </div>
                        <div className="mb-2">
                            <label>Mật khẩu mới</label>
                            <input type="password" className="form-control" name="newPassword" value={formData.newPassword} onChange={handleInputChange} />
                        </div>
                        <button className="btn btn-success me-2" onClick={handleSaveChanges}>Lưu</button>
                        <button className="btn btn-secondary" onClick={() => setEditMode(false)}>Hủy</button>
                    </div>
                )}
            </div>

            {/* Reviews */}
            <div className="mb-4 border p-3 rounded">
                <h4>Đánh giá ({reviews.length})</h4>
                {reviews.length === 0 ? <p>Chưa có đánh giá</p> : (
                    <ul>
                        {reviews.map((r, i) => (
                            <li key={i}>
                                <strong>Rating:</strong> {r.rating} | <strong>Comment:</strong> {r.comment || "Không có nhận xét"}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Favorites */}
            <div className="mb-4 border p-3 rounded">
                <h4>Sản phẩm yêu thích ({favorites.length})</h4>
                {favorites.length === 0 ? <p>Chưa có sản phẩm yêu thích</p> : (
                    <ul>
                        {favorites.map((f, i) => <li key={i}>{f.name}</li>)}
                    </ul>
                )}
            </div>

            {/* Bidding */}
            <div className="mb-4 border p-3 rounded">
                <h4>Sản phẩm đang tham gia đấu giá ({bidding.length})</h4>
                {bidding.length === 0 ? <p>Chưa tham gia đấu giá</p> : (
                    <ul>
                        {bidding.map((b, i) => <li key={i}>{b.name} - Giá hiện tại: {b.current_price}</li>)}
                    </ul>
                )}
            </div>

            {/* Won */}
            <div className="mb-4 border p-3 rounded">
                <h4>Sản phẩm đã thắng ({won.length})</h4>
                {won.length === 0 ? <p>Chưa thắng sản phẩm nào</p> : (
                    <ul>
                        {won.map((w, i) => <li key={i}>{w.name} - Giá cuối: {w.final_price}</li>)}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Profile;
