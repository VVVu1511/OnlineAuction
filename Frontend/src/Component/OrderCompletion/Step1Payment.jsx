// order/steps/Step1Payment.jsx
export default function Step1Payment({ onDone }) {
    return (
        <div>
        <h5>Thanh toán</h5>
        <input type="file" className="form-control mb-2" />
        <textarea
            className="form-control mb-2"
            placeholder="Địa chỉ giao hàng"
        />
        <button className="btn btn-primary" onClick={onDone}>
            Gửi thông tin
        </button>
        </div>
    );
}
