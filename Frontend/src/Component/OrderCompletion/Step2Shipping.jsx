// order/steps/Step2Shipping.jsx
export default function Step2Shipping({ onDone }) {
    return (
        <div>
        <h5>Xác nhận & vận chuyển</h5>
        <input type="file" className="form-control mb-2" />
        <button className="btn btn-primary" onClick={onDone}>
            Xác nhận đã nhận tiền
        </button>
        </div>
    );
}
