import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import Back from "../Back/Back.jsx";
import * as orderService from "../../services/order.service.jsx";
import { useParams } from "react-router-dom";
import { useConfirmModal } from "../../context/ConfirmModalContext";
import { useResultModal } from "../../context/ResultModalContext";

export default function OrderCompletion() {
    const { user } = useContext(AuthContext);
    const { id } = useParams(); 
    const productId = Number(id);
    const sellerId = user?.id;
    const { showResult } = useResultModal();
    const {showConfirm} = useConfirmModal();

    const [orderStatus, setOrderStatus] = useState("");
    const [chat, setChat] = useState([]);
    const [review, setReview] = useState({ score: null, comment: "" });

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviews, setReviews] = useState([]);

    const handleCancel = () => {
        showConfirm({
            title: "Huỷ đơn hàng",
            message: "Bạn có chắc chắn muốn huỷ đơn hàng này không?",
            onConfirm: async () => {
                try {
                    await orderService.cancelOrder(productId, sellerId);

                    setOrderStatus("CANCELLED");

                    showResult({
                        success: true,
                        message: "Huỷ đơn hàng thành công"
                    });
                } catch (err) {
                    console.error(err);

                    showResult({
                        success: false,
                        message:
                            err.response?.data?.message ||
                            "Có lỗi xảy ra khi huỷ đơn"
                    });
                }
            }
        });
    };

    const loadChat = useCallback(async () => {
        try {
            const res = await orderService.getOrderChat(productId);

            if (res?.success) {
                setChat(
                    res.data.map(c => ({
                        user: c.sender_id,
                        msg: c.message,
                    }))
                );
            }
        } catch (err) {
            console.error("Load chat failed", err);
        }
    }, [productId]);

    const fetchOrder = useCallback(async () => {
        try {
            const data = await orderService.getOrderByProduct(productId);

            setOrder(data);
            setOrderStatus(data.status);
        } catch (err) {
            setError("Không tìm thấy đơn hàng");
        } finally {
            setLoading(false);
        }
    }, [productId]);

    const loadReviews = useCallback(async () => {
        if (!order?.id) return;

        const res = await orderService.getOrderReviews(order.id);
        if (res.success) setReviews(res.data);
    }, [order?.id]);

    useEffect(() => {
        if (!productId) return;
        loadChat();
        fetchOrder();
    }, [productId]);

    useEffect(() => {
        if (order?.id) {
            loadReviews();
        }
    }, [order?.id]);

    const userHasReviewed = reviews.some(
        r => r.reviewer_id === user.id
    );

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Back />
            
            <h1 className="text-2xl font-bold">Hoàn tất đơn hàng</h1>

            {orderStatus === "BUYER_SUBMIT_PAYMENT" && (
                user?.role === "bidder" ? (
                    <BuyerPayment
                        productId={productId}
                        buyerId={user.id}
                        onSuccess={fetchOrder}
                    />
                ) : (
                    <>
                        <WaitingBox message="Đang chờ người mua thanh toán & cung cấp địa chỉ" />
                        <button onClick={handleCancel} className="rounded-lg border border-red-300 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition mb-3">
                            Huỷ giao dịch
                        </button>
                    </>

                )
            )}

            {orderStatus === "SELLER_CONFIRM_PAYMENT" && (
                user?.role === "seller" ? (
                    <SellerConfirm
                        productId={productId}
                        sellerId={user.id}
                        onConfirm={fetchOrder}
                        order={order}
                    />
                ) : (
                    <>
                        <WaitingBox message="Đang chờ người bán xác nhận thanh toán & gửi hàng" />
                        
                        <button onClick={handleCancel} className="rounded-lg border border-red-300 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition">
                            Huỷ giao dịch
                        </button>
                    </>
                )
            )}

            {orderStatus === "BUYER_CONFIRM_RECEIVE" && (
                user?.role === "bidder" ? (
                    <BuyerReceive
                        productId={productId}
                        buyerId={user.id}
                        onConfirm={fetchOrder}
                        order={order}
                    />
                ) : (
                    <WaitingBox message="Đang chờ người mua xác nhận đã nhận hàng" />
                )
            )}

            {/* MỞ ĐÁNH GIÁ */}
            {orderStatus === "RATING_OPEN" && (
                userHasReviewed ? (
                    <WaitingBox message="Bạn đã đánh giá, đang chờ đối phương đánh giá" />
                ) : (
                    <ReviewSection
                        productId={productId}
                        userId={user.id}
                        review={review}
                        setReview={setReview}
                        reviews={reviews}
                        onSuccess={() => {
                            fetchOrder();
                            loadReviews();
                        }}
                    />
                )
            )}

            {/* STATE CUỐI */}
            {orderStatus === "COMPLETED" && (
                <ReviewResult 
                    reviews={reviews} 
                    userId={user.id} 
                    productId={productId}
                    onUpdated={() => loadReviews()}
                />
            )}

            {orderStatus === "CANCELLED" && (
                <div className="p-4 bg-red-100 text-red-700 rounded">
                    Giao dịch đã bị huỷ bởi người bán
                </div>
            )}

            <ChatBox
                productId={productId}
                chat={chat}
                setChat={setChat}
                user={user}
                onSuccess={() => fetchOrder()}
            />
        </div>
    );
}

