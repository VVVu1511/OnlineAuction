import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { LoadingContext } from "../../context/LoadingContext.jsx";
import { updateProfile, changePassword } from "../../services/account.service.jsx";
import Back from "../Back/Back.jsx";
import * as accountService from "../../services/account.service.jsx"
import * as biddingService from "../../services/bidding.service.jsx"
import ProductCard from "../ProductCard/ProductCard.jsx";

const getTimeLeft = (expire) => {
    const diff = new Date(expire) - new Date();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

    return { days, hours };
};

export default function Profile() {
    const { user, updateUser } = useContext(AuthContext);
    const { setLoading } = useContext(LoadingContext);

    const [isEditing, setIsEditing] = useState(false);

    const [profile, setProfile] = useState({
        full_name: user?.full_name || "",
        email: user?.email || "",
        address: user?.address || "",
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [reviews, setReviews] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [bidding, setBidding] = useState([]);
    const [won, setWon] = useState([]);
    const [requested, setRequested] = useState(false);
    const [expire, setExpire] = useState(null);

    /* ================= EDIT ================= */
    const handleEdit = () => {
        setProfile({
            full_name: user.full_name || "",
            email: user.email || "",
            address: user.address || "",
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const sendUpgradeRequestHandler = async () => {
        if (!window.confirm("Gửi yêu cầu nâng cấp thành Seller?")) return;
        
        try {
            const data = await accountService.requestSell(user?.id);
            
            loadBidderData();

            alert(data.success ? "Yêu cầu đã được gửi" : data.message);

        } catch(err) {
            alert("Lỗi gửi yêu cầu" + err);
        }
    };

    /* ================= UPDATE PROFILE ================= */
    const handleUpdateProfile = async () => {
        try {
            setLoading(true);

            const updated = await updateProfile(
                {
                    full_name: profile.full_name,
                    address: profile.address,
                },
                user.id
            );


            updateUser(updated); // cập nhật AuthContext
            setIsEditing(false);
            alert("Cập nhật thông tin thành công");

        } catch {
            alert("Cập nhật thất bại");
        } finally {
            setLoading(false);
        }
    };

    /* ================= CHANGE PASSWORD ================= */
    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Mật khẩu xác nhận không khớp");
            return;
        }

        try {
            setLoading(true);

            await changePassword(
                {
                    old_password: passwordData.oldPassword,
                    new_password: passwordData.newPassword,
                },
                user.id
            );

            setPasswordData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            alert("Đổi mật khẩu thành công");
        } catch {
            alert("Đổi mật khẩu thất bại");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(user?.role === "bidder"){
            loadBidderData();
        } 
    }, [user]);

    const loadBidderData = async () => {
        try {
            const [reviewsRes, favRes, bidRes, wonRes] = await Promise.all([
                accountService.getRatings(user.id),
                accountService.getWatchlist(user.id),
                biddingService.getMyBidding(user.id),
                accountService.getWonProducts(user.id),
            ]);

            console.log(reviewsRes);

            setReviews(reviewsRes.data || []);
            setFavorites(favRes.data || []);
            setBidding(bidRes.data || []);
            setWon(wonRes.data || []);

            accountService.getRequestSellState(user.id)
                .then(data => {
                    setRequested(data.requested);
                    setExpire(data.request_expire);
                })

        } catch (err) {
            alert("Lỗi khi tải dữ liệu bidder");
        }
    };
    
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const openRate = (item) => {
        setSelected(item);
        setOpen(true);
    };

    const closeRate = () => {
        setOpen(false);
        setSelected(null);
    };

    const isProfileValid =
        profile.full_name?.trim() !== "" &&
        profile.address?.trim() !== "";

    const isPasswordValid =
        passwordData.oldPassword.trim() !== "" &&
        passwordData.newPassword.length >= 6 &&
        passwordData.newPassword === passwordData.confirmPassword;

    return (
        <div className="max-w-7xl mx-auto px-4 space-y-8">
            <Back />
            
            {/* ================= PROFILE ================= */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">
                        Thông tin cá nhân
                    </h2>

                    {!isEditing && (
                        <button
                            onClick={handleEdit}
                            className="text-blue-600 font-medium"
                        >
                            Chỉnh sửa
                        </button>
                    )}
                </div>
                
                <div className="space-y-3">
                    <input
                        className={`border p-2 rounded w-full ${
                            isEditing && profile.full_name.trim() === ""
                                ? "border-red-500"
                                : ""
                        }`}
                        placeholder="Họ tên"
                        value={isEditing ? profile.full_name : user?.full_name}
                        disabled={!isEditing}
                        onChange={e =>
                            setProfile({ ...profile, full_name: e.target.value })
                        }
                    />

                    <input
                        className="border p-2 rounded w-full bg-gray-100"
                        value={user?.email}
                        disabled
                    />

                    <input
                        className={`border p-2 rounded w-full ${
                            isEditing && profile.address.trim() === ""
                                ? "border-red-500"
                                : ""
                        }`}
                        placeholder="Địa chỉ"
                        value={isEditing ? profile.address : user?.address}
                        disabled={!isEditing}
                        onChange={e =>
                            setProfile({ ...profile, address: e.target.value })
                        }
                    />

                    {isEditing && (
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={handleUpdateProfile}
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                                disabled={!isProfileValid}
                            >
                                Lưu
                            </button>

                            <button
                                onClick={handleCancel}
                                className="border px-4 py-2 rounded"
                            >
                                Huỷ
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* ================= PASSWORD ================= */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Đổi mật khẩu</h2>

                <div className="space-y-3">
                    <input
                        type="password"
                        className={`border p-2 rounded w-full ${
                            passwordData.oldPassword === "" ? "border-red-500" : ""
                        }`}
                        placeholder="Mật khẩu hiện tại"
                        value={passwordData.oldPassword}
                        onChange={e =>
                            setPasswordData({
                                ...passwordData,
                                oldPassword: e.target.value,
                            })
                        }
                    />

                    <input
                        type="password"
                        className={`border p-2 rounded w-full ${
                            passwordData.newPassword.length > 0 &&
                            passwordData.newPassword.length < 6
                                ? "border-red-500"
                                : ""
                        }`}
                        placeholder="Mật khẩu mới (≥ 6 ký tự)"
                        value={passwordData.newPassword}
                        onChange={e =>
                            setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value,
                            })
                        }
                    />

                    <input
                        type="password"
                        className={`border p-2 rounded w-full ${
                            passwordData.confirmPassword &&
                            passwordData.confirmPassword !== passwordData.newPassword
                                ? "border-red-500"
                                : ""
                        }`}
                        placeholder="Xác nhận mật khẩu mới"
                        value={passwordData.confirmPassword}
                        onChange={e =>
                            setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value,
                            })
                        }
                    />


                    <button
                        disabled={!isPasswordValid}
                        className={`px-4 py-2 rounded text-white ${
                            isPasswordValid
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gray-400 cursor-not-allowed"
                        }`}
                    >
                        Đổi mật khẩu
                    </button>
                </div>

            </section>

            {/* BIDDER */}
            {
                user?.role === "bidder" && (
                    <>
                        {/* REVIEWS */}
                            <h2>Đánh giá</h2>
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

                        <h2>Sản phẩm đã thắng</h2>
                            {won.length === 0 ? (
                                <p>Không có sản phẩm</p>
                            ) : (
                                <div className="
                                    grid grid-cols-2 
                                    sm:grid-cols-3 
                                    md:grid-cols-4 
                                    lg:grid-cols-5 
                                    gap-6
                                ">
                                    {won.map((item, i) => (
                                        <div
                                            key={i}
                                            className="
                                                relative
                                                rounded-xl
                                                overflow-hidden
                                                bg-white
                                                border
                                                shadow-sm
                                                transition-all
                                                duration-300
                                                hover:shadow-2xl
                                                hover:-translate-y-1
                                                hover:border-blue-400
                                            "
                                        >
                                            {won.map((item, i) => (
                                                <div key={i} className="relative rounded-xl bg-white border shadow-sm">
                                                    <ProductCard product={item} />

                                                    {/* <button
                                                        onClick={() => openRate(item)}
                                                        className="
                                                            absolute bottom-2 right-2
                                                            rounded-lg bg-blue-600 px-3 py-1
                                                            text-sm text-white hover:bg-blue-700
                                                        "
                                                    >
                                                        Đánh giá
                                                    </button> */}
                                                </div>
                                            ))}

                                        </div>
                                    ))}
                                </div>
                            )}

                        {/* PRODUCT SECTIONS */}
                            <h2>Sản phẩm đang tham gia đấu giá</h2>
                            {bidding.length === 0 ? (
                                <p>Không có sản phẩm</p>
                            ) : (
                                <div className="
                                    grid grid-cols-2 
                                    sm:grid-cols-3 
                                    md:grid-cols-4 
                                    lg:grid-cols-5 
                                    gap-6
                                ">
                                    {bidding.map((item, i) => (
                                        <div
                                            key={i}
                                            className="
                                                relative
                                                rounded-xl
                                                overflow-hidden
                                                bg-white
                                                border
                                                shadow-sm
                                                transition-all
                                                duration-300
                                                hover:shadow-2xl
                                                hover:-translate-y-1
                                                hover:border-blue-400
                                                focus-within:ring-2
                                                focus-within:ring-blue-300
                                            "
                                        >
                                            <ProductCard product={item} />
                                        </div>
                                    ))}
                                </div>
                            )}

                        {/* PRODUCT SECTIONS */}
                            <h2>Sản phẩm yêu thích</h2>
                            {favorites.length === 0 ? (
                                <p>Không có sản phẩm</p>
                            ) : (
                                <div className="
                                    grid grid-cols-2 
                                    sm:grid-cols-3 
                                    md:grid-cols-4 
                                    lg:grid-cols-5 
                                    gap-6
                                ">
                                    {favorites.map((item, i) => (
                                        <div
                                            key={i}
                                            className="
                                                relative
                                                rounded-xl
                                                overflow-hidden
                                                bg-white
                                                border
                                                shadow-sm
                                                transition-all
                                                duration-300
                                                hover:shadow-2xl
                                                hover:-translate-y-1
                                                hover:border-blue-400
                                                focus-within:ring-2
                                                focus-within:ring-blue-300
                                            "
                                        >
                                            <ProductCard product={item} />
                                        </div>
                                    ))}
                                </div>
                            )}

                        {/* UPGRADE */}
                        <div className="mt-6">
                            {!requested ? (
                                <>
                                    <h2 className="text-lg font-semibold mb-2">
                                        Yêu cầu nâng cấp
                                    </h2>

                                    <button
                                        onClick={sendUpgradeRequestHandler}
                                        className="
                                            px-5 py-2
                                            bg-yellow-500
                                            text-white
                                            rounded-lg
                                            font-medium
                                            hover:bg-yellow-600
                                            transition
                                        "
                                    >
                                        Gửi yêu cầu nâng cấp (7 ngày)
                                    </button>
                                </>
                            ) : (
                                (() => {
                                    const timeLeft = getTimeLeft(expire);
                                    return (
                                        <div className="
                                            bg-green-50
                                            border
                                            border-green-200
                                            text-green-700
                                            px-4 py-3
                                            rounded-lg
                                        ">
                                            <p className="font-medium">
                                                Yêu cầu nâng cấp đã được gửi
                                            </p>

                                            {timeLeft ? (
                                                <p className="text-sm mt-1">
                                                    Thời gian còn lại:{" "}
                                                    <span className="font-semibold">
                                                        {timeLeft.days} ngày {timeLeft.hours} giờ
                                                    </span>
                                                </p>
                                            ) : (
                                                <p className="text-sm text-red-500 mt-1">
                                                    Yêu cầu đã hết hạn
                                                </p>
                                            )}
                                        </div>
                                    );
                                })()
                            )}
                        </div>

                        {selected && open && (
                            <RateModal
                                open={open}
                                onClose={closeRate}
                                onSubmit={(rating, comment) =>
                                    biddingService.rateSeller(
                                        selected.seller,
                                        selected.id,
                                        comment,
                                        rating
                                    )
                                }
                            />
                        )}
                    </>
                )
            }
        </div>
    );
}

function RateModal({ open, onClose, onSubmit }) {
    const [rating, setRating] = useState("");
    const [comment, setComment] = useState("");
    const { loading, setLoading } = useContext(LoadingContext);

    // ✅ Reset khi modal đóng
    useEffect(() => {
        if (!open) {
            setRating("");
            setComment("");
        }
    }, [open]);

    if (!open) return null;

    const handleSubmit = async () => {
    if (!rating) return;

    setLoading(true);
        try {
            await onSubmit(Number(rating), comment);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            onClose(); // 👈 LUÔN ĐÓNG
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-semibold">
                    Đánh giá người bán
                </h3>

                <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full mb-4 rounded border px-3 py-2"
                >
                    <option value="">-- Chọn đánh giá --</option>
                    <option value="1">👍 Tốt</option>
                    <option value="-1">👎 Không tốt</option>
                </select>

                <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full mb-4 rounded border p-3"
                    placeholder="Nhận xét (không bắt buộc)"
                />

                <div className="flex justify-end gap-3">
                    <button onClick={onClose}>Hủy</button>
                    <button
                        disabled={!rating || loading}
                        onClick={handleSubmit}
                    >
                        {loading ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                </div>
            </div>
        </div>
    );
}
