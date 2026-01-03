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
        <div className="border p-4 rounded space-y-3">
            <h2 className="font-semibold">1️⃣ Thanh toán & địa chỉ</h2>
            <input className="border w-full p-2" placeholder="Hoá đơn thanh toán" />
            <input className="border w-full p-2" placeholder="Địa chỉ giao hàng" />
            <button onClick={onSubmit} className="btn-primary">
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
        <div className="border rounded p-3">
            <h3 className="font-semibold mb-2">💬 Trao đổi</h3>
            <div className="h-40 overflow-y-auto border p-2 mb-2">
                {chat.map((c, i) => (
                    <p key={i}>
                        <b>{c.user}:</b> {c.msg}
                    </p>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    className="border flex-1 p-2"
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                />
                <button onClick={send} className="btn-primary">
                    Gửi
                </button>
            </div>
        </div>
    );
}

