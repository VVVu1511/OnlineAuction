import { useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FaDollarSign, FaHeart, FaRegHeart } from "react-icons/fa";
import ProductCard from "../ProductCard/ProductCard";
import ProductDescription from "./ProductDescription";
import OrderCompletion from "../OrderCompletion/OrderCompletion";
import Back from "../Back/Back.jsx";
import useWatchlist from "../../hooks/useWatchList";
import * as productService from "../../service/product.service";
import * as accountService from "../../service/account.service";
import * as biddingService from "../../service/bidding.service";
import * as contactService from "../../service/contact.service";
import {LoadingContext} from "../../context/LoadingContext.jsx";

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
    const { setLoading } = useContext(LoadingContext);

    const baseUrl = `http://localhost:3000/static/images/${product?.id}`;
    const [activeImage, setActiveImage] = useState(product.image_path[0]);

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

        setLoading(true);

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

        setLoading(false);
        
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
            setLoading(true);

            const check = await productService.checkCanBid(product.id);
            if (!check.canBid) return alert(check.reason);

            if (!window.confirm(`Giá đề nghị: ${check.suggestedPrice}`)) return;

            await productService.placeBid(product.id, check.suggestedPrice);
            alert("Đặt giá thành công!");
        } catch (err) {
            alert("Bid error");
        } finally {
            setLoading(false);
        }
    };

    /* ================= ASK SELLER ================= */
    const handleAskSeller = async () => {
        if (!userId) {
            alert("Please login to ask seller");
            return;
        }

        if (!question.trim()) return;

        setLoading(true);

        const res = await contactService.askSeller(product.id, question);
        if (res.success) {
            setQaHistory((p) => [...p, { question, answer: null }]);
            setQuestion("");
            setAskStatus("Đã gửi câu hỏi!");
        }

        setLoading(false);
    };


    /* ================= UI ================= */
    return (
        <div className="mt-5 max-w-7xl mx-auto px-6 py-8 space-y-10">
                <Back />    

                {/* IMAGE + INFO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                <div className="space-y-4">

                {/* Main image */}
                <div className="w-full aspect-square overflow-hidden rounded-xl border bg-white">
                    <img
                    src={`${baseUrl}/${activeImage}`}
                    className="w-full h-full object-cover"
                    />
                </div>

                {/* Thumbnail row */}
                <div className="flex gap-3 overflow-x-auto">
                    {product.image_path.map((img, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveImage(img)}
                        className={`border rounded-lg p-1 flex-shrink-0 ${
                        activeImage === img
                            ? "border-red-500"
                            : "border-gray-200"
                        }`}
                    >
                        <img
                        src={`${baseUrl}/${img}`}
                        className="w-20 h-20 object-cover rounded-md"
                        />
                    </button>
                    ))}
                </div>
            </div>

                <div className="md:col-span-2 pl-6 md:pl-10 space-y-5">

            {/* Product name */}
            <h1 className="text-2xl font-semibold leading-snug">
                {product.name}
            </h1>

            {/* Price block */}
            <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                <p className="text-lg">
                <span className="text-gray-500">Current price</span>{" "}
                <span className="text-red-600 font-bold text-2xl">
                    {product.current_price}
                </span>
                </p>

                {product.sell_price && (
                <p className="text-sm text-gray-700">
                    Buy now:{" "}
                    <span className="font-semibold text-green-600">
                    {product.sell_price}
                    </span>
                </p>
                )}
            </div>

            {/* Time */}
            <p className="text-sm text-gray-500">
                ⏰ {displayTime}
            </p>

            {/* Description */}
            <div className="pt-2">
                <ProductDescription product={product} userId={userId} />
            </div>

            {/* Actions */}
            {role === "bidder" && (
                <div className="flex gap-4 pt-4 items-center">

                {/* Like */}
                <button
                    onClick={() => toggleLike(product.id)}
                    className="p-2 border rounded-full hover:bg-gray-100"
                >
                    {liked ? (
                    <FaHeart className="text-red-500" />
                    ) : (
                    <FaRegHeart />
                    )}
                </button>

                {/* Bid */}
                {!denyBidders.some((b) => b.user_id === userId) && (
                    <button
                    onClick={handleBid}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
                    >
                    <FaDollarSign />
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
