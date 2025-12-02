import { useEffect, useState } from "react";

export default function BidderProfile({ user, token }) {
    const [reviews, setReviews] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [bidding, setBidding] = useState([]);
    const [won, setWon] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [upgradeRequestSent, setUpgradeRequestSent] = useState(false);

    const [formData, setFormData] = useState({
        email: user.email,
        fullName: user.full_name,
        oldPassword: "",
        newPassword: ""
    });

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };

    useEffect(() => {
        loadBidderData();
    }, []);

    const loadBidderData = async () => {        
        const [reviewsRes, favRes, bidRes, wonRes] = await Promise.all([
            fetch("http://localhost:3000/account/rating", { headers }),
            fetch("http://localhost:3000/account/watchlist", { headers }),
            fetch("http://localhost:3000/bidding", { headers }),
            fetch("http://localhost:3000/account/win", { headers }),
        ]);

        const reviewsJson = await reviewsRes.json();
        const favJson = await favRes.json();
        const bidJson = await bidRes.json();
        const wonJson = await wonRes.json();

        setReviews(reviewsJson.data);
        setFavorites(favJson.data);
        setBidding(bidJson.data);
        setWon(wonJson.data);
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const saveProfile = async () => {
        const res = await fetch("/account", {
            method: "PUT",
            headers,
            body: JSON.stringify(formData)
        });
        const data = await res.json();

        if (data.success) {
            alert("Cập nhật thành công!");
            setEditMode(false);
        } else {
            alert(data.message || "Lỗi cập nhật thông tin");
        }
    };

    const sendUpgradeRequest = async () => {
        if (!window.confirm("Gửi yêu cầu nâng cấp thành Seller?")) return;

        const res = await fetch("/account/upgrade", {
            method: "POST",
            headers
        });

        const data = await res.json();
        if (data.success) {
            alert("Yêu cầu đã được gửi. Admin sẽ duyệt trong 7 ngày.");
            setUpgradeRequestSent(true);
        } else {
            alert(data.message || "Không gửi được yêu cầu.");
        }
    };

    return (
        <div className="container mt-3">

            {/* ==== PERSONAL INFO ==== */}
            <div className="border p-3 rounded mt-3">
                <h4>Thông tin cá nhân</h4>

                {!editMode ? (
                    <>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Họ tên:</strong> {user.full_name}</p>
                        <p><strong>Địa chỉ:</strong> {user.address}</p>
                        <button className="btn btn-primary" onClick={() => setEditMode(true)}>
                            Chỉnh sửa hồ sơ
                        </button>
                    </>
                ) : (
                    <>
                        <div className="mb-2">
                            <label>Email</label>
                            <input className="form-control" name="email" value={formData.email} onChange={handleChange}/>
                        </div>
                        <div className="mb-2">
                            <label>Họ tên</label>
                            <input className="form-control" name="fullName" value={formData.fullName} onChange={handleChange}/>
                        </div>
                        <div className="mb-2">
                            <label>Mật khẩu cũ</label>
                            <input type="password" className="form-control" name="oldPassword" onChange={handleChange}/>
                        </div>
                        <div className="mb-2">
                            <label>Mật khẩu mới</label>
                            <input type="password" className="form-control" name="newPassword" onChange={handleChange}/>
                        </div>

                        <button className="btn btn-success me-2" onClick={saveProfile}>Lưu</button>
                        <button className="btn btn-secondary" onClick={() => setEditMode(false)}>Hủy</button>
                    </>
                )}
            </div>

            {/* ==== REVIEWS ==== */}
            <div className="border p-3 rounded mt-3">
                <h4>Điểm đánh giá ({reviews.length})</h4>

                {reviews.length === 0 ? (
                    <p>Chưa có đánh giá</p>
                ) : (
                    <ul>
                        {reviews.map((r, i) => (
                            <li key={i}>
                                <strong>{r.rating > 0 ? "+1" : "-1"}</strong> — {r.comment}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* ==== FAVORITES ==== */}
            <div className="border p-3 rounded mt-3">
                <h4>Sản phẩm yêu thích ({favorites.length})</h4>

                {favorites.length === 0 ? <p>Không có sản phẩm nào</p> : (
                    <ul>
                        {favorites.map((f, i) => (
                            <li key={i}>{f.name}</li>
                        ))}
                    </ul>
                )}
            </div>

            {/* ==== BIDDING ==== */}
            <div className="border p-3 rounded mt-3">
                <h4>Sản phẩm đang đấu giá ({bidding.length})</h4>

                {bidding.length === 0 ? <p>Chưa đấu giá sản phẩm nào</p> : (
                    <ul>
                        {bidding.map((b, i) => (
                            <li key={i}>{b.name} – Giá hiện tại: {b.current_price.toLocaleString()}</li>
                        ))}
                    </ul>
                )}
            </div>

            {/* ==== WON PRODUCTS ==== */}
            <div className="border p-3 rounded mt-3">
                <h4>Sản phẩm đã thắng ({won.length})</h4>

                {won.length === 0 ? <p>Chưa thắng sản phẩm nào</p> : (
                    <ul>
                        {won.map((w, i) => (
                            <li key={i}>{w.name} – Giá cuối: {w.current_price.toLocaleString()}</li>
                        ))}
                    </ul>
                )}
            </div>

            {/* ==== UPGRADE TO SELLER ==== */}
            <div className="border p-3 rounded mt-3 mb-5">
                <h4>Nâng cấp thành Seller</h4>

                {upgradeRequestSent ? (
                    <p>Yêu cầu đã gửi. Vui lòng chờ Admin duyệt.</p>
                ) : (
                    <button className="btn btn-warning" onClick={sendUpgradeRequest}>
                        Gửi yêu cầu nâng cấp (7 ngày)
                    </button>
                )}
            </div>
        </div>
    );
}
