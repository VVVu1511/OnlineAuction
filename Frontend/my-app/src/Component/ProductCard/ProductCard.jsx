import { useNavigate } from "react-router-dom"; 
import { FaHeart, FaRegHeart } from "react-icons/fa"; 
import useWatchlist from "../../hooks/useWatchList.js";
import { useState, useEffect } from "react";

export default function ProductCard({ data, liked=false }) {
    const navigate = useNavigate();
    const [isLiked, toggleIsLiked] = useWatchlist(liked);

    // 🔹 local state để đồng bộ với prop liked khi mở ProductInfor
    const [currentLiked, setCurrentLiked] = useState(liked);

    // 🔹 cập nhật currentLiked khi toggle
    const handleToggle = (productId) => {
        toggleIsLiked(productId);   // đổi watchlist như bình thường
        setCurrentLiked(prev => !prev);  // đồng bộ local state
    };

    const handleClick = () => 
        navigate("/productInfor", { state: { product: data, isLiked: currentLiked } });

    return (
        <div onClick={handleClick} className="position-relative">
            <div className="card" style={{ width: "160px" }}>
                <img
                    className="card-img-top img-fluid mt-2"
                    src={`http://localhost:3000/static/images/${data.id}/${data.image_path[0]}`}
                    alt=""
                    style={{ height: "120px", objectFit: "cover" }}
                />
                <div className="card-body p-2">
                    <p className="card-title text-center truncate">{data.name}</p>
                    <p className="card-text text-center truncate">💰 {data.current_price} đ</p>
                    <p className="card-text text-center truncate">🧑 {data.best_bidder}</p>
                    <p className="card-text text-center truncate">🚀 {data.time_left}</p>
                    <p className="card-text text-center truncate">🔥 Bids: {data.bid_counts}</p>
                </div>
            </div>

            <div
                className="position-absolute"
                style={{ top: "5px", right: "10px", cursor: "pointer", color: currentLiked ? "red" : "gray" }}
                onClick={(e) => { e.stopPropagation(); handleToggle(data.id); }}
            >
                {currentLiked ? <FaHeart /> : <FaRegHeart />}
            </div>
        </div>
    );
}
