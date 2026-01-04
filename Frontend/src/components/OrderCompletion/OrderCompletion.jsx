import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import Back from "../Back/Back.jsx"

export default function OrderCompletion() {
    const { user } = useContext(AuthContext);
    
    const [orderStatus, setOrderStatus] = useState("BUYER_SUBMIT_PAYMENT");
    const [chat, setChat] = useState([]);
    const [review, setReview] = useState({ score: null, comment: "" });

    /* 🔴 Seller cancel */
    const handleCancel = () => {
        setOrderStatus("CANCELLED");
        // TODO: call API → đánh giá -1 buyer
        
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Back />
            
            <h1 className="text-2xl font-bold">Hoàn tất đơn hàng</h1>

            {/* 🔄 STEP RENDER */}
            {orderStatus === "BUYER_SUBMIT_PAYMENT" && user?.role === "bidder" && (
                <BuyerPayment onSubmit={() => setOrderStatus("SELLER_CONFIRM_PAYMENT")} />
            )}

            {orderStatus === "SELLER_CONFIRM_PAYMENT" && user?.role === "seller" && (
                <SellerConfirm
                    onConfirm={() => setOrderStatus("BUYER_CONFIRM_RECEIVE")}
                    onCancel={handleCancel}
                />
            )}

            {orderStatus === "BUYER_CONFIRM_RECEIVE" && user?.role === "bidder"  && (
                <BuyerReceive onConfirm={() => setOrderStatus("BOTH_REVIEW")} />
            )}

            {orderStatus === "BOTH_REVIEW" && (
                <ReviewSection review={review} setReview={setReview} />
            )}

            {orderStatus === "CANCELLED" && (
                <div className="p-4 bg-red-100 text-red-700 rounded">
                    Giao dịch đã bị huỷ bởi người bán
                </div>
            )}

            {/* 💬 CHAT */}
            <ChatBox chat={chat} setChat={setChat} user={user} />
        </div>
    );
}

function BuyerPayment({ onSubmit }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="text-lg font-semibold text-gray-800">
            1️⃣ Thanh toán & địa chỉ
        </h2>

        {/* Hóa đơn */}
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">
            Hóa đơn thanh toán
            </label>
            <input
            className="
                w-full rounded-lg border border-gray-300 px-3 py-2
                text-sm text-gray-800
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition
            "
            placeholder="Nhập thông tin hóa đơn"
            />
        </div>

        {/* Địa chỉ */}
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">
            Địa chỉ giao hàng
            </label>
            <input
            className="
                w-full rounded-lg border border-gray-300 px-3 py-2
                text-sm text-gray-800
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition
            "
            placeholder="Nhập địa chỉ giao hàng"
            />
        </div>

        <button
            onClick={onSubmit}
            className="
            w-full rounded-lg bg-blue-600 px-4 py-2.5
            text-sm font-semibold text-white
            hover:bg-blue-700 active:bg-blue-800
            transition
            "
        >
            Gửi thông tin
        </button>
        </div>
    );
}

function SellerConfirm({ onConfirm, onCancel }) {
    return (
        <div className="border p-4 rounded space-y-3">
            <h2 className="font-semibold">2️⃣ Xác nhận & vận chuyển</h2>
            <input className="border w-full p-2" placeholder="Hoá đơn vận chuyển" />
            <div className="flex gap-2">
                <button onClick={onConfirm} className="btn-primary">
                    Xác nhận đã gửi
                </button>
                <button onClick={onCancel} className="btn-danger">
                    Huỷ giao dịch
                </button>
            </div>
        </div>
    );
}

function BuyerReceive({ onConfirm }) {
    return (
        <div className="border p-4 rounded">
            <h2 className="font-semibold">3️⃣ Xác nhận nhận hàng</h2>
            <button onClick={onConfirm} className="btn-primary mt-2">
                Tôi đã nhận hàng
            </button>
        </div>
    );
}

function ReviewSection({ review, setReview }) {
    return (
        <div className="border p-4 rounded space-y-2">
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
                placeholder="Nhận xét ngắn"
                value={review.comment}
                onChange={(e) =>
                    setReview({ ...review, comment: e.target.value })
                }
            />
        </div>
    );
}

function ChatBox({ chat, setChat, user }) {
    const [msg, setMsg] = useState("");

    const send = () => {
        if (!msg.trim()) return;
        setChat([...chat, { user: user.id, msg }]);
        setMsg("");
    };

    return (
        <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b px-4 py-2">
            <h3 className="text-sm font-semibold text-gray-700">
            💬 Trao đổi
            </h3>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-sm">
            {chat.map((c, i) => {
            const isMe = c.user === user.id;
            return (
                <div
                key={i}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                <div
                    className={`
                    max-w-[75%] rounded-2xl px-3 py-2
                    ${isMe
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800"}
                    `}
                >
                    {!isMe && (
                    <p className="mb-0.5 text-xs font-medium text-gray-500">
                        {c.user}
                    </p>
                    )}
                    <p className="break-words">{c.msg}</p>
                </div>
                </div>
            );
            })}
        </div>

        {/* Input */}
        <div className="border-t px-3 py-2">
            <div className="flex items-center gap-2">
            <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="
                flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition
                "
                onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
                onClick={send}
                className="
                rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white
                hover:bg-blue-700 active:bg-blue-800
                transition
                "
            >
                Gửi
            </button>
            </div>
        </div>
        </div>
    );
}

