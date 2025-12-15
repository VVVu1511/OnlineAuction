// order/OrderChat.jsx

export default function OrderChat() {
    return (
        <div className="mt-4 border-top pt-3">
        <h6>Chat người bán & người mua</h6>
        <div className="border p-2 mb-2" style={{ height: 120 }}>
            <small>Chat realtime ở đây…</small>
        </div>
        <input className="form-control" placeholder="Nhập tin nhắn..." />
        </div>
    );
}
