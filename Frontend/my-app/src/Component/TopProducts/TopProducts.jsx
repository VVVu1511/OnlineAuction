import { useEffect, useState } from "react";
import ProductCard from "../ProductCard/ProductCard";

function TopProducts() {
    const [top5End, setTop5End] = useState([]);
    const [top5Bid, setTop5Bid] = useState([]);
    const [top5Price, setTop5Price] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3000/product/top5NearEnd", {"method": "GET"})
            .then(res => res.json())
            .then(data => setTop5End(data.data));

        fetch("http://localhost:3000/product/top5BidCounts", {"method": "GET"})
            .then(res => res.json())
            .then(data => setTop5Bid(data.data));

        fetch("http://localhost:3000/product/top5Price", {"method": "GET"})
            .then(res => res.json())
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
