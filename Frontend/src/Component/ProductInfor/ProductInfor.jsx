import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FaDollarSign, FaHeart, FaRegHeart } from "react-icons/fa";

import ProductCard from "../ProductCard/ProductCard";
import ProductDescription from "./ProductDescription";
import OrderCompletion from "../OrderCompletion/OrderCompletion";

import useWatchlist from "../../hooks/useWatchList";
import * as productService from "../../service/product.service";
import * as accountService from "../../service/account.service";
import * as biddingService from "../../service/bidding.service";
import * as contactService from "../../service/contact.service";

dayjs.extend(relativeTime);

export default function ProductInfor() {
    const { state } = useLocation();
    const { product, isLiked } = state || {};

    const [userId, setUserId] = useState(null);
    const [role, setRole] = useState("");
    const [seller, setSeller] = useState({});
    const [bestBidder, setBestBidder] = useState({});
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [history, setHistory] = useState([]);
    const [qaHistory, setQaHistory] = useState([]);
    const [denyBidders, setDenyBidders] = useState([]);
    const [question, setQuestion] = useState("");
    const [askStatus, setAskStatus] = useState("");
    const [auctionEnded, setAuctionEnded] = useState(false);
    const [liked, toggleLike] = useWatchlist(isLiked);

    /* ================= USER (localStorage only) ================= */
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        try {
            const user = JSON.parse(storedUser);
            setUserId(user.id);
            setRole(user.role || user.role_description || "");
        } catch (err) {
            console.error("Invalid user data", err);
            localStorage.removeItem("user");
        }
    }, []);

    /* ================= AUCTION END CHECK ================= */
    useEffect(() => {
        if (!product?.auction_end_time) return;

        const timer = setInterval(() => {
            if (Date.now() >= new Date(product.auction_end_time).getTime()) {
                setAuctionEnded(true);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [product]);

    const isBuyer = userId && userId === product?.winnerId;
    const isSeller = userId && userId === product?.seller;

    if (auctionEnded && (isBuyer || isSeller)) {
        return (
            <OrderCompletion
                product={product}
                role={isBuyer ? "BUYER" : "SELLER"}
            />
        );
    }

    /* ================= FETCH DETAIL ================= */
    useEffect(() => {
        if (!product?.id) return;

        const fetchData = async () => {
            try {
                const [
                    sellerRes,
                    bidderRes,
                    relatedRes,
                    qaRes,
                    historyRes,
                    deniedRes,
                ] = await Promise.all([
                    productService.getSellerInfo(product.id),
                    productService.getBestBidder(product.id),
                    productService.getRelatedProducts(product.id),
                    productService.getQaHistory(product.id),
                    biddingService.getBidHistory(product.id),
                    biddingService.getDeniedBidders(product.id),
                ]);

                setSeller(sellerRes.data?.[0] || {});
                setBestBidder(bidderRes.data || {});
                setRelatedProducts(relatedRes.data || []);
                setQaHistory(qaRes.data || []);
                setHistory(historyRes.data || []);
                setDenyBidders(deniedRes.data || []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [product?.id]);

    if (!product) return <p>Product not found</p>;

    const endTime = dayjs(product.upload_date).add(product.time_left, "second");
    const displayTime =
        endTime.diff(dayjs(), "day") < 3
            ? endTime.fromNow()
            : endTime.format("YYYY-MM-DD HH:mm");

    /* ================= BID ================= */
    const handleBid = async () => {
        if (!userId) {
            alert("Please login to bid");
            return;
        }

        try {
            const check = await productService.checkCanBid(product.id);
            if (!check.canBid) return alert(check.reason);

            if (!window.confirm(`Giá đề nghị: ${check.suggestedPrice}`)) return;

            await productService.placeBid(product.id, check.suggestedPrice);
            alert("Đặt giá thành công!");
        } catch (err) {
            alert("Bid error");
        }
    };

    /* ================= ASK SELLER ================= */
    const handleAskSeller = async () => {
        if (!userId) {
            alert("Please login to ask seller");
            return;
        }

        if (!question.trim()) return;

        const res = await contactService.askSeller(product.id, question);
        if (res.success) {
            setQaHistory((p) => [...p, { question, answer: null }]);
            setQuestion("");
            setAskStatus("Đã gửi câu hỏi!");
        }
    };


    /* ================= UI ================= */
    return (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

            {/* IMAGE + INFO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <img
                    src={`http://localhost:3000/static/images/${product.id}/${product.image_path[0]}`}
                    className="rounded-xl"
                />

                <div className="md:col-span-2 space-y-3">
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                    <p>💰 Current: {product.current_price}</p>
                    {product.sell_price && <p>⚡ Buy now: {product.sell_price}</p>}
                    <p>⏰ {displayTime}</p>

                    <ProductDescription product={product} userId={userId} />

                    {role === "bidder" && (
                        <div className="flex gap-4 mt-4 items-center">
                            <button onClick={() => toggleLike(product.id)}>
                                {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                            </button>

                            {!denyBidders.some(b => b.user_id === userId) && (
                                <button
                                    onClick={handleBid}
                                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg"
                                >
                                    <FaDollarSign /> Place Bid
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* HISTORY */}
            <div>
                <h3 className="font-semibold mb-3">Bid History</h3>
                {history.length === 0 ? (
                    <p>No bids yet.</p>
                ) : (
                    <table className="w-full table-auto border-collapse">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2">Time</th>
                                <th className="border px-4 py-2">Bidder</th>
                                <th className="border px-4 py-2">Amount</th>
                                {/* deny */}
                                {
                                    role === "seller" && <th className="border px-4 py-2">Deny</th>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((bid, i) => (
                                <tr
                                    key={i}
                                    className={bid.user_id === bestBidder.id ? "bg-yellow-100" : ""}
                                >
                                    <td className="border px-4 py-2">
                                        {dayjs(bid.time).format("YYYY-MM-DD HH:mm:ss")}
                                    </td>

                                    <td className="border px-4 py-2">{bid.full_name}</td>

                                    <td className="border px-4 py-2">{bid.price}</td>

                                    {/* Action column – ALWAYS render <td> */}
                                        {role === "seller" &&
                                            (
                                                <td className="border px-4 py-2 text-center hover:opacity-50">
                                                    <button
                                                        onClick={async () => {
                                                            await biddingService.denyBidder(
                                                                product.id,
                                                                bid.user_id
                                                            );

                                                            setDenyBidders(p => [
                                                                ...p,
                                                                { user_id: bid.user_id }
                                                            ]);
                                                        }}
                                                        className="text-red-500 px-2 py-1 rounded-lg"
                                                    >
                                                        X
                                                    </button>
                                            </td>
                                            )}
                                    
                                </tr>
                            ))}
                    </tbody>

                    </table>
                )}
            </div>
                
            {
                role === "bidder" && (
                    <>
                        {/* RELATED */}
                        <div>
                            <h3 className="font-semibold mb-3">Related Products</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {relatedProducts.map((p, i) => (
                                    <ProductCard key={i} data={p} />
                                ))}
                            </div>
                        </div>
                    </>
                )
            }

            {/* Q&A */}
            <div>
                <h3 className="font-semibold mb-3">Q&A</h3>

                {qaHistory.map((qa, i) => (
                <div key={i} className="mb-3">

                    {/* Question & Answer display */}
                    <div className="border rounded-lg p-3 mb-2">
                        <p><b>Q:</b> {qa.question}</p>
                        <p><b>A:</b> {qa.answer || "Chưa trả lời"}</p>
                    </div>

                        {/* ANSWER – Seller only */}
                        {role === "seller" && !qa.answer && (
                            <div className="border rounded-lg p-3">
                                <input
                                    className="border rounded-lg px-3 py-2 w-full"
                                    placeholder="Nhập câu trả lời..."
                                    onBlur={async (e) => {
                                        const answer = e.target.value.trim();
                                        if (!answer) return;

                                        await contactService.answerQuestion(
                                            product.id,
                                            qa.question,
                                            answer
                                        );

                                        setQaHistory((prev) => {
                                            const copy = [...prev];
                                            copy[i] = { ...copy[i], answer };
                                            return copy;
                                        });
                                    }}
                                />
                            </div>
                        )}
                    </div>
                ))}

                {role === "bidder" && (
                    <div className="flex gap-2 mt-3">
                        <input
                            className="border rounded-lg px-3 py-2 flex-1"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Nhập câu hỏi..."
                        />
                        <button
                            onClick={handleAskSeller}
                            className="bg-blue-600 text-white px-4 rounded-lg"
                        >
                            Gửi
                        </button>
                    </div>
                )}



            </div>
        </div>
    );
}
