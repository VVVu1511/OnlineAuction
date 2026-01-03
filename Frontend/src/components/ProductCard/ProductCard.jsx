// id
// name
// image_path
// current_price
// best_bidder
// sell_price
// upload_date
// bid_counts
// seller
// description
// fts
// bid_step
// state_id
// winner
// starting_price
// extend
// end_date

import dayjs from "../../utils/dayjs";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingContext } from "../../context/LoadingContext.jsx";
import { Heart } from "../Product/Product.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";

export default function ProductCard({ product }) {
    const navigate = useNavigate();
    const { setLoading } = useContext(LoadingContext);
    const { user } = useContext(AuthContext);

    /* ===== IMAGE PATH ===== */
    let images = [];
    try {
        images = Array.isArray(product.image_path)
            ? product.image_path
            : JSON.parse(product.image_path || "[]");
    } catch {
        images = [];
    }

    const thumbnail = images[0]
        ? `http://localhost:3000/static/images/${product.id}/${images[0]}`
        : "/no-image.png"; // ảnh fallback

    /* ===== TIME ===== */
    const timeLeft = product.end_date
        ? dayjs(product.end_date).fromNow(true)
        : "Đã kết thúc";

    const isNew =
        product.end_date &&
        dayjs(product.end_date).diff(dayjs(), "day") >= 3;

    const handleClick = () => {
        setLoading(true);
        navigate(`/product/${product.id}`);
        setLoading(false);
    };

    return (
        <div
            onClick={handleClick}
            className="border rounded-lg hover:shadow-lg transition cursor-pointer relative bg-white"
        >
            <div className="relative">
                {isNew && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold z-10">
                        NEW
                    </span>
                )}

                {user?.role === "bidder" && (
                    <div className="absolute top-2 right-2 z-10">
                        <Heart userId={user.id} productId={product.id} />
                    </div>
                )}
            </div>

            <img
                src={thumbnail}
                alt={product.name}
                className="w-full h-40 object-cover rounded-t-lg"
            />

            <div className="p-3 space-y-1">
                <h3 className="text-sm font-medium line-clamp-2">
                    {product.name}
                </h3>

                <p className="text-red-500 font-semibold">
                    {(product.current_price ?? 0).toLocaleString()} đ
                </p>

                <p className="text-xs text-gray-500">
                    Giá khởi điểm:{" "}
                    {(product.starting_price ?? 0).toLocaleString()} đ
                </p>

                <p className="text-xs text-gray-500">
                    Winner: {product.winner ? product.winner : "Chưa có"}
                </p>

                <div className="flex justify-between text-xs text-gray-500 pt-1">
                    <span>⏳ {timeLeft}</span>
                    <span>
                        🔨 Step: {(product.bid_step ?? 0).toLocaleString()} đ
                    </span>
                </div>
            </div>
        </div>
    );
}
