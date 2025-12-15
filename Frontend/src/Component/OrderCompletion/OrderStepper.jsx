
// order/OrderStepper.jsx
const steps = [
    "Thanh toán",
    "Xác nhận & vận chuyển",
    "Nhận hàng",
    "Đánh giá",
];

export default function OrderStepper({ status }) {
    return (
        <div className="d-flex justify-content-between mb-4">
        {steps.map((step, index) => (
            <div
            key={step}
            className={`fw-bold ${
                status >= index + 1 ? "text-success" : "text-secondary"
            }`}
            >
            {index + 1}. {step}
            </div>
        ))}
        </div>
    );
}
