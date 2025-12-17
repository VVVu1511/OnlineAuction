import { useEffect, useState } from "react";
import ProductCard from "../ProductCard/ProductCard";
import * as productService from "../../service/product.service";
import * as accountService from "../../service/account.service";

export default function TopProducts() {
    const [top5End, setTop5End] = useState([]);
    const [top5Bid, setTop5Bid] = useState([]);
    const [top5Price, setTop5Price] = useState([]);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem("token");

                const [endRes, bidRes, priceRes, favRes] =
                    await Promise.all([
                        productService.getTop5NearEnd(),
                        productService.getTop5BidCounts(),
                        productService.getTop5Price(),
                        token
                            ? accountService.getWatchlist()
                            : Promise.resolve({ data: [] }),
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

    const isFavorite = (product) =>
        favorites.some((f) => f.id === product.id);

    /* ================= UI ================= */
    return (
        <div className="space-y-12 mt-5">
            <Section
                title="🔥 Top 5 sản phẩm gần kết thúc"
                data={top5End}
                isFavorite={isFavorite}
            />

            <Section
                title="🔥 Top 5 sản phẩm có nhiều lượt ra giá nhất"
                data={top5Bid}
                isFavorite={isFavorite}
            />

            <Section
                title="🔥 Top 5 sản phẩm có giá cao nhất"
                data={top5Price}
                isFavorite={isFavorite}
            />
        </div>
    );
}

/* ================= SUB COMPONENT ================= */
function Section({ title, data, isFavorite }) {
    return (
        <section>
            <h2 className="text-xl font-bold text-center mb-6 text-gray-800">
                {title}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 justify-items-center">
                {data.map((item) => (
                    <ProductCard
                        key={item.id}
                        data={item}
                        // liked={isFavorite(item)}
                    />
                ))}
            </div>
        </section>
    );
}
