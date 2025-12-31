import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as productService from "../../services/product.service.jsx";
import * as biddingService from "../../services/bidding.service.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import { LoadingContext } from "../../context/LoadingContext.jsx";
import Back from "../Back/Back.jsx";
import ProductCard from "../ProductCard/ProductCard.jsx";

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

    const [mainImage, setMainImage] = useState(null);

    // ===== Load product detail =====
    useEffect(() => {
        let mounted = true;

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

                if (!mounted) return;

                setProduct(productRes?.data || productRes);
                setSeller(sellerRes.success ? sellerRes.data : null);
                setBestBidder(bidderRes.success ? bidderRes.data : null);
                setQaHistory(qaRes.success ? qaRes.data : []);
                setRelated(relatedRes.success ? relatedRes.data : []);
                setBidHistory(bidHistoryRes.success ? bidHistoryRes.data : []);
            } catch (err) {
                mounted &&
                    setError(
                        err.response?.data?.message ||
                        "Không tải được sản phẩm"
                    );
            } finally {
                mounted && setLoading(false);
            }
        };

        loadData();
        return () => (mounted = false);
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
    
    return (
        <div className="space-y-10">
            <Back />
            {/* ========= MAIN INFO ========= */}
            <section className="grid grid-cols-2 gap-8">
                <div>
                    {/* ===== IMAGE LỚN ===== */}
                    <img
                        src={`http://localhost:3000/static/images/${product.id}/${mainImage}`}
                        alt={product.name}
                        className="w-full h-96 object-cover rounded border"
                    />

                    {/* ===== IMAGE NHỎ ===== */}
                    <div className="grid grid-cols-4 gap-2 mt-3">
                        {product.image_path
                            .map((img, i) => (
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
                    <h1 className="text-2xl font-bold">{product.name}</h1>

                    <p>
                        Giá hiện tại:{" "}
                        <span className="font-semibold text-red-600">
                            {product.current_price}
                        </span>
                    </p>

                    {product.current_price && (
                        <p className="text-green-600">
                            Giá mua ngay: {product.sell_price}
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
                        {new Date(product.upload_date).toLocaleString()}
                    </p>

                    <p>
                        Kết thúc: <b>{formatTime(product.endTime)}</b>
                    </p>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-2">Mô tả sản phẩm</h2>
                <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                        __html: product.description.replace(/\\n/g, "<br />"),
                    }}
                />
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
                                            {bid.price.toLocaleString("vi-VN")} ₫
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                )
            }

            {/* ========= Q & A ========= */}
            <section>
                <h2 className="text-xl font-bold mb-4">Hỏi & đáp</h2>

                {qaHistory.length === 0 && (
                    <p className="text-gray-500">Chưa có câu hỏi nào</p>
                )}

                <div className="space-y-4">
                    {qaHistory.map((qa) => (
                        <div key={qa.id} className="border rounded p-4">
                            <p className="font-semibold">
                                Hỏi: {qa.question}
                            </p>

                            {qa.answer ? (
                                <p className="mt-2 text-green-700">
                                    Đáp: {qa.answer}
                                </p>
                            ) : (
                                <p className="mt-2 text-gray-400">
                                    Chưa được trả lời
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* ========= RELATED PRODUCTS ========= */}
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
        </div>
    );
}