/* ================= BUYER PAYMENT ================= */
function BuyerPayment({ productId, buyerId, onSuccess}) {
    const [paymentInfo, setPaymentInfo] = useState("");
    const [address, setAddress] = useState("");
    const [errors, setErrors] = useState({});
    const { showConfirm } = useConfirmModal();
    const { showResult } = useResultModal();

    const submit = async () => {
        const newErrors = {};

        if (!paymentInfo.trim()) {
            newErrors.paymentInfo = "Vui lòng nhập hóa đơn thanh toán";
        }

        if (!address.trim()) {
            newErrors.address = "Vui lòng nhập địa chỉ giao hàng";
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length) return;

        showConfirm({
            title: "Xác nhận thông tin thanh toán",
            message: (
                <div className="space-y-3 text-sm">
                    <div>
                        <p className="font-semibold text-gray-700">Hóa đơn thanh toán:</p>
                        <p className="bg-gray-100 p-2 rounded">{paymentInfo}</p>
                    </div>

                    <div>
                        <p className="font-semibold text-gray-700">Địa chỉ giao hàng:</p>
                        <p className="bg-gray-100 p-2 rounded">{address}</p>
                    </div>

                    <p className="text-orange-600 text-xs">
                        Vui lòng kiểm tra kỹ trước khi xác nhận
                    </p>
                </div>
            ),
            onConfirm: async () => {
                try {
                    await orderService.submitPayment(
                        productId,
                        buyerId,
                        paymentInfo,
                        address
                    );

                    showResult({
                        success: true,
                        message: "Đã gửi thông tin thanh toán thành công"
                    });

                    onSuccess?.(); // callback sau khi thành công
                } catch (err) {
                    console.error("Submit payment error:", err);

                    showResult({
                        success: false,
                        message:
                            err.response?.data?.message ||
                            "Gửi thông tin thanh toán thất bại"
                    });
                }
            }
        });
    };

    return (
        <div className="rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold">1️⃣ Thanh toán & địa chỉ</h2>

            <div>
                <input
                    className="border w-full p-2"
                    placeholder="Hóa đơn thanh toán"
                    value={paymentInfo}
                    onChange={(e) => {
                        setPaymentInfo(e.target.value);
                        if (errors.paymentInfo) setErrors(prev => ({ ...prev, paymentInfo: "" }));
                    }}
                />
                {errors.paymentInfo && (
                    <p className="text-sm text-red-600 mt-1">{errors.paymentInfo}</p>
                )}
            </div>

            <div>
                <input
                    className="border w-full p-2"
                    placeholder="Địa chỉ giao hàng"
                    value={address}
                    onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) setErrors(prev => ({ ...prev, address: "" }));
                    }}
                />
                {errors.address && (
                    <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                )}
            </div>

            <button onClick={submit} className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
                Gửi thông tin
            </button>
        </div>
    );
}

