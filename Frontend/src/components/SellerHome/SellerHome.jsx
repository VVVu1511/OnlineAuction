import { useContext, useEffect, useState } from "react";
import * as productService from "../../services/product.service.jsx";
import { LoadingContext } from "../../context/LoadingContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import ProductCard from "../ProductCard/ProductCard.jsx"

export default function SellerHome() {
    // ===== CONTEXT =====
    const { user } = useContext(AuthContext);
    const { setLoading } = useContext(LoadingContext);

    // ===== DATA =====
    const [myProducts, setMyProducts] = useState([]);
    const [wonProducts, setWonProducts] = useState([]);
    const [error, setError] = useState("");

    // ===== RATE =====
    const [rateTarget, setRateTarget] = useState(null);
    const [rateValue, setRateValue] = useState(1);
    const [rateComment, setRateComment] = useState("");
    const [rating, setRating] = useState(false);

    // ===== CANCEL =====
    const [cancelTarget, setCancelTarget] = useState(null);
    const [canceling, setCanceling] = useState(false);

    /* ================= FETCH DATA ================= */
    useEffect(() => {
        if (!user) return; // 🔴 bắt buộc

        let mounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                const [myRes, wonRes] = await Promise.all([
                    productService.getMyActiveProducts(user.id),
                    productService.getMyWonProducts(user.id),
                ]);

                if (!mounted) return;

                setMyProducts(myRes.data || []);
                setWonProducts(wonRes.data || []);
            } catch (err) {
                mounted &&
                    setError(err.response?.data?.message || "Lấy dữ liệu thất bại");
            } finally {
                mounted && setLoading(false);
            }
        };

        loadData();
        return () => (mounted = false);
    }, [user, setLoading]);

    /* ================= HELPERS ================= */
    const chunkArray = (arr, size) =>
        Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
            arr.slice(i * size, i * size + size)
        );

    /* ================= RATE BIDDER ================= */
    const handleRateBidder = async () => {
        if (!rateComment.trim()) return;

        try {
            setRating(true);
            setLoading(true);

            const res = await productService.rateBidder(
                rateTarget.id,
                rateTarget.winner_id,
                rateValue,
                rateComment
            );

            if (res.success) {
                alert("Đánh giá thành công");
                setRateTarget(null);
                setRateComment("");
            } else {
                alert(res.message || "Đánh giá thất bại");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi server");
        } finally {
            setRating(false);
            setLoading(false);
        }
    };

    /* ================= CANCEL TRANSACTION ================= */
    const handleCancelTransaction = async () => {
        try {
            setCanceling(true);
            setLoading(true);

            const res = await productService.cancelTransaction(cancelTarget.id);

            if (res.success) {
                alert(
                    "Đã huỷ giao dịch\nNgười thắng không thanh toán (-1)"
                );
                setCancelTarget(null);
            } else {
                alert(res.message || "Huỷ thất bại");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi server");
        } finally {
            setCanceling(false);
            setLoading(false);
        }
    };

    /* ================= RENDER ================= */
    return (
        <div className="p-5">
            {error && <p className="text-danger">{error}</p>}

            {/* ===== ACTIVE PRODUCTS ===== */}
            <section className="mb-5">
                <h4>Sản phẩm đang đăng & còn hạn</h4>

                {myProducts.length === 0 ? (
                    <p>Chưa có sản phẩm</p>
                ) : (
                    chunkArray(myProducts, 5).map((row, i) => (
                        <div className="row g-4 mb-3" key={i}>
                            {row.map((p) => (
                                <div className="col-2" key={p.id}>
                                    <ProductCard data={p} />
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </section>

            {/* ===== WON PRODUCTS ===== */}
            <section>
                <h4>Sản phẩm đã có người thắng đấu giá</h4>

                {wonProducts.length === 0 ? (
                    <p>Chưa có sản phẩm</p>
                ) : (
                    wonProducts.map((p) => (
                        <div key={p.id} className="border rounded p-3 mb-3">
                            <ProductCard data={p} />

                            <div className="mt-2">
                                <strong>Người thắng:</strong> {p.winner_name}
                                <br />
                                <strong>Email:</strong> {p.winner_email}
                            </div>

                            {/* ĐÃ ĐÁNH GIÁ */}
                            {p.winner_rating && (
                                <div className="mt-2">
                                    <strong>Đánh giá:</strong>{" "}
                                    {p.winner_rating === 1 ? "Tốt" : "Xấu"}
                                    <br />
                                    <strong>Nhận xét:</strong>{" "}
                                    {p.winner_comment}
                                </div>
                            )}

                            {/* CHƯA ĐÁNH GIÁ */}
                            {!p.winner_rating && (
                                <div className="mt-2 border rounded p-2">
                                    <textarea
                                        className="form-control mb-2"
                                        rows={2}
                                        placeholder="Nhập nhận xét..."
                                        value={
                                            rateTarget?.id === p.id
                                                ? rateComment
                                                : ""
                                        }
                                        onChange={(e) => {
                                            setRateTarget(p);
                                            setRateComment(e.target.value);
                                        }}
                                    />

                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => {
                                                setRateTarget(p);
                                                setRateValue(1);
                                                handleRateBidder();
                                            }}
                                            disabled={rating}
                                        >
                                            +1
                                        </button>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => {
                                                setRateTarget(p);
                                                setRateValue(-1);
                                                handleRateBidder();
                                            }}
                                            disabled={rating}
                                        >
                                            -1
                                        </button>

                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => {
                                                setCancelTarget(p);
                                                handleCancelTransaction();
                                            }}
                                            disabled={canceling}
                                        >
                                            Huỷ giao dịch
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </section>
        </div>
    );
}
