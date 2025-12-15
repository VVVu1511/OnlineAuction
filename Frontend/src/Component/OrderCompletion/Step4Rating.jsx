// order/steps/Step4Rating.jsx
import { useState } from "react";

export default function Step4Rating() {
    const [score, setScore] = useState(1);
    const [comment, setComment] = useState("");

    return (
        <div>
        <h5>Đánh giá giao dịch</h5>

        <select
            className="form-select mb-2"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
        >
            <option value={1}>+1 Tốt</option>
            <option value={-1}>-1 Không hài lòng</option>
        </select>

        <textarea
            className="form-control mb-2"
            placeholder="Nhận xét ngắn"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
        />

        <button className="btn btn-primary">
            Lưu đánh giá
        </button>
        </div>
    );
}
