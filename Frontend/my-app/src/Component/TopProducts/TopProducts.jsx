import { useEffect, useState } from "react";
import ProductCard from "../ProductCard/ProductCard";
import * as productService from "../../service/product.service.jsx"
import * as accountService from "../../service/account.service.jsx"

function TopProducts() {
    const [top5End, setTop5End] = useState([]);
    const [top5Bid, setTop5Bid] = useState([]);
    const [top5Price, setTop5Price] = useState([]);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem("token");

                const [
                    endRes,
                    bidRes,
                    priceRes,
                    favRes
                ] = await Promise.all([
                    productService.getTop5NearEnd(),
                    productService.getTop5BidCounts(),
                    productService.getTop5Price(),
                    token ? accountService.getWatchlist() : Promise.resolve({ data: [] })
                ]);

                setTop5End(endRes.data || []);
                setTop5Bid(bidRes.data || []);
                setTop5Price(priceRes.data || []);
                setFavorites(favRes.data || []);
            } catch (err) {
                console.error("Load homepage data error:", err);
            }
        };

        loadData();
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
