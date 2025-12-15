// order/OrderCompletion.jsx
import OrderStepper from "./OrderStepper.jsx";
import Step1Payment from "./steps/Step1Payment.jsx";
import Step2Shipping from "./steps/Step2Shipping.jsx";
import Step3ConfirmReceived from "./steps/Step3ConfirmReceived.jsx";
import Step4Rating from "./steps/Step4Rating.jsx";
import OrderChat from "./OrderChat.jsx";
import OrderActions from "./OrderActions.jsx";
import { useState } from "react";

export default function OrderCompletion({ product, role }) {
  // Normally fetched from backend
    const [orderStatus, setOrderStatus] = useState(1);

    return (
        <div className="card p-4">
        <h3 className="mb-3">Hoàn tất đơn hàng</h3>

        <OrderStepper status={orderStatus} />

        {orderStatus === 1 && role === "BUYER" && (
            <Step1Payment onDone={() => setOrderStatus(2)} />
        )}

        {orderStatus === 2 && role === "SELLER" && (
            <Step2Shipping onDone={() => setOrderStatus(3)} />
        )}

        {orderStatus === 3 && role === "BUYER" && (
            <Step3ConfirmReceived onDone={() => setOrderStatus(4)} />
        )}

        {orderStatus >= 4 && (
            <Step4Rating product={product} />
        )}

        <OrderActions
            role={role}
            orderStatus={orderStatus}
            onCancel={() => setOrderStatus(-1)}
        />

        <OrderChat />
        </div>
    );
}
