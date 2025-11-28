// src/hooks/useWatchlist.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function useWatchlist(initialLiked = false) {
    const [liked, setLiked] = useState(initialLiked);
    const navigate = useNavigate();

    const toggleLike = async (productId) => {
        const token = localStorage.getItem("token");
        
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const method = liked ? "DELETE" : "POST";
            const res = await fetch(`http://localhost:3000/product/watchlist`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ productId }),
            });

            const result = await res.json();

            if (result.success) {
                setLiked(!liked);
            } else {
                alert(result.message || "Failed to update watchlist");
            }
        } catch (err) {
            console.error("Watchlist error:", err);
            alert("Server error while updating watchlist");
        }
    };

    return [liked, toggleLike];
}
