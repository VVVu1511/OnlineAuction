import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as productService from "../../services/product.service.jsx";
import * as biddingService from "../../services/bidding.service.jsx";
import * as contactService from "../../services/contact.service.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import { LoadingContext } from "../../context/LoadingContext.jsx";
import Back from "../Back/Back.jsx";
import ProductCard from "../ProductCard/ProductCard.jsx";
import ReactQuill from "react-quill";
import dayjs from "../../utils/dayjs.js";
import {
    getWatchlistState,
    addWatchlist,
    removeWatchlist
} from "../../services/account.service.jsx";
import { FaDollarSign} from "react-icons/fa";


export function Heart({ userId, productId }) {
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userId || !productId) return;

        getWatchlistState(userId, productId)
            .then(data => setLiked(data.liked));
    }, [userId, productId]);

    const toggle = async (e) => {
        e.stopPropagation();
        
        if (!userId || !productId || loading) return;

        setLoading(true);
        try {
            if (liked) {
                await removeWatchlist(userId, productId);
                setLiked(false);
            } else {
                await addWatchlist(userId, productId);
                setLiked(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggle}
            className="text-2xl"
            disabled={loading}
        >
            {liked ? "❤️" : "🤍"}
        </button>
    );
}

export function maskName(fullName) {
    if (!fullName) return "";

    const parts = fullName.trim().split(/\s+/);
    const lastName = parts[parts.length - 1];

    return "****" + lastName;
}

export default function Product() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { user } = useContext(AuthContext);
    const { loading, setLoading } = useContext(LoadingContext);

    const [product, setProduct] = useState(null);
    const [seller, setSeller] = useState(null);
    const [bestBidder, setBestBidder] = useState(null);
    const [qaHistory, setQaHistory] = useState([]);
    const [related, setRelated] = useState([]);
    const [error, setError] = useState("");
    const [bidHistory, setBidHistory] = useState([]);
    const [saving, setSaving] = useState(false);
    const [mainImage, setMainImage] = useState(null);
    const [newText, setNewText] = useState("");
    const [question, setQuestion] = useState("");

    const [now, setNow] = useState(dayjs());
    const [endHandled, setEndHandled] = useState(false);

    /* ⏱ Tick mỗi giây */
    useEffect(() => {
        const timer = setInterval(() => {
            setNow(dayjs());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    /* ⏰ Thời gian kết thúc */
    const endTime = product?.end_date ? dayjs(product.end_date) : null;

    /* 🔚 Điều kiện kết thúc */
    const isTimeEnded = endTime && now.isAfter(endTime);
    const isBuyNowEnded =
        product?.sell_price != null &&
        product?.current_price >= product.sell_price;

    const isEnded = isTimeEnded || isBuyNowEnded;

    /* 📝 Text hiển thị */
    let endTimeText = "Đã kết thúc";

    if (!isEnded && endTime) {
        const diffSeconds = endTime.diff(now, "second");

        if (diffSeconds <= 300) {
            const d = dayjs.duration(diffSeconds, "seconds");
            endTimeText = `Còn ${d.minutes()}:${String(d.seconds()).padStart(2, "0")}`;
        } else {
            endTimeText = endTime.format("HH:mm DD/MM/YYYY");
        }
    }

    if (isBuyNowEnded) {
        endTimeText = "Đã mua ngay";
    }

    /* 🚨 Khi kết thúc → gọi API + redirect */
    useEffect(() => {
        if (!product) return;
        if (!isEnded) return;
        if (endHandled) return;

        setEndHandled(true);

        console.log("⏹ Auction ended");

        // 🔥 Gọi API (simulate)
        // auctionService.finishAuction(product.id)
        //     .then(() => {
        //         if (
        //             user?.id === product.winner ||
        //             user?.id === product.seller
        //         ) {
        
        if(user?.role === "seller" || (user?.role === "bidder" && user?.id === product?.best_bidder)){
            navigate(`/order/complete/${product.id}`);
        }

        //         } else {
        //             navigate(`/product/${product.id}`);
        //         }
        //     })
        //     .catch(console.error);

    }, [isEnded, endHandled, product]);


    /* ================= ASK SELLER ================= */
    const handleAskSeller = async () => {
        if (!user) {
            alert("Please login to ask seller");
            return;
        }

        if (!question.trim()) return;

        // setLoading(true);

        const res = await contactService.askSeller(product.id, question, user.id);

        if (res.success) {
            setQaHistory((p) => [...p, { question, answer: null }]);
            setQuestion("");
            setAskStatus("Đã gửi câu hỏi!");
        }

        // setLoading(false);
    };

    const handleAppend = async () => {
        const plainText = stripHtml(newText);
        if (!plainText.trim()) {
            alert("Nhập nội dung mới trước khi thêm.");
            return;
        }

        try {
            setSaving(true);

            const res = await productService.appendProductDescription(
                product.id,
                plainText
            );

            if (res.success) {
                loadData();
                setNewText("");
                alert("Thêm mô tả thành công!");

            } else {
                alert(res.message || "Thêm thất bại");
            }
        } catch (err) {
            console.error("Append description error:", err);
            alert(err.response?.data?.message || "Lỗi khi thêm mô tả");
        } finally {
            setSaving(false);
        }
    };

    // ===== Load product detail =====
    const loadData = async () => {
        try {
            setLoading(true);

            const [
                productRes,
                sellerRes,
                bidderRes,
                qaRes,
                relatedRes,
                bidHistoryRes
            ] = await Promise.all([
                productService.getProductInfo(id),
                productService.getSellerInfo(id),
                productService.getBestBidder(id),
                productService.getQaHistory(id),
                productService.getRelatedProducts(id),
                biddingService.getBidHistory(id)
            ]);


            setProduct(productRes?.data || productRes);
            setSeller(sellerRes.success ? sellerRes.data : null);
            setBestBidder(bidderRes.success ? bidderRes.data : null);
            setQaHistory(qaRes.success ? qaRes.data : []);
            setRelated(relatedRes.success ? relatedRes.data : []);
            setBidHistory(bidHistoryRes.success ? bidHistoryRes.data : []);
        } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Không tải được sản phẩm"
                );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        loadData();
        
    }, [id, setLoading]);

    useEffect(() => {
        if (product?.image_path?.length) {
            setMainImage(product.image_path[0]);
        }
    }, [product]);


    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!product) return null;

    // ===== Helpers =====
    const formatTime = (endTime) => {
        const diff = new Date(endTime) - new Date();
        const days = diff / (1000 * 60 * 60 * 24);

        if (days > 3) return new Date(endTime).toLocaleString();

        const minutes = Math.floor(diff / (1000 * 60));
        if (minutes < 60) return `${minutes} phút nữa`;

        const hours = Math.floor(minutes / 60);
        return `${hours} giờ nữa`;
    };
    

    const handleBid = async () => {
        if (!user.id) {
            alert("Please login to bid");
            return;
        }

        try {
            setLoading(true);

            const check = await biddingService.checkCanBid(product.id, user.id);
            
            if (!check.data.canBid) return alert(check.reason);

            if (!window.confirm(`Giá đề nghị: ${check.data.suggestedPrice}`)) return;

            await biddingService.placeBid(product.id, check.data.suggestedPrice, user.id);

            loadData();

            alert("Đặt giá thành công!");

        } catch (err) {
            alert("Bid error");

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            <Back />
           {/* ========= MAIN INFO ========= */}
            <section className="grid grid-cols-2 gap-8">
                <div>
                    {/* ===== IMAGE LỚN ===== */}
                    <img
                        src={
                            product.image_path[0]
                                ? `http://localhost:3000/static/images/${product.id}/${mainImage}`
                                : "/no-image.png"
                        }
                        alt={product.name}
                        className="w-full h-96 object-cover rounded border"
                    />

                    {/* ===== IMAGE NHỎ ===== */}
                    <div className="grid grid-cols-4 gap-2 mt-3">
                        {product.image_path.map((img, i) => (
                            <img
                                key={i}
                                src={`http://localhost:3000/static/images/${product.id}/${img}`}
                                alt=""
                                onClick={() => setMainImage(img)}
                                className={`h-24 w-full object-cover rounded cursor-pointer border
                                    ${
                                        mainImage === img
                                            ? "border-blue-600"
                                            : "border-transparent hover:border-gray-400"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="d-flex justify-between">
                        <h1 className="text-2xl font-bold">{product.name}</h1>

                        {/* Actions */}
                        {user?.role === "bidder" && (
                            <div className="flex gap-4 text-2xl items-center">
                                <Heart userId={user.id} productId={product.id}/>

                                {
                                    (
                                        <button
                                            onClick={handleBid}
                                            className="
                                                group
                                                flex items-center justify-center
                                                rounded-full
                                                text-gray-600
                                                hover:text-red-600
                                                transition
                                                duration-200
                                                hover:scale-110
                                                active:scale-95
                                            "
                                            title="Đặt giá"
                                        >
                                            <FaDollarSign className="text-xl transition group-hover:rotate-6" />
                                        </button>
                                    )
                                } 
                            </div>
                        )}
                    </div>

                    <p>
                        Giá hiện tại:{" "}
                        <span className="font-semibold text-red-600">
                            {product.current_price?.toLocaleString()} đ
                        </span>
                    </p>

                    {product.sell_price && (
                        <p className="text-green-600">
                            Giá mua ngay: {product.sell_price?.toLocaleString()} đ
                        </p>
                    )}

                    <p>
                        Người bán: <b>{seller?.full_name}</b> (
                        {seller?.rating || 0} ⭐)
                    </p>

                    <p>
                        Người ra giá cao nhất:{" "}
                        <b>{bestBidder?.full_name || "—"}</b> (
                        {bestBidder?.rating || 0} ⭐)
                    </p>

                    <p>
                        Ngày đăng:{" "}
                        {dayjs(product.upload_date).format("HH:mm DD/MM/YYYY")}
                    </p>

                    <p>
                        Kết thúc: <b>{endTimeText}</b>
                    </p>
                </div>

                {/* ===== Seller editor ===== */}
                {user?.role === "seller" && (
                    <div className="border rounded-xl p-4 bg-gray-50 space-y-3">
                        <p className="font-medium text-gray-800">
                            ✏️ Thêm mô tả mới
                        </p>

                        <ReactQuill
                            theme="snow"
                            value={newText}
                            onChange={setNewText}
                            placeholder="Thêm nội dung mô tả mới..."
                        />

                        <div className="flex justify-end">
                            <button
                                onClick={handleAppend}
                                disabled={saving}
                                className={`
                                    px-5 py-2 rounded-lg text-sm font-medium
                                    transition
                                    ${
                                        saving
                                            ? "bg-gray-300 cursor-not-allowed"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    }
                                `}
                            >
                                {saving ? "Saving..." : "Add"}
                            </button>
                        </div>
                    </div>
                )}
            
            </section>
            
            {
                user && (
                    <section>
                        <h2 className="text-xl font-bold mb-3">
                            Lịch sử đấu giá
                        </h2>

                        <table className="w-full border border-gray-200 text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border px-3 py-2 text-left">Thời điểm</th>
                                    <th className="border px-3 py-2 text-left">Người mua</th>
                                    <th className="border px-3 py-2 text-right">Giá</th>
                                    {/* CHỈ SELLER MỚI THẤY */}
                                    {user.role === "seller" && (
                                        <th className="border px-3 py-2 text-center w-20">
                                            Từ chối
                                        </th>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {bidHistory.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="text-center py-4 text-gray-500">
                                            Chưa có lượt đấu giá
                                        </td>
                                    </tr>
                                )}

                                {bidHistory.map((bid, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border px-3 py-2">
                                            {new Date(bid.time).toLocaleString("vi-VN")}
                                        </td>

                                        <td className="border px-3 py-2">
                                            {user.role == "seller"
                                                ? bid.full_name
                                                : maskName(bid.full_name)}
                                        </td>

                                        <td className="border px-3 py-2 text-right font-medium">
                                            {bid.price?.toLocaleString("vi-VN")} ₫
                                        </td>

                                        {/* ===== ACTION COLUMN ===== */}
                                        {user.role === "seller" && (
                                            <td className="border px-3 py-2 text-center">
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
                    </section>

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
                        {user?.role === "seller" && !qa.answer && (
                            <div className="border rounded-lg p-3 space-y-2">
                                <input
                                    className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Nhập câu trả lời..."
                                    value={qa.answerDraft || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setQaHistory((prev) => {
                                            const copy = [...prev];
                                            copy[i] = { ...copy[i], answerDraft: value };
                                            return copy;
                                        });
                                    }}
                                />

                                <div className="flex justify-end">
                                    <button
                                        onClick={async () => {
                                            const answer = qa.answerDraft?.trim();
                                            if (!answer) return;

                                            await contactService.answerQuestion({
                                                productId: product.id,
                                                questionId: qa.id,        // ⚠️ nên dùng id, không dùng text
                                                answer
                                            });

                                            setQaHistory((prev) => {
                                                const copy = [...prev];
                                                copy[i] = {
                                                    ...copy[i],
                                                    answer,
                                                    answerDraft: ""
                                                };
                                                return copy;
                                            });
                                        }}
                                        className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Gửi
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                ))}

                {user?.role === "bidder" && (
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

            {/* ========= RELATED PRODUCTS ========= */}
            {!user || user.role === "bidder" && (
                <section>
                    <h2 className="text-xl font-bold mb-4">
                        Sản phẩm cùng chuyên mục
                    </h2>

                    <div className="grid grid-cols-5 gap-4">
                        {related.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )
            }
        </div>
    );
}
