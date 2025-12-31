import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as productService from "../../services/product.service.jsx"

export default function Product() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [seller, setSeller] = useState(null);
    const [bestBidder, setBestBidder] = useState(null);
    const [qaHistory, setQaHistory] = useState([]);
    const [related, setRelated] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ===== Load product detail =====
    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            try {
                setLoading(true);

                const [
                    sellerRes,
                    bidderRes,
                    qaRes,
                    relatedRes,
                ] = await Promise.all([
                    productService.getSellerInfo(id),
                    productService.getBestBidder(id),
                    productService.getQaHistory(id),
                    productService.getRelatedProducts(id),
                ]);

                if (mounted) {
                    setSeller(sellerRes.success ? sellerRes.data : null);
                    setBestBidder(bidderRes.success ? bidderRes.data : null);
                    setQaHistory(qaRes.success ? qaRes.data : []);
                    setRelated(relatedRes.success ? relatedRes.data : []);
                }
            } catch (err) {
                if (mounted) {
                    setError(err.response?.data?.message || "Không tải được sản phẩm");
                }
            } finally {
                mounted && setLoading(false);
            }
        };

        loadData();
        return () => (mounted = false);
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    if (!product) return null;

    // ===== Helpers =====
    const formatTime = (endTime) => {
        const diff = new Date(endTime) - new Date();
        const days = diff / (1000 * 60 * 60 * 24);

        if (days > 3) {
            return new Date(endTime).toLocaleString();
        }

        const minutes = Math.floor(diff / (1000 * 60));
        if (minutes < 60) return `${minutes} phút nữa`;

        const hours = Math.floor(minutes / 60);
        return `${hours} giờ nữa`;
    };

    return (
        <div className="space-y-10">
            {/* ========= MAIN INFO ========= */}
            <section className="grid grid-cols-2 gap-8">
                {/* Images */}
                <div>
                    <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-96 object-cover rounded"
                    />

                    <div className="grid grid-cols-4 gap-2 mt-3">
                        {product.images?.map((img, i) => (
                            <img
                                key={i}
                                src={img}
                                alt=""
                                className="h-24 w-full object-cover rounded"
                            />
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="space-y-3">
                    <h1 className="text-2xl font-bold">{product.name}</h1>

                    <p>
                        Giá hiện tại:{" "}
                        <span className="font-semibold text-red-600">
                            {product.currentPrice}
                        </span>
                    </p>

                    {product.buyNowPrice && (
                        <p className="text-green-600">
                            Giá mua ngay: {product.buyNowPrice}
                        </p>
                    )}

                    <p>
                        Người bán:{" "}
                        <b>{seller?.fullName}</b>{" "}
                        ({seller?.rating || 0} ⭐)
                    </p>

                    <p>
                        Người ra giá cao nhất:{" "}
                        <b>{bestBidder?.fullName || "—"}</b>{" "}
                        ({bestBidder?.rating || 0} ⭐)
                    </p>

                    <p>
                        Ngày đăng:{" "}
                        {new Date(product.createdAt).toLocaleString()}
                    </p>

                    <p>
                        Kết thúc:{" "}
                        <b>{formatTime(product.endTime)}</b>
                    </p>
                </div>
            </section>

            {/* ========= DESCRIPTION ========= */}
            <section>
                <h2 className="text-xl font-bold mb-2">
                    Mô tả sản phẩm
                </h2>

                <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                        __html: product.description,
                    }}
                />
            </section>

            {/* ========= Q & A ========= */}
            <section>
                <h2 className="text-xl font-bold mb-4">
                    Hỏi & đáp
                </h2>

                {qaHistory.length === 0 && (
                    <p className="text-gray-500">
                        Chưa có câu hỏi nào
                    </p>
                )}

                <div className="space-y-4">
                    {qaHistory.map((qa) => (
                        <div
                            key={qa.id}
                            className="border rounded p-4"
                        >
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
                        <div
                            key={p.id}
                            className="border rounded p-3 cursor-pointer hover:shadow"
                            onClick={() => navigate(`/product/${p.id}`)}
                        >
                            <img
                                src={p.thumbnail}
                                alt={p.name}
                                className="h-40 w-full object-cover rounded mb-2"
                            />
                            <p className="font-semibold line-clamp-2">
                                {p.name}
                            </p>
                            <p className="text-sm">
                                Giá: {p.currentPrice}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
