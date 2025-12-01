import { useEffect, useState } from "react";
import ProductCard from "../ProductCard/ProductCard";

function TopProducts() {
    const [top5End, setTop5End] = useState([]);
    const [top5Bid, setTop5Bid] = useState([]);
    const [top5Price, setTop5Price] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        const authFetch = (url) =>
            fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }).then(res => res.json());

        authFetch("http://localhost:3000/product/top5NearEnd")
            .then(data => setTop5End(data.data));

        authFetch("http://localhost:3000/product/top5BidCounts")
            .then(data => setTop5Bid(data.data));

        authFetch("http://localhost:3000/product/top5Price")
            .then(data => setTop5Price(data.data));
    }, []);


    return (
        <div>
            {/* Top 5 sản phẩm gần kết thúc */}
            <p className="mt-5 fw-bold text-center">Top 5 sản phẩm gần kết thúc</p>
            <div className="d-flex justify-content-center flex-wrap gap-3">
                {top5End.map((item, index) => (
                    <div key={index}>
                        <ProductCard data={item} />
                    </div>
                ))}
            </div>

            {/* Top 5 sản phẩm có nhiều lượt ra giá nhất */}
            <p className="mt-5 fw-bold text-center">Top 5 sản phẩm có nhiều lượt ra giá nhất</p>
            <div className="d-flex justify-content-center flex-wrap gap-3">
                {top5Bid.map((item, index) => (
                    <div key={index}>
                        <ProductCard data={item} />
                    </div>
                ))}
            </div>

            {/* Top 5 sản phẩm có giá cao nhất */}
            <p className="mt-5 fw-bold text-center">Top 5 sản phẩm có giá cao nhất</p>
            <div className="d-flex justify-content-center flex-wrap gap-3">
                {top5Price.map((item, index) => (
                    <div key={index}>
                        <ProductCard data={item} />
                    </div>
                ))}
            </div>
        </div>

    );
}

export default TopProducts;
