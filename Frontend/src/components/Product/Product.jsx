import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import * as productService from "../../services/product.service.jsx";
import * as biddingService from "../../services/bidding.service.jsx";
import * as contactService from "../../services/contact.service.jsx";
import * as accountService from "../../services/account.service.jsx";
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
import { useConfirmModal } from "../../context/ConfirmModalContext";
import { useResultModal } from "../../context/ResultModalContext";

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
    const { showConfirm } = useConfirmModal();
    const { showResult } = useResultModal();
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
    const [isDenied, setIsDenied] = useState(false);
    const [now, setNow] = useState(dayjs());
    const [endHandled, setEndHandled] = useState(false);
    const [sellerRating, setSellerRating] = useState(null);
    const [bidderRating, setBidderRating] = useState(null);
    
    useEffect(() => {
        async function fetchRatings() {
            if (product.seller) {
                const res = await accountService.getUserRatingPercent(product.seller);
                if (res.success) setSellerRating(res.data);
            }

            if (product.best_bidder) {
                const res = await accountService.getUserRatingPercent(product.best_bidder);
                if (res.success) setBidderRating(res.data);
            }
        }

        fetchRatings();
    }, [seller?.id, bestBidder?.id]);

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

    if (endTime) {
        const now = dayjs();

        if (endTime.isAfter(now)) {
            const diffSeconds = endTime.diff(now, "second");

            // ⏱️ Dưới 5 phút → mm:ss
            if (diffSeconds <= 300) {
                const d = dayjs.duration(diffSeconds, "seconds");
                endTimeText = `Còn ${d.minutes()}:${String(d.seconds()).padStart(2, "0")}`;
            }
            // ⏳ Dưới 3 ngày → relative time
            else if (diffSeconds < 3 * 24 * 60 * 60) {
                endTimeText = endTime.fromNow(); // "2 ngày nữa"
            }
            // 📅 Trên 3 ngày → datetime
            else {
                endTimeText = endTime.format("HH:mm DD/MM/YYYY");
            }
        }
    }

    if (isBuyNowEnded) {
        endTimeText = "Đã mua ngay";
    }

    /* 🚨 Khi kết thúc → gọi API + redirect */
    useEffect(() => {
        if (!product) return;
        if (!user) return;

        const now = dayjs();

        // ⛔ Chưa kết thúc → không làm gì
        if (!product.end_date || dayjs(product.end_date).isAfter(now)) return;

        // ✅ Chỉ seller hoặc bidder thắng mới được redirect
        const canAccess =
            user.role === "seller" ||
            (user.role === "bidder" && user.id === product.best_bidder);

        if (!canAccess) return;

        navigate(`/order/complete/${product.id}`);
    }, [product, user, navigate]);

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

    // strip HTML from Quill output
    const stripHtml = (html) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };
    
    const handleAppend = async () => {
        const plainText = stripHtml(newText);

        if (!plainText.trim()) {
            // giữ inline, không popup
            console.warn("Empty append content");
            return;
        }

        showConfirm({
            title: "Xác nhận thêm mô tả",
            message: (
                <div className="space-y-3 text-sm">
                    <p className="font-semibold text-gray-700">
                        Nội dung sẽ được thêm:
                    </p>

                    <p className="bg-gray-100 p-2 rounded whitespace-pre-wrap max-h-40 overflow-auto">
                        {plainText}
                    </p>

                    <p className="text-orange-600 text-xs">
                        Nội dung này sẽ được thêm vào mô tả hiện tại
                    </p>
                </div>
            ),
            onConfirm: async () => {
                try {
                    setSaving(true);

                    const res = await productService.appendProductDescription(
                        product.id,
                        plainText
                    );

                    if (res.success) {
                        loadData();
                        setNewText("");

                        showResult({
                            success: true,
                            message: "Thêm mô tả thành công"
                        });
                    } else {
                        showResult({
                            success: false,
                            message: res.message || "Thêm mô tả thất bại"
                        });
                    }
                } catch (err) {
                    console.error("Append description error:", err);

                    showResult({
                        success: false,
                        message:
                            err.response?.data?.message ||
                            "Lỗi khi thêm mô tả"
                    });
                } finally {
                    setSaving(false);
                }
            }
        });
    };

    useEffect(() => {
        if (!user?.id || !product?.id) return;

        const checkDenied = async () => {
            try {
                const res = await biddingService.checkUserDeniedBid(
                    product.id,
                    user.id
                );

                if (res.success) {
                    setIsDenied(res.denied);
                }
            } catch (err) {
                console.error(err);
            }
        };

        checkDenied();
    }, [user, product]);

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
    
    const [bidError, setBidError] = useState("");

    const handleBid = async () => {
        if (!user?.id) {
            console.warn("User not logged in");
            return;
        }

        try {
            const check = await biddingService.checkCanBid(product.id, user.id);

            if (!check.data.canBid) {
                setBidError(check.data.reason);
                return;
            }

            const price = check.data.suggestedPrice;

            showConfirm({
                title: "Xác nhận đặt giá",
                message: (
                    <div className="space-y-3 text-sm">
                        <p>Bạn sắp đặt giá cho sản phẩm:</p>

                        <p className="bg-gray-100 p-3 rounded text-center text-lg font-semibold text-green-600">
                            {price.toLocaleString()} ₫
                        </p>

                        <p className="text-orange-600 text-xs">
                            Sau khi đặt giá, bạn không thể hoàn tác
                        </p>
                    </div>
                ),
                onConfirm: async () => {
                    try {
                        setLoading(true);

                        await biddingService.placeBid(
                            product.id,
                            price,
                            user.id
                        );

                        await loadData();

                        showResult({
                            success: true,
                            message: "Đặt giá thành công"
                        });
                    } catch (err) {
                        console.error("Bid error:", err);

                        showResult({
                            success: false,
                            message:
                                err.response?.data?.message ||
                                "Đặt giá thất bại"
                        });
                    } finally{
                        setLoading(false);
                    }
                }
            });

        } catch (err) {
            console.error("Check bid error:", err);

            showResult({
                success: false,
                message: "Không thể kiểm tra điều kiện đặt giá"
            });
        }
    };

    const uniqueBidders = [
        ...new Map(
            bidHistory.map(b => [b.user_id, b])
        ).values()
    ];

    const [answerErrors, setAnswerErrors] = useState({});
    const [questionError, setQuestionError] = useState("");

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!product) return null;

    return (
        <div className="space-y-10">
            <Back />
            {/* ========= MAIN INFO ========= */}
                <section className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                {/* ===== IMAGE SLIDESHOW ===== */}
                <div className="relative overflow-hidden rounded-lg border bg-gray-100">
                    <img
                        key={mainImage} // 👈 quan trọng để trigger animation
                        src={
                            product.image_path[0]
                                ? `http://localhost:3000/static/images/${product.id}/${mainImage}`
                                : "/no-image.png"
                        }
                        alt={product.name}
                        className="
                            w-full h-96 object-cover
                            transition-all duration-500 ease-in-out
                            animate-fade
                        "
                    />
                </div>

                {/* ===== THUMBNAILS ===== */}
                <div className="grid grid-cols-4 gap-2">
                    {product.image_path.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setMainImage(img)}
                            className={`
                                relative overflow-hidden rounded border
                                transition
                                ${
                                    mainImage === img
                                        ? "ring-2 ring-blue-500 scale-[1.02]"
                                        : "hover:ring-1 hover:ring-gray-400"
                                }
                            `}
                        >
                            <img
                                src={`http://localhost:3000/static/images/${product.id}/${img}`}
                                alt=""
                                className="h-24 w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            </div>

                <div className="space-y-3">
                    <div className="d-flex justify-between">
                        <h1 className="text-2xl font-bold">{product.name}</h1>

                        {/* Actions */}
                        {user?.role === "bidder" && (
                            <div className="flex gap-4 text-2xl items-center">
                                <Heart userId={user.id} productId={product.id} />

                                {/* ===== Bid button ===== */}
                                {!isDenied && !isTimeEnded &&  (
                                    <button
                                        onClick={handleBid}
                                        title="Đặt giá"
                                        className="
                                            group
                                            flex items-center justify-center
                                            rounded-full
                                            text-gray-600
                                            transition duration-200
                                            hover:text-green-600
                                            hover:scale-110
                                            active:scale-95
                                        "
                                    >
                                        <FaDollarSign className="text-xl transition group-hover:rotate-6" />
                                    </button>
                                )}
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
                        Người bán: <b>{seller?.full_name}</b>{" "}
                        <span className="text-yellow-500 font-semibold">
                            ({sellerRating?.percent ?? 0}%)
                        </span>
                    </p>

                    <p>
                        Người ra giá cao nhất:{" "}
                        <b>{bestBidder?.full_name || "—"}</b>{" "}
                        <span className="text-yellow-500 font-semibold">
                            ({bidderRating?.percent ?? 0}%)
                        </span>
                    </p>

                    <p>
                        Ngày đăng:{" "}
                        {dayjs(product.upload_date).format("HH:mm DD/MM/YYYY")}
                    </p>

                    <p>
                        Kết thúc: <b>{endTimeText}</b>
                    </p>

                </div>
                
                {user?.role === "seller" && user.id === product.seller && (
                    <SellerEditProduct
                        product={product}
                        onUpdated={loadData}
                    />
                )}

                {/* ===== Current description ===== */}
                <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Mô tả
                    </h2>

                    <div className="mt-3 space-y-2 text-gray-700 text-sm leading-relaxed">
                        {product.description
                            .replace(/\\n/g, "\n")
                            .split("\n")
                            .map((line, idx) => (
                                <p key={idx}>
                                    {line || <span className="block h-3" />}
                                </p>
                            ))}
                    </div>
                </div>

                {/* ===== Seller editor ===== */}
                {user?.role === "seller" && (
                    <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
                        <p className="font-semibold text-gray-800 flex items-center gap-2">
                            ✏️ <span>Thêm mô tả mới</span>
                        </p>

                        <div className="rounded-lg overflow-hidden border border-gray-300 bg-white">
                            <ReactQuill
                                theme="snow"
                                value={newText}
                                onChange={setNewText}
                                placeholder="Thêm nội dung mô tả mới..."
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleAppend}
                                disabled={saving}
                                className={`
                                    inline-flex items-center gap-2
                                    px-5 py-2 rounded-lg text-sm font-semibold
                                    transition-all duration-200
                                    ${
                                        saving
                                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                                    }
                                `}
                            >
                                {saving ? "Saving..." : "Add"}
                            </button>
                        </div>
                    </div>
                )}
            </section>
                
                {/* Xem danh gia nguoi ban */}
                {user?.role === "bidder" && (
                    <p>
                        Người bán: <b>{seller.full_name}</b>{" "}
                        <Link
                            to={`/ratings/${seller.id}`}
                            className="text-blue-600 text-sm hover:underline"
                        >
                            (Xem đánh giá)
                        </Link>
                    </p>
                )}

                {/* Xem danh gia nguoi dau gia */}
                {user?.role === "seller" && uniqueBidders.map((bidder) => (
                    <p key={bidder.user_id}>
                        Người đấu giá: <b>{bidder.full_name}</b>{" "}
                        <Link
                            to={`/ratings/${bidder.user_id}`}
                            className="text-blue-600 text-sm hover:underline"
                        >
                            (Xem đánh giá)
                        </Link>
                    </p>
                ))}


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

                                                        alert("Đã từ chối người đấu giá này.");
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
                                        setAnswerErrors("");
                                    }}
                                />

                                {answerErrors[i] && (
                                    <p className="text-sm text-red-500">{answerErrors[i]}</p>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        onClick={async () => {
                                            const answer = qa.answerDraft?.trim();

                                            if (!answer) {
                                                setAnswerErrors((prev) => ({
                                                    ...prev,
                                                    [i]: "Câu trả lời không được để trống"
                                                }));
                                                return;
                                            }

                                            await contactService.answerQuestion({
                                                productId: product.id,
                                                questionId: qa.id,
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

                                            setAnswerErrors((prev) => ({ ...prev, [i]: "" }));
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
                            className={`border rounded-lg px-3 py-2 flex-1
                                ${questionError ? "border-red-400" : ""}`}
                            value={question}
                            onChange={(e) => {
                                setQuestion(e.target.value);
                                setQuestionError("");
                            }}
                            placeholder="Nhập câu hỏi..."
                        />

                        {questionError && (
                            <p className="text-sm text-red-500 mt-1">{questionError}</p>
                        )}

                        <button
                            onClick={() => {
                                if (!question.trim()) {
                                    setQuestionError("Câu hỏi không được để trống");
                                    return;
                                }

                                handleAskSeller();
                            }}
                            className="bg-blue-600 text-white px-4 rounded-lg"
                        >
                            Gửi
                        </button>

                    </div>
                )}
            </div>

            {/* ========= RELATED PRODUCTS ========= */}
            {(!user || user.role === "bidder") && (
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

            <AlertModal
                open={!!bidError}
                message={bidError}
                onClose={() => setBidError("")}
            />
        </div>
    );
}

function AlertModal({ open, message, onClose }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-red-600">
                    ⚠️ Không thể đấu giá
                </h3>

                <p className="mt-3 text-gray-700">
                    {message}
                </p>

                <button
                    onClick={onClose}
                    className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 transition"
                >
                    Đóng
                </button>
            </div>
        </div>
    );
}

function SellerEditProduct({ product, onUpdated }) {
    const [name, setName] = useState(product.name);
    const [sellPrice, setSellPrice] = useState(product.sell_price || "");
    const [endDate, setEndDate] = useState(
        dayjs(product.end_date).format("YYYY-MM-DDTHH:mm")
    );
    const [saving, setSaving] = useState(false);
    const { showConfirm } = useConfirmModal();
    const { showResult } = useResultModal();


    /* ===== VALIDATE ===== */
    const validate = () => {
        if (!name.trim()) {
            return "Tên sản phẩm không được để trống";
        }

        if (sellPrice && Number(sellPrice) <= product.current_price) {
            return "Giá mua ngay phải lớn hơn giá hiện tại";
        }

        if (dayjs(endDate).isSameOrBefore(dayjs(product.upload_date))) {
            return "Ngày kết thúc phải sau ngày đăng";
        }

        return null;
    };

    const handleSave = async () => {
        const error = validate();
        if (error) {
            showResult({
                success: false,
                message: error
            });
            return;
        }

        showConfirm({
            title: "Xác nhận cập nhật sản phẩm",
            message: (
                <div className="space-y-2 text-sm">
                    <p>Bạn có chắc muốn cập nhật thông tin sản phẩm?</p>

                    <div className="border rounded p-2 bg-gray-50 text-xs space-y-1">
                        <p>
                            <b>Tên:</b> {name.trim()}
                        </p>
                        <p>
                            <b>Giá bán ngay:</b>{" "}
                            {sellPrice ? `${sellPrice.toLocaleString()} đ` : "Không có"}
                        </p>
                        <p>
                            <b>Ngày kết thúc:</b>{" "}
                            {new Date(endDate).toLocaleString()}
                        </p>
                    </div>
                </div>
            ),
            onConfirm: async () => {
                try {
                    setSaving(true);

                    const res = await productService.updateProductInfo(
                        product.id,
                        {
                            name: name.trim(),
                            sell_price: sellPrice || null,
                            end_date: endDate
                        }
                    );

                    showResult({
                        success: res.success,
                        message: res.success
                            ? "Cập nhật sản phẩm thành công"
                            : res.message || "Cập nhật thất bại"
                    });

                    if (res.success) {
                        onUpdated?.();
                    }

                } catch (err) {
                    showResult({
                        success: false,
                        message:
                            err.response?.data?.message ||
                            "Cập nhật thất bại"
                    });
                } finally {
                    setSaving(false);
                }
            }
        });
    };

    return (
        <>
            <div className="mt-6 rounded-xl border bg-gray-50 p-4 space-y-4">
                <h3 className="font-semibold">🛠 Chỉnh sửa sản phẩm</h3>

                <input
                    className="w-full border rounded-lg px-3 py-2"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Tên sản phẩm"
                />

                <input
                    type="number"
                    className="w-full border rounded-lg px-3 py-2"
                    value={sellPrice}
                    onChange={e => setSellPrice(e.target.value)}
                    placeholder="Giá mua ngay"
                />

                <input
                    type="datetime-local"
                    className="w-full border rounded-lg px-3 py-2"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                />

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 mt-3 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
            </div>
        </>
    );
}

