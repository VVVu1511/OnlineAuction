import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ProductCard from "../ProductCard/ProductCard";
import { FaDollarSign, FaHeart, FaRegHeart } from "react-icons/fa";
import useWatchlist from "../../hooks/useWatchList.js";
import ProductDescription from "./ProductDescription.jsx";
import * as productService from "../../service/product.service.jsx"
import * as accountService from "../../service/account.service.jsx"
import * as biddingService from "../../service/bidding.service.jsx"
import * as contactService from "../../service/contact.service.jsx"
import OrderCompletion from "../OrderCompletion/OrderCompletion.jsx";

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
    const [auctionEnded, setAuctionEnded] = useState(false);
    const isBuyer = currentUser?.id === product?.winnerId;
    const isSeller = currentUser?.id === product?.sellerId;

    // ✅ REALTIME CHECK
    useEffect(() => {
        if (!product?.auction_end_time) return;

        const checkEnded = () => {
        const now = new Date().getTime();
        const endTime = new Date(product.auction_end_time).getTime();

        if (now >= endTime) {
            setAuctionEnded(true);
        }
        };

        checkEnded(); // check ngay khi mount

        const interval = setInterval(checkEnded, 1000); // mỗi 1s

        return () => clearInterval(interval);
    }, [product]);

    if (auctionEnded) {
        if (isBuyer || isSeller) {
            return (
                <OrderCompletion
                product={product}
                role={isBuyer ? "BUYER" : "SELLER"}
                />
            );
        }
    }

    const fetchProfile = async () => {
        try {
            const data = await accountService.getProfile();
            
            setRole(data.data.role_description); // hoặc data.data.role tuỳ backend
            setUserId(data.data.id);

        } catch (err) {
            console.error("Lỗi fetch profile:", err);
        }
    };

    fetchProfile();

    useEffect(() => {
        if (!product?.id) return;

        const fetchData = async () => {
            try {
                const sellerRes = await productService.getSellerInfo(product.id);
                setSeller(sellerRes.data?.[0] || null);

                const bestBidderRes = await productService.getBestBidder(product.id);
                setBestBidder(bestBidderRes.data || null);

                const relatedRes = await productService.getRelatedProducts(product.id);
                setRelatedProducts(relatedRes.data || []);

                const qaRes = await productService.getQaHistory(product.id);
                setQaHistory(qaRes.data || []);

                const historyRes = await biddingService.getBidHistory(product.id);
                setHistory(historyRes.data || []);

                const deniedRes = await biddingService.getDeniedBidders(product.id);
                setDenyBidders(deniedRes.data || []);
            } catch (err) {
                console.error("Fetch product detail error:", err.message);
            }
        };

        fetchData();

    }, [product?.id]);

    if (!product) return <p>Product not found.</p>;

    const endTime = dayjs(product.upload_date).add(product.time_left, "seconds");
    const now = dayjs();
    const displayTimeLeft = endTime.diff(now, 'day') < 3
        ? endTime.fromNow()
        : endTime.format('YYYY-MM-DD HH:mm');

    const handleBidClick = async () => {
        try {
            // Step 1: Check if user can bid
            const checkData = await productService.checkCanBid(product.id);

            if (!checkData.canBid) {
                alert(`Bạn không thể đặt giá: ${checkData.reason}`);
                return;
            }

            // Step 2: Confirm bid
            const confirmBid = window.confirm(
                `Giá đề nghị tối thiểu: ${checkData.suggestedPrice}\nBạn có muốn đặt giá này không?`
            );
            if (!confirmBid) return;

            // Step 3: Place bid
            const bidData = await productService.placeBid(product.id, checkData.suggestedPrice);

            alert(`Đặt giá thành công! Giá: ${bidData.final_price}`);
        } catch (err) {
            console.error("Bid error:", err);
            alert(err.response?.data?.message || "Lỗi khi đặt giá!");
        }
    };

    const handleAskSeller = async () => {
        if (!question.trim()) {
            alert("Vui lòng nhập câu hỏi!");
            return;
        }

        try {
            const data = await contactService.askSeller(product.id, question.trim());

            if (data.success) {
                setAskStatus("Gửi câu hỏi thành công! Người bán sẽ nhận email.");
                setQuestion("");

                // optimistic update Q&A
                setQaHistory(prev => [
                    ...prev,
                    { question: question.trim(), answer: null }
                ]);
            } else {
                alert(data.message || "Gửi câu hỏi thất bại.");
            }
        } catch (err) {
            console.error("Ask seller error:", err);
            alert(err.response?.data?.message || "Lỗi khi gửi câu hỏi.");
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
            const answerText = qaHistory[index].answerInput;

            if (!answerText?.trim()) {
                alert("Vui lòng nhập câu trả lời");
                return;
            }

            const data = await contactService.answerQuestion(
                questionId,
                answerText.trim(),
                product.id
            );

            if (!data.success) {
                alert(data.message || "Lỗi hệ thống");
                return;
            }

            // Update UI sau khi trả lời thành công
            setQaHistory(prev => {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    answer: answerText.trim(),
                };
                delete updated[index].answerInput;
                return updated;
            });

            alert("Trả lời thành công!");
        } catch (err) {
            console.error("Answer question error:", err);
            alert(err.response?.data?.message || "Lỗi kết nối server");
        }
    };

    const handleDenyBidder = async (userId) => {
        if (!window.confirm("Bạn có chắc muốn từ chối bidder này?")) return;

        try {
            const data = await biddingService.denyBidder(product.id, userId);

            if (!data.success) {
                alert(data.message || "Từ chối thất bại");
                return;
            }

            // Remove bidder bids from local state
            setHistory(prev => prev.filter(item => item.user_id !== userId));

            alert("Bidder đã bị từ chối thành công!");
        } catch (err) {
            console.error("Deny bidder error:", err);
            alert(err.response?.data?.message || "Lỗi khi từ chối bidder");
        }
    };

    //add var for automation (has join button -> set max) | not auto

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