/* ================= SELLER CONFIRM ================= */
function SellerConfirm({ productId, sellerId, onConfirm, order }) {
    const [shippingInfo, setShippingInfo] = useState("");
    const [error, setError] = useState("");
    const { showConfirm } = useConfirmModal();
    const { showResult } = useResultModal();

    const confirm = async () => {
        if (!shippingInfo.trim()) {
            setError("Vui lòng nhập hóa đơn vận chuyển");
            return;
        }

        showConfirm({
            title: "Xác nhận thông tin vận chuyển",
            message: (
                <div className="space-y-3 text-sm">
                    <div>
                        <p className="font-semibold text-gray-700">Hóa đơn vận chuyển:</p>
                        <p className="bg-gray-100 p-2 rounded">{shippingInfo}</p>
                    </div>

                    <p className="text-orange-600 text-xs">
                        Vui lòng kiểm tra kỹ trước khi xác nhận gửi
                    </p>
                </div>
            ),
            onConfirm: async () => {
                try {
                    await orderService.confirmShipping(
                        productId,
                        sellerId,
                        shippingInfo
                    );

                    showResult({
                        success: true,
                        message: "Đã xác nhận gửi hàng thành công"
                    });

                    onConfirm?.(); // callback cập nhật state / reload
                } catch (err) {
                    console.error("Confirm shipping error:", err);

                    showResult({
                        success: false,
                        message:
                            err.response?.data?.message ||
                            "Xác nhận vận chuyển thất bại"
                    });
                }
            }
        });
    };

    return (
        <div className="border p-4 rounded space-y-3">
            <h2 className="font-semibold">2️⃣ Xác nhận & vận chuyển</h2>

            <p>{order.buyer_payment_info}</p>

            <input
                className="border w-full p-2"
                placeholder="Hoá đơn vận chuyển"
                value={shippingInfo}
                onChange={(e) => {
                    setShippingInfo(e.target.value);
                    if (error) setError("");
                }}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3 pt-2">
                <button onClick={confirm} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
                    Xác nhận đã gửi
                </button>
            </div>
        </div>
    );
}

/* ================= BUYER RECEIVE ================= */
function BuyerReceive({ productId, buyerId, onConfirm, order }) {
    const { showConfirm } = useConfirmModal();
    const { showResult } = useResultModal();

    const handleConfirmReceive = async () => {
        showConfirm({
            title: "Xác nhận đã nhận hàng",
            message: (
                <div className="text-sm space-y-2">
                    <p>
                        Bạn xác nhận rằng <b>đã nhận được sản phẩm</b> từ người bán?
                    </p>
                    <p className="text-orange-600 text-xs">
                        Sau khi xác nhận, bạn sẽ có thể đánh giá giao dịch.
                    </p>
                </div>
            ),
            onConfirm: async () => {
                try {
                    await orderService.confirmReceive(productId, buyerId);

                    showResult({
                        success: true,
                        message: "Xác nhận đã nhận hàng thành công"
                    });

                    onConfirm?.(); // reload / cập nhật trạng thái đơn
                } catch (err) {
                    console.error("Confirm receive error:", err);

                    showResult({
                        success: false,
                        message:
                            err.response?.data?.message ||
                            "Xác nhận nhận hàng thất bại"
                    });
                }
            }
        });
    };

    return (
        <div className="border p-4 rounded">
            <h2 className="font-semibold">3️⃣ Xác nhận nhận hàng</h2>

            <p>{order.seller_shipping_info}</p>

            <button
                onClick={handleConfirmReceive}
                className="mt-3 w-full rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 transition"
            >
                Tôi đã nhận hàng
            </button>
        </div>
    );
}

