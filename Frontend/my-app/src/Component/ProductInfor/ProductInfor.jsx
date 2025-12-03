import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ProductCard from "../ProductCard/ProductCard";
import { FaDollarSign, FaHeart, FaRegHeart } from "react-icons/fa";
import useWatchlist from "../../hooks/useWatchList.js";
import ProductDescription from "./ProductDescription.jsx";

dayjs.extend(relativeTime);

function ProductInfor() {
    const location = useLocation();
    const { product, isLiked } = location.state || {};
    const [role, setRole] = useState("");
    const [userId, setUserId] = useState("");
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [qaHistory, setQaHistory] = useState([]);
    const [seller, setSeller] = useState({});
    const [bestBidder, setBestBidder] = useState({});
    const [history, setHistory] = useState([]);
    const [question, setQuestion] = useState("");
    const [askStatus, setAskStatus] = useState(""); // để show message gửi thành công
    const [denyBidders, setDenyBidders] = useState([]);

    const [liked, toggleLike] = useWatchlist(isLiked); // use shared hook

    const fetchProfile = async () => {
        try {
            const res = await fetch("http://localhost:3000/account/profile", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            const data = await res.json();
            setRole(data.data.role_description); // hoặc data.data.role tuỳ backend
            setUserId(data.data.id);

        } catch (err) {
            console.error("Lỗi fetch profile:", err);
        }
    };

    fetchProfile();

    useEffect(() => {
        if (product) {
            // fetch seller
            fetch(`http://localhost:3000/product/sellerInfor/${product.id}`)
                .then(res => res.json())
                .then(data => setSeller(data.data[0]));

            // fetch best bidder
            fetch(`http://localhost:3000/product/bestBidder/${product.id}`)
                .then(res => res.json())
                .then(data => setBestBidder(data.data));

            // fetch 5 related products
            fetch(`http://localhost:3000/product/related/${product.id}`)
                .then(res => res.json())
                .then(data => setRelatedProducts(data.data));

            // fetch Q&A history
            fetch(`http://localhost:3000/product/Q_A/${product.id}`)
                .then(res => res.json())
                .then(data => setQaHistory(data.data));

            // fetch bid history
            fetch(`http://localhost:3000/bidding/bid_history/${product.id}`)
                .then(res => res.json())
                .then(data => setHistory(data.data));
            
            // fetch denied bidders
            fetch(`http://localhost:3000/bidding/denyBidder/:${product_id}`)
                .then(res => res.json())
                .then(data => setDenyBidders(data.data));
        }
    }, [product]);

    if (!product) return <p>Product not found.</p>;

    const endTime = dayjs(product.upload_date).add(product.time_left, "seconds");
    const now = dayjs();
    const displayTimeLeft = endTime.diff(now, 'day') < 3
        ? endTime.fromNow()
        : endTime.format('YYYY-MM-DD HH:mm');

    const handleBidClick = async () => {
        try {
            // Step 1: Check if user can bid
            const checkRes = await fetch(`http://localhost:3000/product/checkCanBid`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ product_id: product.id })
            });

            const checkData = await checkRes.json();

            if (!checkData.canBid) {
                alert(`Bạn không thể đặt giá: ${checkData.reason}`);
                return;
            }

            // Step 2: Ask user to confirm bid
            const confirmBid = window.confirm(`Giá đề nghị tối thiểu: ${checkData.suggestedPrice}\nBạn có muốn đặt giá này không?`);
            if (!confirmBid) return;

            // Step 3: Place bid
            const bidRes = await fetch(`http://localhost:3000/product/bid`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    product_id: product.id,
                    price: checkData.suggestedPrice
                })
            });

            const bidData = await bidRes.json();

            if (bidRes.ok) {
                alert(`Đặt giá thành công! Giá: ${bidData.final_price}`);
            } else {
                alert(`Không thể đặt giá: ${bidData.message}`);
            }

        } catch (err) {
            console.error(err);
            alert("Lỗi khi đặt giá!");
        }
    };

    const handleAskSeller = async () => {
        if (!question.trim()) {
            alert("Vui lòng nhập câu hỏi!");
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/contact/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                product_id: product.id,
                question: question.trim()
            })
            });

            const data = await res.json();

            if (data.success) {
                setAskStatus("Gửi câu hỏi thành công! Người bán sẽ nhận email.");
                setQuestion(""); // reset input
                // refresh Q&A nếu muốn show ngay
                setQaHistory(prev => [...prev, { question: question.trim(), answer: null }]);
            } else {
                alert(data.message || "Gửi câu hỏi thất bại.");
            }

        } catch (err) {
            console.error(err);
            alert("Lỗi khi gửi câu hỏi.");
        }
    };

    const handleAnswerChange = (index, value) => {
        setQaHistory(prev => {
            const updated = [...prev];
            updated[index].answerInput = value;
            return updated;
        });
    };

    const handleAnswerSubmit = async (questionId, index) => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch("http://localhost:3000/contact/answer", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ questionId, answer: qaHistory[index].answerInput, productId: product.id })
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Lỗi hệ thống");
                return;
            }

            // Update UI sau khi trả lời thành công
            setQaHistory(prev => {
                const updated = [...prev];
                updated[index].answer = updated[index].answerInput;
                delete updated[index].answerInput;
                return updated;
            });

            alert("Trả lời thành công!");

        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối server");
        }
    };

    const handleDenyBidder = async (userId) => {
        if (!window.confirm("Bạn có chắc muốn từ chối bidder này?")) return;

        try {
            const res = await fetch(`http://localhost:3000/bidding/denyBidder/${product.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ bidderId: userId }),
            });

            const data = await res.json();

            if (res.ok) {
                // Xóa các lượt đấu giá liên quan đến bidder này trong local state
                setHistory(prev => prev.filter(item => item.user_id !== userId));

                alert("Bidder đã bị từ chối thành công!");

                // Nếu muốn, có thể fetch lại thông tin current highest bidder
                // fetchBestBidder();
            } else {
                alert(data.message || "Từ chối thất bại");
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi khi từ chối bidder");
        }
    };

    return (
        <div className="container py-5">
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
                    <div className="d-flex p-5 justify-content-between align-items-start">
                        <div>
                            <h2>{product.name}</h2>
                            <p><strong>Current Price:</strong> {product.current_price}</p>
                            {product.sell_price && <p><strong>Buy Now Price:</strong> {product.sell_price}</p>}
                            <p><strong>Time Left:</strong> {displayTimeLeft}</p>
                            <p><strong>Bid Counts:</strong> {product.bid_counts}</p>
                            
                            <ProductDescription product={product} userId={userId}  />
                            
                            <p><strong>Uploaded:</strong> {dayjs(product.upload_date).format('YYYY-MM-DD HH:mm')}</p>
                        </div>
                        
                        {role === "bidder" && (
                            <div className="ms-3 d-flex flex-column align-items-center">
                                {/* Heart */}
                                {liked ? (
                                <FaHeart
                                    onClick={() => toggleLike(product.id)}
                                    style={{ color: "red", fontSize: "1.5rem", cursor: "pointer", marginBottom: "0.5rem" }}
                                />
                                ) : (
                                <FaRegHeart
                                    onClick={() => toggleLike(product.id)}
                                    style={{ color: "gray", fontSize: "1.5rem", cursor: "pointer", marginBottom: "0.5rem" }}
                                />
                                )}

                                {/* Bid Icon - only show if not denied */}
                                {!denyBidders.some(b => b.user_id === userId) && (
                                <FaDollarSign
                                    onClick={(e) => { e.stopPropagation(); handleBidClick(); }}
                                    style={{ color: "green", fontSize: "1.5rem", cursor: "pointer" }}
                                    title="Place a bid"
                                />
                                )}
                            </div>
                        )}



                        
                    </div>
                </div>
            </div>

            {/* Seller info */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <h5>Seller Info</h5>
                    <p>Name: {seller.full_name}</p>
                    <p>Score: {seller.score}</p>
                </div>
                <div className="col-md-6">
                    <h5>Current Highest Bidder</h5>
                    <p>Name: {bestBidder.full_name}</p>
                    <p>Score: {bestBidder.score || '-'}</p>
                </div>
            </div>

            {/* Related products */}
            <div className="mb-4">
                <h5>5 Products in Same Category</h5>
                <div className="row">
                    {relatedProducts.map((p, idx) => (
                        <div className="col-2" key={idx}>
                            <ProductCard data={p}  />
                        </div>
                    ))}
                </div>
            </div>

            {/* Bid History */}
            <table className="table table-striped table-hover">
                <thead>
                    <tr>
                    <th>Thời điểm</th>
                    <th>Người đặt</th>
                    <th>Giá</th>
                    <th>Hành động</th> {/* thêm cột cho nút X */}
                    </tr>
                </thead>
                <tbody>
                    {history.map((item, idx) => (
                    <tr key={idx}>
                        <td>{item.time}</td>
                        <td>{item.user_id}</td>
                        <td>{item.price}</td>

                        {product.seller === userId && (
                            <td>
                                <button 
                                className="btn btn-sm btn-danger" 
                                onClick={() => handleDenyBidder(item.user_id)}
                                >
                                X
                                </button>
                            </td>
                        )}
                        
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

                        {role === "seller" && !qa.answer ? (
                        <div className="d-flex">
                            <input
                                type="text"
                                className="form-control me-2"
                                placeholder="Nhập câu trả lời..."
                                value={qa.answerInput || ""}
                                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                            />
                            <button
                                className="btn btn-success"
                                onClick={() => handleAnswerSubmit(qa.id, idx)}
                            >
                                Trả lời
                            </button>
                        </div>
                        ) : (
                            <p>{qa.answer || "Not answered yet"}</p>
                        )}
                    </div>
                ))}
            </div>
            
            {/* Ask Seller  */}
            {role === "bidder" && (
                <div className="mb-4">
                    <h5>Ask Seller</h5>
                    <div className="d-flex">
                        <input
                            type="text"
                            className="form-control me-2"
                            placeholder="Nhập câu hỏi của bạn..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={handleAskSeller}>
                            Gửi
                        </button>
                    </div>
                    {askStatus && <small className="text-success mt-1 d-block">{askStatus}</small>}
                </div>
            )}


        </div>
    );
}

export default ProductInfor;
