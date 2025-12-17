import { useEffect, useState } from "react";
import ProductCard from "../ProductCard/ProductCard";
import * as accountService from "../../service/account.service";

export default function BidderProfile({ user, token }) {
    const [reviews, setReviews] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [bidding, setBidding] = useState([]);
    const [won, setWon] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [changePassword, setChangePassword] = useState(false);

    const [formData, setFormData] = useState({
        email: user.email,
        full_name: user.full_name,
        oldPassword: "",
        newPassword: ""
    });

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
            alert("Lỗi khi tải dữ liệu bidder");
        }
    };

    const handleChange = (e) =>
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const isFavorite = (product) =>
        favorites.some(f => f.id === product.id);

    const saveProfile = async () => {
        if (changePassword && !formData.oldPassword) {
            alert("Bạn cần nhập mật khẩu cũ");
            return;
        }

        try {
            const data = await accountService.updateProfile(formData);
            if (data.success) {
                alert("Cập nhật thành công!");
                setEditMode(false);
                setChangePassword(false);
                setFormData(prev => ({ ...prev, oldPassword: "", newPassword: "" }));
            }
        } catch {
            alert("Lỗi cập nhật profile");
        }
    };

    const sendUpgradeRequestHandler = async () => {
        if (!window.confirm("Gửi yêu cầu nâng cấp thành Seller?")) return;
        try {
            const data = await accountService.sendUpgradeRequest();
            alert(data.success ? "Yêu cầu đã được gửi" : data.message);
        } catch {
            alert("Lỗi gửi yêu cầu");
        }
    };

    const Card = ({ title, children }) => (
        <div className="bg-white rounded-xl shadow p-5 mb-6">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            {children}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">

            {/* PERSONAL INFO */}
            <Card title="Thông tin cá nhân">
                {!editMode ? (
                    <>
                        <p><b>Email:</b> {user.email}</p>
                        <p><b>Họ tên:</b> {user.full_name}</p>
                        <p><b>Địa chỉ:</b> {user.address}</p>

                        <button
                            onClick={() => setEditMode(true)}
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg"
                        >
                            Chỉnh sửa hồ sơ
                        </button>
                    </>
                ) : (
                    <div className="space-y-3">
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="Email"
                        />
                        <input
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2"
                            placeholder="Họ tên"
                        />

                        <button
                            onClick={() => setChangePassword(!changePassword)}
                            className="text-yellow-600 text-sm"
                        >
                            {changePassword ? "Hủy đổi mật khẩu" : "Đổi mật khẩu"}
                        </button>

                        {changePassword && (
                            <>
                                <input
                                    type="password"
                                    name="oldPassword"
                                    onChange={handleChange}
                                    placeholder="Mật khẩu cũ"
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                                <input
                                    type="password"
                                    name="newPassword"
                                    onChange={handleChange}
                                    placeholder="Mật khẩu mới"
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={saveProfile}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg"
                            >
                                Lưu
                            </button>
                            <button
                                onClick={() => {
                                    setEditMode(false);
                                    setChangePassword(false);
                                }}
                                className="px-4 py-2 bg-gray-300 rounded-lg"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* REVIEWS */}
            <Card title="Đánh giá">
                {reviews.length === 0 ? (
                    <p>Chưa có đánh giá</p>
                ) : (
                    <>
                        {(() => {
                            const positive = reviews.filter(r => r.rating > 0).length;
                            const score = ((positive / reviews.length) * 100).toFixed(0);
                            return (
                                <p>
                                    Điểm uy tín:{" "}
                                    <span className={score >= 80 ? "text-green-600" : "text-red-600"}>
                                        {score}%
                                    </span>
                                </p>
                            );
                        })()}

                        <ul className="mt-3 space-y-1">
                            {reviews.map((r, i) => (
                                <li key={i}>
                                    <span className={r.rating > 0 ? "text-green-600" : "text-red-600"}>
                                        {r.rating > 0 ? "+1" : "-1"}
                                    </span>{" "}
                                    — {r.comment}
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </Card>

            {/* PRODUCT SECTIONS */}
            {[
                ["Sản phẩm yêu thích", favorites, true],
                ["Đang đấu giá", bidding, false],
                ["Đã thắng", won, false],
            ].map(([title, list, liked], idx) => (
                <Card key={idx} title={`${title} (${list.length})`}>
                    {list.length === 0 ? (
                        <p>Không có sản phẩm</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {list.map((item, i) => (
                                <ProductCard
                                    key={i}
                                    data={item}
                                    liked={liked ? true : isFavorite(item)}
                                />
                            ))}
                        </div>
                    )}
                </Card>
            ))}

            {/* UPGRADE */}
            <Card title="Nâng cấp thành Seller">
                <button
                    onClick={sendUpgradeRequestHandler}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
                >
                    Gửi yêu cầu nâng cấp (7 ngày)
                </button>
            </Card>
        </div>
    );
}
