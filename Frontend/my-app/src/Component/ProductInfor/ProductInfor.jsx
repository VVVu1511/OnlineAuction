import { useLocation } from "react-router-dom";

function ProductInfor() {
    const location = useLocation();
    const { product } = location.state || {};

    if (!product) return <p>Product not found.</p>;

    return (
        <div className="row">
            <div className="col-4">
                <img 
                    src={`http://localhost:3000/static/images/${product.id}/${product.image_path[0]}`} 
                    alt={product.name} 
                    className="img-fluid" 
                />
                <div className="row mt-2">
                    {product.image_path.slice(1).map((img, idx) => (
                        <img 
                            key={idx}
                            src={`http://localhost:3000/static/images/${product.id}/${img}`} 
                            alt={`${product.name} ${idx + 2}`} 
                            className="img-fluid col-4" 
                        />
                    ))}
                </div>
            </div>

            <div className="col-8">
                <h2>{product.name}</h2>
                <p>Current Price: {product.current_price}</p>
                <p>Sell Price: {product.sell_price}</p>
                <p>Time Left: {product.time_left}</p>
                <p>Best Bidder: {product.best_bidder}</p>
                <p>Bid Counts: {product.bid_counts}</p>
                <p>Description: {product.description}</p>
            </div>
        </div>
    );
}

export default ProductInfor;
