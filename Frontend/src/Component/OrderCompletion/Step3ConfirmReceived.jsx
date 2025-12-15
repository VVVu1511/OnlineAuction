// order/steps/Step3ConfirmReceived.jsx
export default function Step3ConfirmReceived({ onDone }) {
    return (
        <div>
        <h5>Xác nhận đã nhận hàng</h5>
        <button className="btn btn-success" onClick={onDone}>
            Tôi đã nhận hàng
        </button>
        </div>
    );
}