/* ================= REVIEW ================= */
function ReviewSection({ productId, userId, review, setReview, reviews, onSuccess }) {
    const [errors, setErrors] = useState({});
    const { showConfirm } = useConfirmModal();
    const { showResult } = useResultModal();

    const submit = async () => {
        const newErrors = {};

        if (!review.score) {
            newErrors.score = "Vui lòng chọn đánh giá";
        }

        if (!review.comment.trim()) {
            newErrors.comment = "Vui lòng nhập nhận xét";
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length) return;

        showConfirm({
            title: "Xác nhận đánh giá",
            message: (
                <div className="space-y-3 text-sm">
                    <div>
                        <p className="font-semibold text-gray-700">Điểm đánh giá:</p>
                        <p className="bg-gray-100 p-2 rounded">
                            {review.score}
                        </p>
                    </div>

                    <div>
                        <p className="font-semibold text-gray-700">Nhận xét:</p>
                        <p className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
                            {review.comment}
                        </p>
                    </div>

                    <p className="text-orange-600 text-xs">
                        Đánh giá không thể chỉnh sửa sau khi gửi
                    </p>
                </div>
            ),
            onConfirm: async () => {
                try {
                    await orderService.submitReview(
                        productId,
                        userId,
                        review.score,
                        review.comment
                    );

                    setReview({ score: null, comment: "" });

                    showResult({
                        success: true,
                        message: "Gửi đánh giá thành công"
                    });

                    onSuccess?.();
                } catch (err) {
                    console.error("Submit review error:", err);

                    showResult({
                        success: false,
                        message:
                            err.response?.data?.message ||
                            "Gửi đánh giá thất bại"
                    });
                }
            }
        });
    };

    return (
        <div className="border p-4 rounded space-y-2">
            <h2 className="font-semibold">4️⃣ Đánh giá giao dịch</h2>

            <select
                className="border p-2"
                value={review.score ?? ""}
                onChange={(e) => {
                    setReview({ ...review, score: Number(e.target.value) });
                    if (errors.score) setErrors(prev => ({ ...prev, score: "" }));
                }}
            >
                <option value="">Chọn đánh giá</option>
                <option value={1}>👍 Tốt</option>
                <option value={-1}>👎 Không tốt</option>
            </select>
            {errors.score && <p className="text-sm text-red-600">{errors.score}</p>}

            <textarea
                className="border w-full p-2"
                placeholder="Nhận xét"
                value={review.comment}
                onChange={(e) => {
                    setReview({ ...review, comment: e.target.value });
                    if (errors.comment) setErrors(prev => ({ ...prev, comment: "" }));
                }}
            />
            {errors.comment && <p className="text-sm text-red-600">{errors.comment}</p>}

            <button onClick={submit} className="mt-3 w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition">
                Gửi đánh giá
            </button>
        </div>
    );
}

/* ================= CHAT ================= */
function ChatBox({ productId, chat, setChat, user, onSuccess }) {
    const [msg, setMsg] = useState("");

    const send = async () => {
        if (!msg.trim()) return;

        await orderService.sendOrderMessage(
            productId,
            user.id,
            msg
        );

        setChat([...chat, { user: user.id, msg }]);
        setMsg("");
        onSuccess();
    };

    return (
        <div className="border rounded p-3 space-y-3">
            <h2 className="text-lg font-semibold">Chat Box</h2>

            {/* Messages */}
            <div className="space-y-2">
                {chat.map((c, i) => {
                    const isMe = (c.user == user.id);

                    return (
                        <div
                            key={i}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`
                                    max-w-[70%] rounded-2xl px-3 py-2
                                    ${isMe
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-800"
                                    }
                                `}
                            >
                                <p className="text-black">{c.msg}</p>
                            </div>

                        </div>
                    );
                })}
            </div>

            {/* Input + Button */}
            <div className="flex gap-2">
                <input
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    className="border flex-1 p-2 rounded"
                    placeholder="Nhập tin nhắn..."
                />

                <button
                    onClick={send}
                    disabled={!msg.trim()}
                    className="px-4 py-2 rounded bg-blue-600 text-white
                            hover:bg-blue-700 disabled:opacity-50"
                >
                    Gửi
                </button>
            </div>
        </div>
    );
}

