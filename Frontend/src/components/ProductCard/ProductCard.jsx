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
        product.upload_date &&
        dayjs().diff(dayjs(product.upload_date), "minute") <= 10;

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
            {/* ===== LEFT BADGES ===== */}
            <div className="absolute top-2 left-2 z-10 flex gap-2">
                {isNew && (
                    <span className="
                        rounded-full
                        bg-gradient-to-r from-red-500 to-orange-500
                        px-3 py-1
                        text-[11px] font-bold uppercase tracking-wide
                        text-white
                        shadow-md
                    ">
                        NEW
                    </span>
                )}

                {user?.id === product.best_bidder && (
                    <span className="
                        rounded-full
                        bg-gradient-to-r from-yellow-400 to-amber-500
                        px-3 py-1
                        text-[11px] font-bold uppercase tracking-wide
                        text-white
                        shadow-md
                    ">
                        TOP 1
                    </span>
                )}
            </div>

            {/* ===== HEART (KEEP SAME) ===== */}
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
                    Giá hiện tại:{" "}
                    {(product.current_price ?? 0).toLocaleString()} đ
                </p>

                <p className="text-xs text-gray-500">
                    Người đặt giá cao nhất:{" "}
                    {product.best_bidder_name}
                </p>

                <p className="text-xs text-gray-500">
                    Giá mua ngay:{" "}
                    {(product.sell_price ?? 0).toLocaleString()} đ
                </p>

                <p className="text-xs text-gray-500">
                    Số lượt ra giá hiện tại: {product.bid_counts}
                </p>

                <p className="text-xs text-gray-500">
                    Ngày kết thúc: {product.end_date ? dayjs(product.end_date).format("DD/MM/YYYY HH:mm") : "Đã kết thúc"}
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
