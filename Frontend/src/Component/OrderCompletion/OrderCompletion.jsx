// order/OrderCompletion.jsx
import OrderStepper from "./OrderStepper.jsx";
import Step1Payment from "./Step1Payment.jsx"
import Step2Shipping from "./Step2Shipping.jsx";
import Step3ConfirmReceived from "./Step3ConfirmReceived.jsx";
import Step4Rating from "./Step4Rating.jsx";
// import OrderChat from "./OrderChat.jsx";
import OrderActions from "./OrderActions.jsx";
import ChatUI from "./ChatUI.jsx";

import { useState } from "react";

export default function OrderCompletion({ product, role }) {
  // Normally fetched from backend
    const [orderStatus, setOrderStatus] = useState(1);

    return (
        <div className="card p-4">
            <h3 className="mb-3 mt-5">Hoàn tất đơn hàng</h3>

            <OrderStepper status={orderStatus} />

            {orderStatus === 1 && (
                <Step1Payment onDone={() => setOrderStatus(2)} />
            )}

            {orderStatus === 2  && (
                <Step2Shipping onDone={() => setOrderStatus(3)} />
            )}

            {orderStatus === 3  && (
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

            <ChatUI />
        </div>
    );
}
