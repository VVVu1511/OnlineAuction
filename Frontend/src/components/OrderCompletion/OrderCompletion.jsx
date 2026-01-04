import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import Back from "../Back/Back.jsx";
import * as orderService from "../../services/order.service.jsx";
import { useParams } from "react-router-dom";

export default function OrderCompletion() {
    const { user } = useContext(AuthContext);
    const { id } = useParams(); 
    const productId = Number(id);
    const sellerId = user?.id;

    const [orderStatus, setOrderStatus] = useState("");
    const [chat, setChat] = useState([]);
    const [review, setReview] = useState({ score: null, comment: "" });

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviews, setReviews] = useState([]);

    /* 🔴 Seller cancel */
    const handleCancel = async () => {
        try {
            await orderService.cancelOrder(productId, sellerId);
            setOrderStatus("CANCELLED");
        } catch (err) {
            console.error(err);
            alert("Có lỗi xảy ra khi huỷ đơn");
        }
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
        try {
            const res = await orderService.getOrderReviews(order.id);
            if (res.success) {
                setReviews(res.data);
            }
        } catch (err) {
            console.error("Load reviews failed", err);
        }
    }, [order]);

    useEffect(() => {
        if (!productId) return;

        loadChat();
        fetchOrder();
        loadReviews();

    }, [productId, loadChat, fetchOrder, loadReviews]);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Back />
            
            <h1 className="text-2xl font-bold">Hoàn tất đơn hàng</h1>

            {orderStatus === "BUYER_SUBMIT_PAYMENT" && user?.role === "bidder" && (
                <BuyerPayment
                    productId={productId}
                    buyerId={user.id}
                    onSuccess={() => fetchOrder()}
                />
            )}

            {orderStatus === "SELLER_CONFIRM_PAYMENT" && user?.role === "seller" && (
                <SellerConfirm
                    productId={productId}
                    sellerId={user.id}
                    onConfirm={() => fetchOrder()}
                    onCancel={handleCancel}
                    order={order}
                />
            )}

            {orderStatus === "BUYER_CONFIRM_RECEIVE" && user?.role === "bidder" && (
                <BuyerReceive
                    productId={productId}
                    buyerId={user.id}
                    onConfirm={() => fetchOrder()}
                    order={order}
                />
            )}

            {orderStatus === "BOTH_REVIEW" && (
                <ReviewSection
                    productId={productId}
                    userId={user.id}
                    review={review}
                    setReview={setReview}
                    reviews={reviews}
                    onSuccess={() => loadReviews()}
                    role={user.role}
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
function BuyerPayment({ productId, buyerId, onSuccess }) {
    const [paymentInfo, setPaymentInfo] = useState("");
    const [address, setAddress] = useState("");

    const submit = async () => {
        await orderService.submitPayment(
            productId,
            buyerId,
            paymentInfo,
            address
        );

        onSuccess();
    };

    return (
        <div className="rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold">1️⃣ Thanh toán & địa chỉ</h2>

            <input
                className="border w-full p-2"
                placeholder="Hóa đơn thanh toán"
                value={paymentInfo}
                onChange={(e) => setPaymentInfo(e.target.value)}
            />

            <input
                className="border w-full p-2"
                placeholder="Địa chỉ giao hàng"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />

            <button
                onClick={submit}
                className="
                    mt-3 w-full rounded-lg bg-blue-600 px-4 py-2.5
                    text-sm font-semibold text-white
                    hover:bg-blue-700 active:bg-blue-800
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                    transition
                "
            >
                Gửi thông tin
            </button>
        </div>
    );
}

/* ================= SELLER CONFIRM ================= */
function SellerConfirm({ productId, sellerId, onConfirm, onCancel, order }) {
    const [shippingInfo, setShippingInfo] = useState("");

    const confirm = async () => {
        await orderService.confirmShipping(
            productId,
            sellerId,
            shippingInfo
        );
        onConfirm();
    };

    return (
        <div className="border p-4 rounded space-y-3">
            <h2 className="font-semibold">2️⃣ Xác nhận & vận chuyển</h2>

            <p>{order.buyer_payment_info}</p>

            <input
                className="border w-full p-2"
                placeholder="Hoá đơn vận chuyển"
                value={shippingInfo}
                onChange={(e) => setShippingInfo(e.target.value)}
            />

            <div className="flex gap-3 pt-2">
                <button
                    onClick={confirm}
                    className="
                        inline-flex items-center justify-center
                        rounded-lg bg-blue-600 px-5 py-2.5
                        text-sm font-semibold text-white
                        shadow-sm
                        hover:bg-blue-700
                        active:bg-blue-800
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        transition
                    "
                >
                    Xác nhận đã gửi
                </button>

                <button
                    onClick={onCancel}
                    className="
                        inline-flex items-center justify-center
                        rounded-lg border border-red-300
                        bg-red-50 px-5 py-2.5
                        text-sm font-semibold text-red-600
                        hover:bg-red-100
                        active:bg-red-200
                        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                        transition
                    "
                >
                    Huỷ giao dịch
                </button>
            </div>

        </div>
    );
}

/* ================= BUYER RECEIVE ================= */
function BuyerReceive({ productId, buyerId, onConfirm,  order }) {
    const confirm = async () => {
        await orderService.confirmReceive(productId, buyerId);
        onConfirm();
    };

    return (
        <div className="border p-4 rounded">
            <h2 className="font-semibold">3️⃣ Xác nhận nhận hàng</h2>
            
            <p>{order.seller_shipping_info}</p>

            <button
                onClick={confirm}
                className="
                    mt-3 w-full
                    inline-flex items-center justify-center
                    rounded-lg bg-green-600 px-5 py-3
                    text-sm font-semibold text-white
                    shadow-sm
                    hover:bg-green-700
                    active:bg-green-800
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                    transition
                "
            >
                Tôi đã nhận hàng
            </button>
        </div>
    );
}

/* ================= REVIEW ================= */
function ReviewSection({ productId, userId, review, setReview, reviews, onSuccess, role }) {
    const submit = async () => {
        await orderService.submitReview(
            productId,
            userId,
            review.score,
            review.comment
        );

        alert("Đã gửi đánh giá");

        // ✅ RESET FORM
        setReview({
            score: null,
            comment: "",
        });

        onSuccess();
    };

    return (
        <div className="border p-4 rounded space-y-2">
            <div className="space-y-3">
                {reviews.map((r) => {
                    const isMe = r.reviewer_id == userId;

                    const label = isMe
                        ? "You"
                        : role === "bidder"
                            ? "Seller"
                            : "Bidder";

                    return (
                        <div
                            key={r.id}
                            className={`rounded-lg border p-3 ${
                                isMe ? "bg-blue-50 border-blue-200" : "bg-white"
                            }`}
                        >
                            {/* Label */}
                            <div className="text-xs font-semibold text-gray-500 mb-1">
                                {label}
                            </div>

                            {/* Score */}
                            <div className="text-sm font-semibold">
                                {r.score === 1 ? "👍 Tốt" : "👎 Không tốt"}
                            </div>

                            {/* Comment */}
                            <div className="text-sm text-gray-700">
                                {r.comment}
                            </div>

                            {/* Time */}
                            <div className="text-xs text-gray-400 mt-1">
                                {new Date(r.updated_at).toLocaleString()}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <h2 className="font-semibold">4️⃣ Đánh giá giao dịch</h2>

            <select
                className="border p-2"
                value={review.score ?? ""}
                onChange={(e) =>
                    setReview({ ...review, score: Number(e.target.value) })
                }
            >
                <option value="">Chọn đánh giá</option>
                <option value={1}>👍 Tốt</option>
                <option value={-1}>👎 Không tốt</option>
            </select>

            <textarea
                className="border w-full p-2"
                placeholder="Nhận xét"
                value={review.comment}
                onChange={(e) =>
                    setReview({ ...review, comment: e.target.value })
                }
            />

            <button
                onClick={submit}
                className="
                    mt-3 w-full
                    inline-flex items-center justify-center
                    rounded-lg bg-indigo-600 px-5 py-3
                    text-sm font-semibold text-white
                    shadow-sm
                    hover:bg-indigo-700
                    active:bg-indigo-800
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                    transition
                "
            >
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
