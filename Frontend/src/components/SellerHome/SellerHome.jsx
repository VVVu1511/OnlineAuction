import { useEffect, useState } from "react";
import * as productService from "../../services/product.service.jsx";

export default function SellerHome() {
    // ===== Data =====
    const [myProducts, setMyProducts] = useState([]);
    const [wonProducts, setWonProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ===== Append modal =====
    const [showAppendModal, setShowAppendModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [appendHtml, setAppendHtml] = useState("");
    const [savingAppend, setSavingAppend] = useState(false);

    // ===== Rate modal =====
    const [showRateModal, setShowRateModal] = useState(false);
    const [rateTarget, setRateTarget] = useState(null);
    const [rateValue, setRateValue] = useState(1);
    const [rateComment, setRateComment] = useState("");
    const [rating, setRating] = useState(false);

    // ===== Cancel modal =====
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [canceling, setCanceling] = useState(false);

    // ---------- Fetch data ----------
    useEffect(() => {
        let mounted = true;
        const user = JSON.parse(localStorage.getItem("user"));

        const loadData = async () => {
            setLoading(true);
            setError("");
            try {
                const [myRes, wonRes] = await Promise.all([
                    productService.getMyActiveProducts(user.id),
                    productService.getMyWonProducts(user.id),
                ]);

                if (!mounted) return;

                if (myRes.success) {
                    setMyProducts(myRes.data || []);
                } else {
                    setError(myRes.message);
                }

                if (wonRes.success) {
                    setWonProducts(wonRes.data || []);
                } else {
                    setError(wonRes.message);
                }
            } catch (err) {
                mounted &&
                    setError(err.response?.data?.message || "Lỗi tải dữ liệu");
            } finally {
                mounted && setLoading(false);
            }
        };

        loadData();
        return () => (mounted = false);
    }, []);

    // ---------- Helpers ----------
    const chunkArray = (arr, size) =>
        Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
            arr.slice(i * size, i * size + size)
        );

    // ---------- Handlers ----------
    const handleAppendDescription = async () => {
        if (!appendHtml.trim()) return alert("Nhập nội dung trước khi lưu");

        try {
            setSavingAppend(true);
            const res = await productService.appendProductDescription(
                currentProduct.id,
                appendHtml
            );

            if (res.success) {
                alert("Bổ sung mô tả thành công");
                setShowAppendModal(false);
                setAppendHtml("");
            } else {
                alert(res.message);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi server");
        } finally {
            setSavingAppend(false);
        }
    };

    const handleRateBidder = async () => {
        try {
            setRating(true);
            const res = await productService.rateBidder(
                rateTarget.product.id,
                rateTarget.winner.id,
                rateValue,
                rateComment
            );

            if (res.success) {
                alert("Đánh giá thành công");
                setShowRateModal(false);
            } else {
                alert(res.message);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi server");
        } finally {
            setRating(false);
        }
    };

    const handleCancelTransaction = async () => {
        try {
            setCanceling(true);
            const res = await productService.cancelTransaction(
                cancelTarget.product.id
            );

            if (res.success) {
                alert("Đã huỷ giao dịch (tự động -1 người thắng)");
                setShowCancelModal(false);
            } else {
                alert(res.message);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi server");
        } finally {
            setCanceling(false);
        }
    };

    // ---------- Render ----------
    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="space-y-10">
            {/* ===== Active products ===== */}
            <section>
                <h2 className="text-xl font-bold mb-4">
                    Sản phẩm đang đấu giá
                </h2>

                {myProducts.length === 0 ? (
                    <p>Chưa có sản phẩm</p>
                ) : (
                    chunkArray(myProducts, 3).map((row, i) => (
                        <div key={i} className="grid grid-cols-3 gap-4 mb-4">
                            {row.map((p) => (
                                <div
                                    key={p.id}
                                    className="border rounded p-4 space-y-2"
                                >
                                    <h3 className="font-semibold">
                                        {p.name}
                                    </h3>
                                    <p>Giá hiện tại: {p.currentPrice}</p>
                                    <button
                                        className="btn btn-sm"
                                        onClick={() => {
                                            setCurrentProduct(p);
                                            setShowAppendModal(true);
                                        }}
                                    >
                                        Bổ sung mô tả
                                    </button>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </section>

            {/* ===== Won products ===== */}
            <section>
                <h2 className="text-xl font-bold mb-4">
                    Sản phẩm đã có người thắng
                </h2>

                {wonProducts.length === 0 ? (
                    <p>Chưa có sản phẩm</p>
                ) : (
                    wonProducts.map((item) => (
                        <div
                            key={item.product.id}
                            className="border rounded p-4 mb-3 space-y-2"
                        >
                            <h3 className="font-semibold">
                                {item.product.name}
                            </h3>
                            <p>
                                Người thắng: {item.winner.fullName}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    className="btn btn-sm"
                                    onClick={() => {
                                        setRateTarget(item);
                                        setShowRateModal(true);
                                    }}
                                >
                                    Đánh giá
                                </button>

                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => {
                                        setCancelTarget(item);
                                        setShowCancelModal(true);
                                    }}
                                >
                                    Huỷ giao dịch
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </section>
        </div>
    );
}