function ReviewResult({ reviews, userId, productId, onUpdated }) {
    const myReviews = reviews.filter(
        r => r.target_user_id == userId
    );

    const myGivenReview = reviews.find(
        r => r.reviewer_id == userId
    );

    const [editing, setEditing] = useState(false);
    const [score, setScore] = useState(myGivenReview?.score ?? 1);
    const [comment, setComment] = useState(myGivenReview?.comment ?? "");
    const [saving, setSaving] = useState(false);
    const { showConfirm } = useConfirmModal();
    const { showResult } = useResultModal();

    const handleSave = async () => {
        showConfirm({
            title: "Xác nhận cập nhật đánh giá",
            message: (
                <div className="space-y-2 text-sm">
                    <p>Bạn có chắc muốn cập nhật đánh giá này?</p>

                    <div className="border rounded p-2 bg-gray-50 text-xs space-y-1">
                        <p>
                            <b>Đánh giá:</b>{" "}
                            {score === 1 ? "👍 Tốt" : "👎 Không tốt"}
                        </p>
                        <p>
                            <b>Nhận xét:</b>{" "}
                            {comment?.trim() || "(không có)"}
                        </p>
                    </div>
                </div>
            ),
            onConfirm: async () => {
                try {
                    setSaving(true);

                    await orderService.submitReview(
                        productId,
                        userId,
                        score,
                        comment
                    );

                    setEditing(false);
                    onUpdated?.(); // reload reviews

                    showResult({
                        success: true,
                        message: "Cập nhật đánh giá thành công"
                    });
                } catch (err) {
                    console.error("Update review error:", err);

                    showResult({
                        success: false,
                        message:
                            err.response?.data?.message ||
                            "Không thể cập nhật đánh giá"
                    });
                } finally {
                    setSaving(false);
                }
            }
        });
    };


    return (
        <div className="space-y-6">
            {/* ================== REVIEW DÀNH CHO BẠN ================== */}
            <div className="border p-4 rounded space-y-3">
                <h2 className="font-semibold">
                    Đánh giá dành cho bạn
                </h2>

                {!myReviews.length ? (
                    <div className="bg-gray-50 p-3 rounded text-gray-600">
                        Chưa có đánh giá dành cho bạn
                    </div>
                ) : (
                    myReviews.map(r => (
                        <div
                            key={r.id}
                            className="rounded-lg border p-3 bg-white"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-lg">
                                    {r.score === 1 ? "👍" : "👎"}
                                </span>
                                <span className="text-sm font-medium">
                                    {r.score === 1 ? "Tốt" : "Không tốt"}
                                </span>
                            </div>

                            <p className="mt-1 text-gray-700">
                                {r.comment}
                            </p>

                            {r.updated_at && (
                                <p className="mt-1 text-xs text-gray-400">
                                    {new Date(r.updated_at).toLocaleString()}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* ================== REVIEW BẠN ĐÃ GỬI ================== */}
            {myGivenReview && (
                <div className="border p-4 rounded space-y-3 bg-blue-50">
                    <h2 className="font-semibold">
                        Đánh giá bạn đã gửi
                    </h2>

                    {!editing ? (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">
                                    {myGivenReview.score === 1 ? "👍" : "👎"}
                                </span>
                                <span className="text-sm font-medium">
                                    {myGivenReview.score === 1 ? "Tốt" : "Không tốt"}
                                </span>
                            </div>

                            <p className="text-gray-700">
                                {myGivenReview.comment}
                            </p>

                            <button
                                onClick={() => setEditing(true)}
                                className="text-blue-600 text-sm hover:underline"
                            >
                                Chỉnh sửa đánh giá
                            </button>
                        </>
                    ) : (
                        <>
                            {/* SCORE */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setScore(1)}
                                    className={`px-3 py-1 rounded border ${
                                        score === 1
                                            ? "bg-green-600 text-white"
                                            : "bg-white"
                                    }`}
                                >
                                    👍 Tốt
                                </button>
                                <button
                                    onClick={() => setScore(-1)}
                                    className={`px-3 py-1 rounded border ${
                                        score === -1
                                            ? "bg-red-600 text-white"
                                            : "bg-white"
                                    }`}
                                >
                                    👎 Không tốt
                                </button>
                            </div>

                            {/* COMMENT */}
                            <textarea
                                rows={3}
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                className="w-full border rounded p-2"
                                placeholder="Nhận xét của bạn..."
                            />

                            {/* ACTIONS */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-blue-600 text-white px-4 py-2 rounded"
                                >
                                    Lưu
                                </button>
                                <button
                                    onClick={() => {
                                        setEditing(false);
                                        setScore(myGivenReview.score);
                                        setComment(myGivenReview.comment);
                                    }}
                                    className="border px-4 py-2 rounded"
                                >
                                    Huỷ
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

function WaitingBox({ message }) {
    return (
        <div className="border rounded-lg p-4 bg-gray-50 text-gray-600">
            ⏳ {message}
        </div>
    );
}
