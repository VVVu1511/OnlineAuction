import { useEffect, useState } from "react";
import ProductCard from "../ProductCard/ProductCard";
import * as accountService from "../../service/account.service.jsx"
import * as biddingService from "../../service/bidding.service.jsx"

export default function BidderProfile({ user, token }) {
    const [reviews, setReviews] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [bidding, setBidding] = useState([]);
    const [won, setWon] = useState([]);
    const [editMode, setEditMode] = useState(false);

    // NEW: toggle riêng cho phần đổi password
    const [changePassword, setChangePassword] = useState(false);

    const [formData, setFormData] = useState({
        email: user.email,
        full_name: user.full_name,
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
        try {
            const [reviewsRes, favRes, bidRes, wonRes] = await Promise.all([
                accountService.getRatings(),
                accountService.getWatchlist(),
                accountService.getMyBidding(),
                accountService.getWonProducts(),
            ]);

            setReviews(reviewsRes.data || []);
            setFavorites(favRes.data || []);
            setBidding(bidRes.data || []);
            setWon(wonRes.data || []);
        } catch (err) {
            console.error("Load bidder data error:", err);
            alert(err.response?.data?.message || "Lỗi khi tải dữ liệu bidder");
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const isFavorite = (product) => {
        return favorites.some(f => f.id === product.id);
    };


    const saveProfile = async () => {
        // Nếu người dùng đổi password → bắt buộc nhập password cũ
        if (changePassword && !formData.oldPassword) {
            alert("Bạn cần nhập mật khẩu cũ để đổi mật khẩu");
            return;
        }

        try {
            const data = await accountService.updateProfile(formData);

            if (data.success) {
                alert("Cập nhật thành công!");

                setEditMode(false);
                setChangePassword(false);
                setFormData(prev => ({
                    ...prev,
                    oldPassword: "",
                    newPassword: ""
                }));
            } else {
                alert(data.message || "Lỗi cập nhật thông tin");
            }
        } catch (err) {
            console.error("Update profile error:", err);
            alert(err.response?.data?.message || "Lỗi khi cập nhật profile");
        }
    };

    const sendUpgradeRequestHandler = async () => {
        if (!window.confirm("Gửi yêu cầu nâng cấp thành Seller?")) return;

        try {
            const data = await accountService.sendUpgradeRequest();

            if (data.success) {
                alert("Yêu cầu đã được gửi. Admin sẽ duyệt trong 7 ngày.");
            } else {
                alert(data.message || "Không gửi được yêu cầu.");
            }
        } catch (err) {
            console.error("Upgrade request error:", err);
            alert(err.response?.data?.message || "Lỗi khi gửi yêu cầu nâng cấp");
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
                            <input
                                className="form-control"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-2">
                            <label>Họ tên</label>
                            <input
                                className="form-control"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Nút đổi mật khẩu */}
                        <button
                            className="mt-2 btn btn-warning mb-2 me-2"
                            onClick={() => setChangePassword(!changePassword)}
                        >
                            {changePassword ? "Hủy đổi mật khẩu" : "Đổi mật khẩu"}
                        </button>

                        {changePassword && (
                            <>
                                <div className="mb-2">
                                    <label>Mật khẩu cũ</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="oldPassword"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label>Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="newPassword"
                                        onChange={handleChange}
                                    />
                                </div>
                            </>
                        )}

                        <button className="btn btn-success me-2" onClick={saveProfile}>
                            Lưu
                        </button>

                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setEditMode(false);
                                setChangePassword(false);
                            }}
                        >
                            Hủy
                        </button>
                    </>
                )}
            </div>

            {/* ==== REVIEWS ==== */}
            <div className="border p-3 rounded mt-3">
                <h4>Đánh giá</h4>

                {reviews.length === 0 ? (
                    <p>Chưa có đánh giá</p>
                ) : (
                    <>
                        {/* Tính toán */}
                        {(() => {
                            const total = reviews.length;
                            const positive = reviews.filter(r => r.rating > 0).length;
                            const score = ((positive / total) * 100).toFixed(0);

                            return (
                                <div className="mb-3">
                                    <p><strong>Số lượng đánh giá:</strong> {total}</p>
                                    <p>
                                        <strong>Điểm:</strong>{" "}
                                        <span className={score >= 80 ? "text-success" : "text-danger"}>
                                            {score}%
                                        </span>
                                    </p>
                                </div>
                            );
                        })()}

                        {/* Danh sách đánh giá */}
                        <h5 className="mb-2">Chi tiết các lần đánh giá:</h5>

                        {/* Danh sách đánh giá, bỏ bullet */}
                        <ul className="list-unstyled">
                            {reviews.map((r, i) => (
                                <li key={i} className="mb-1">
                                    <strong className={r.rating > 0 ? "text-success" : "text-danger"}>
                                        {r.rating > 0 ? "+1" : "-1"}
                                    </strong>{" "}— {r.comment}
                                </li>
                            ))}
                        </ul>
                                </>
                        )}
            </div>


            {/* ==== FAVORITES ==== */}
            <div className="border p-3 rounded mt-3">
                <h4>Sản phẩm yêu thích ({favorites.length})</h4>

                {favorites.length === 0 ? <p>Không có sản phẩm nào</p> : (
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 
                        row-cols-lg-4 row-cols-xl-5 g-3 mt-3">
                        {favorites.map((f, i) => (
                            <div className="col" key={i}>
                                <ProductCard data={f} liked={true} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ==== BIDDING ==== */}
            <div className="border p-3 rounded mt-3">
                <h4>Sản phẩm đang đấu giá ({bidding.length})</h4>

                {bidding.length === 0 ? <p>Chưa đấu giá sản phẩm nào</p> : (
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 
                        row-cols-lg-4 row-cols-xl-5 g-3 mt-3">
                        {bidding.map((b, i) => (
                            <div className="col" key={i}>
                                <ProductCard data={b} liked={isFavorite(b)} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ==== WON ==== */}
            <div className="border p-3 rounded mt-3">
                <h4>Sản phẩm đã thắng ({won.length})</h4>

                {won.length === 0 ? <p>Chưa thắng sản phẩm nào</p> : (
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 
                        row-cols-lg-4 row-cols-xl-5 g-3 mt-3">
                        {won.map((w, i) => (
                            <div className="col" key={i}>
                                <ProductCard data={w} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ==== UPGRADE ==== */}
            <div className="border p-3 rounded mt-3 mb-5">
                <h4>Nâng cấp thành Seller</h4>
                <button className="btn btn-warning" onClick={sendUpgradeRequest}>
                    Gửi yêu cầu nâng cấp (7 ngày)
                </button>
            </div>
        </div>
    );
}
