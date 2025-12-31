import dayjs from "../../utils/dayjs"

export default function ProductCard({ product }) {
    const timeLeft = dayjs(product.end_time).fromNow(true);

    const isNew =
        dayjs().diff(dayjs(product.created_at), "minute") <= 10;

    return (
        <div className="border rounded hover:shadow-lg transition cursor-pointer relative">
            {isNew && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    NEW
                </span>
            )}

            <img
                src={`http://localhost:3000/static/images/${product.id}/${product.image_path[0]}`}
                alt={product.name}
                className="w-full h-40 object-cover rounded-t"
            />

            <div className="p-3 space-y-1">
                <h3 className="text-sm font-medium line-clamp-2">
                    {product.name}
                </h3>

                <p className="text-red-500 font-semibold">
                    {product.current_price.toLocaleString()} đ
                </p>

                {product.buy_now_price && (
                    <p className="text-xs text-gray-500">
                        Mua ngay: {product.sell_price.toLocaleString()} đ
                    </p>
                )}

                <p className="text-xs text-gray-500">
                    Bidder cao nhất: {product.best_bidder || "Chưa có"}
                </p>

                <div className="flex justify-between text-xs text-gray-500">
                    <span>⏳ {timeLeft}</span>
                    <span>🔨 {product.bid_counts} bids</span>
                </div>
            </div>
        </div>
    );
}
