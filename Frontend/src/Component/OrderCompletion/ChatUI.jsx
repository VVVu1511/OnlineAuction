import { useEffect, useState } from "react";

/* ================= MOCK API ================= */

// Lấy người thắng sản phẩm
function apiGetWinner() {
    return Promise.resolve({
        id: 2,
        name: "Seller A",
    });
}

// Lấy toàn bộ message
function apiGetMessages() {
    return Promise.resolve([
        { id: 1, userId: 2, content: "Sản phẩm đã gửi nhé!" },
        { id: 2, userId: 1, content: "Mình nhận được rồi, cảm ơn!" },
    ]);
}

// Lưu message vào DB
function apiSaveMessage(message) {
    console.log("Saving to DB:", message);
    return Promise.resolve({ success: true });
}

/* ================= COMPONENT ================= */

export default function OrderChat() {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [winner, setWinner] = useState(null);

    // Lấy user từ localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    /* Load dữ liệu ban đầu */
    useEffect(() => {
        async function init() {
        const winnerData = await apiGetWinner();
        const msgData = await apiGetMessages();

        setWinner(winnerData);
        setMessages(msgData);
        }
        init();
    }, []);

    /* Gửi tin nhắn */
    const handleSend = async () => {
        if (!text.trim()) return;

        const newMessage = {
        userId,
        content: text,
        };

        await apiSaveMessage(newMessage);

        // Render lại UI (optimistic update)
        setMessages((prev) => [...prev, newMessage]);
        setText("");
    };

    return (
        <div className="mt-4 border-top pt-3">
        <h6>Chat người bán & người mua</h6>

        <div
            className="border p-2 mb-2"
            style={{ height: 150, overflowY: "auto" }}
        >
            {messages.map((msg, index) => {
            const isMe = msg.userId === userId;
            const sender = isMe ? "You" : winner?.name || "Seller";

            return (
                <div key={index}>
                <small>
                    <b>{sender}:</b> {msg.content}
                </small>
                </div>
            );
            })}
        </div>

        <div className="d-flex gap-2">
            <input
            className="form-control"
            placeholder="Nhập tin nhắn..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button className="btn btn-primary" onClick={handleSend}>
            Gửi
            </button>
        </div>

        <AuctionCountdown
        />

        </div>
    );
}

function AuctionCountdown({ auctionId, endTime }) {
    const END_TIME = new Date(endTime).getTime();
    const [timeLeft, setTimeLeft] = useState("");
    const [ended, setEnded] = useState(false);

    useEffect(() => {
        const timer = setInterval(async () => {
        const now = Date.now();
        const diff = END_TIME - now;

        if (diff <= 0) {
            clearInterval(timer);
            setTimeLeft("Auction ended");

            if (!ended) {
            setEnded(true);

            const res = await fetch(`/api/auctions/${auctionId}`);
            const data = await res.json();

            // update UI
            if (data.status === "ENDED") {
                if (data.role === "WINNER") {
                    window.location.href = `/checkout/${data.orderId}`;
                } else if (data.role === "SELLER") {
                    window.location.href = `/seller/orders/${data.orderId}`;
                }
            }
            }
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(timer);
    }, [auctionId, END_TIME, ended]);

    return (
        <div style={{ padding: 16, border: "1px solid #ccc" }}>
        <h4>Auction Countdown</h4>
        <strong>{timeLeft}</strong>
        </div>
    );
}
