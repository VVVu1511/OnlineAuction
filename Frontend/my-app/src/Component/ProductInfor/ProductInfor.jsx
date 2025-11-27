import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ProductCard from "../ProductCard/ProductCard";
import { FaHeart } from "react-icons/fa";

dayjs.extend(relativeTime);

function ProductInfor() {
    const location = useLocation();
    const { product } = location.state || {};

    const [relatedProducts, setRelatedProducts] = useState([]);
    const [qaHistory, setQaHistory] = useState([]);
    const [seller, setSeller] = useState({});
    const [bestBidder, setBestBidder] = useState({});
    const [history, setHistory] = useState([]);

    const handleClick = () => {
    
    //check state (red or none)
    //red -> undone, none-> love

    fetch(`http://localhost:3000/product/watchlist/${product.id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            product_id: product.id,   
        }),
    })
        .then((res) => res.json())
        .then((data) => setSeller(data))
        .catch((err) => console.error(err));
};


    useEffect(() => {
        if (product) {
            //fetch seller
            fetch(`http://localhost:3000/product/sellerInfor/${product.id}`)
                .then(res => res.json())
                .then(data => setSeller(data));

            //fetch best bidder
            fetch(`http://localhost:3000/product/bestBidder/${product.id}`)
                .then(res => res.json())
                .then(data => setBestBidder(data));

            // fetch 5 related products in same category
            fetch(`http://localhost:3000/product/related/${product.id}`)
                .then(res => res.json())
                .then(data => setRelatedProducts(data.data));

            // fetch Q&A history
            fetch(`http://localhost:3000/product/Q_A/${product.id}`)
                .then(res => res.json())
                .then(data => setQaHistory(data.data));
            
            //fetch bid history
            fetch(`http://localhost:3000/product/bid_history/${product.id}`)
                .then(res => res.json())
                .then(data => setHistory(data.data));
            }
    }, [product]);

    if (!product) return <p>Product not found.</p>;

    const endTime = dayjs(product.upload_date).add(product.time_left, "seconds");
    const now = dayjs();
    const displayTimeLeft = endTime.diff(now, 'day') < 3
        ? endTime.fromNow()  // relative time if less than 3 days
        : endTime.format('YYYY-MM-DD HH:mm');

    return (
        <div className="container py-5">
            {/* Product images and main info */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <img 
                        src={`http://localhost:3000/static/images/${product.id}/${product.image_path[0]}`} 
                        alt={product.name} 
                        className="img-fluid mb-2" 
                    />
                    <div className="row g-2">
                        {product.image_path.slice(1).map((img, idx) => (
                            <div className="col-4" key={idx}>
                                <img 
                                    src={`http://localhost:3000/static/images/${product.id}/${img}`} 
                                    alt={`${product.name} ${idx + 2}`} 
                                    className="img-fluid"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="d-flex p-5">
                        <div>
                            <h2>{product.name}</h2>
                            <p><strong>Current Price:</strong> {product.current_price}</p>
                            {product.sell_price && <p><strong>Buy Now Price:</strong> {product.sell_price}</p>}
                            <p><strong>Time Left:</strong> {displayTimeLeft}</p>
                            <p><strong>Best Bidder:</strong> {bestBidder.username} | Score: {bestBidder.score || '-'}</p>
                            <p><strong>Bid Counts:</strong> {product.bid_counts}</p>
                            <p><strong>Description:</strong> {product.description}</p>
                            <p><strong>Uploaded:</strong> {dayjs(product.upload_date).format('YYYY-MM-DD HH:mm')}</p>
                        </div>

                        <div className="">
                            <FaHeart onClick={() => handleClick()} className="text-end text-red-500 text-3xl " />
                        </div>
                    </div>


                </div>
            </div>

            {/* Seller info */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <h5>Seller Info</h5>
                    <p>Name: {seller.username}</p>
                    <p>Score: {seller.score}</p>
                </div>

                <div className="col-md-6">
                    <h5>Current Highest Bidder</h5>
                    <p>Name: {product.best_bidder}</p>
                    <p>Score: {product.best_bidder_score || '-'}</p>
                </div>
            </div>

            {/* Related products */}
            <div className="mb-4">
                <h5>5 Products in Same Category</h5>
                <div className="row">
                    {relatedProducts.map((p, idx) => (
                        <div className="col-2" key={idx}>
                            <ProductCard data={p} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Bid History */}
            <table className="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Thời điểm</th>
                        <th>Người mua</th>
                        <th>Giá</th>
                    </tr>
                </thead>

                <tbody>
                    {history.map((item, idx) => (
                        <tr key={idx}>
                            <td>{item.time}</td>
                            <td>{item.user_id}</td>
                            <td>{item.price}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            

            {/* Q&A */}
            

            <div className="mb-4">
                <h5>Q&A</h5>
                {qaHistory.length === 0 && <p>No questions yet.</p>}
                {qaHistory.map((qa, idx) => (
                    <div key={idx} className="mb-2 border p-2 rounded">
                        <p><strong>{idx + 1}:</strong> {qa.question}</p>
                        <p><strong>Seller:</strong> {qa.answer || "Not answered yet"}</p>
                    </div>
                ))}
            </div>

            

        </div>
    );
}

export default ProductInfor;
