import { useEffect, useState } from "react";
import ProductCard from "../ProductCard/ProductCard";

function TopProducts() {
    const [top5End, setTop5End] = useState([]);
    const [top5Bid, setTop5Bid] = useState([]);
    const [top5Price, setTop5Price] = useState([]);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        const fetchFavorites = token
            ? fetch("http://localhost:3000/account/watchlist", {
                headers: { "Authorization": `Bearer ${token}` }
            }).then(res => res.json())
            : Promise.resolve({ data: [] });

        const fetchTopProducts = (url) =>
            fetch(url, {
                headers: token
                    ? { "Authorization": `Bearer ${token}` }
                    : {}
            }).then(res => res.json());

        Promise.all([
            fetchTopProducts("http://localhost:3000/product/top5NearEnd"),
            fetchTopProducts("http://localhost:3000/product/top5BidCounts"),
            fetchTopProducts("http://localhost:3000/product/top5Price"),
            fetchFavorites
        ]).then(([end, bid, price, fav]) => {
            setTop5End(end.data);
            setTop5Bid(bid.data);
            setTop5Price(price.data);
            setFavorites(fav.data || []);
        }).catch(console.error);
    }, []);


    // Check if product is favorite
    const isFavorite = (product) => favorites.some(f => f.id === product.id);

    return (
        <div>
            {/* Top 5 sản phẩm gần kết thúc */}
            <p className="mt-5 fw-bold text-center">Top 5 sản phẩm gần kết thúc</p>
            <div className="d-flex justify-content-center flex-wrap gap-3">
                {top5End.map((item, index) => (
                    <div key={index}>
                        <ProductCard data={item} liked={isFavorite(item)} />
                    </div>
                ))}
            </div>

            {/* Top 5 sản phẩm có nhiều lượt ra giá nhất */}
            <p className="mt-5 fw-bold text-center">Top 5 sản phẩm có nhiều lượt ra giá nhất</p>
            <div className="d-flex justify-content-center flex-wrap gap-3">
                {top5Bid.map((item, index) => (
                    <div key={index}>
                        <ProductCard data={item} liked={isFavorite(item)} />
                    </div>
                ))}
            </div>

            {/* Top 5 sản phẩm có giá cao nhất */}
            <p className="mt-5 fw-bold text-center">Top 5 sản phẩm có giá cao nhất</p>
            <div className="d-flex justify-content-center flex-wrap gap-3">
                {top5Price.map((item, index) => (
                    <div key={index}>
                        <ProductCard data={item} liked={isFavorite(item)} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TopProducts;
