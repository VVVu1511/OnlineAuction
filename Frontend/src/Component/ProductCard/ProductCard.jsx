import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import useWatchlist from "../../hooks/useWatchList.js";
import { useEffect, useState } from "react";

export default function ProductCard({ data, liked = false }) {
    const navigate = useNavigate();
    const [isLiked, toggleIsLiked] = useWatchlist(liked);
    const [user, setUser] = useState(null);

    // local state để đồng bộ khi mở ProductInfor
    const [currentLiked, setCurrentLiked] = useState(liked);

    const handleToggle = (productId) => {
        toggleIsLiked(productId);
        setCurrentLiked((prev) => !prev);
    };

    const handleClick = () =>
        navigate(`/product/${data.id}`, {
            state: { product: data, isLiked: currentLiked },
        });
    
    useEffect(() => {
        const cur_user = JSON.parse(localStorage.getItem("user"));
        setUser(cur_user);
        
    }, []);

    return (
        <div
            onClick={handleClick}
            className="
                relative
                w-40
                cursor-pointer
                rounded-xl
                bg-white
                shadow-sm
                hover:shadow-lg
                transition
            "
        >
            {/* Image */}
            <img
                src={`http://localhost:3000/static/images/${data.id}/${data.image_path[0]}`}
                alt={data.name}
                className="
                    w-full
                    h-32
                    object-cover
                    rounded-t-xl
                "
            />

            {/* Content */}
            <div className="p-2 text-center space-y-1 text-sm">
                <p className="font-semibold truncate">{data.name}</p>
                <p className="truncate">💰 {data.current_price} đ</p>
                <p className="truncate">🧑 {data.best_bidder}</p>
                <p className="truncate">🚀 {data.time_left}</p>
                <p className="truncate">🔥 Bids: {data.bid_counts}</p>
            </div>

            {/* Like Button */}
            <div
                className="
                    absolute
                    top-2
                    right-2
                    text-lg
                    cursor-pointer
                    transition
                    hover:scale-110
                "
                onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(data.id);
                }}
            >
                {user?.role === "bidder" && (
                    currentLiked
                        ? <FaHeart className="text-red-500" />
                        : <FaRegHeart className="text-gray-400" />
                )}
                
            </div>
        </div>
    );
}
