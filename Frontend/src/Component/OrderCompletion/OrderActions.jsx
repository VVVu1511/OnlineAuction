// order/OrderActions.jsx
export default function OrderActions({ role, orderStatus, onCancel }) {
    if (role !== "SELLER" || orderStatus < 1 || orderStatus >= 4) return null;

    return (
        <div className="mt-4">
        <button className="btn btn-danger" onClick={onCancel}>
            Huỷ giao dịch & đánh giá -1
        </button>
        </div>
    );
}
