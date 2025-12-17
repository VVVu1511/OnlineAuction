import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ProductCard from "../ProductCard/ProductCard";
import AddAuctionProduct from "./AddProduct";
import * as productService from "../../service/product.service";

export default function SellerProfileUI({ user, token }) {
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

        const loadData = async () => {
            setLoading(true);
            try {
                const [myRes, wonRes] = await Promise.all([
                    productService.getMyActiveProducts(),
                    productService.getMyWonProducts(),
                ]);

                if (mounted) {
                    setMyProducts(myRes.data || []);
                    setWonProducts(wonRes.data || []);
                }
            } catch (err) {
                if (mounted) {
                    setError(err.response?.data?.message || "Lấy dữ liệu thất bại");
                }
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
            } else {
                alert(res.message || "Thất bại");
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
                alert(res.message || "Đánh giá thất bại");
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
                alert("Đã huỷ giao dịch");
                setShowCancelModal(false);
            } else {
                alert(res.message || "Huỷ thất bại");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi server");
        } finally {
            setCanceling(false);
        }
    };

    return (
        <div className="p-5">
            {loading && <p>Đang tải dữ liệu...</p>}
            {error && <p className="text-danger">{error}</p>}

            <AddAuctionProduct />

            {/* ACTIVE PRODUCTS */}
            <section className="mb-5">
                <h4>Sản phẩm đang đăng</h4>
                {chunkArray(myProducts, 5).map((row, i) => (
                    <div className="row g-4 mb-3 gap-4" key={i}>
                        {row.map(p => (
                            <div className="col-2" key={p.id}>
                                <ProductCard data={p} />
                            </div>
                        ))}
                    </div>
                ))}
            </section>

            {/* WON PRODUCTS */}
            <section>
                <h4>Sản phẩm đã kết thúc</h4>
                {chunkArray(wonProducts, 5).map((row, i) => (
                    <div className="row g-4 mb-3" key={i}>
                        {row.map(p => (
                            <div className="col-2" key={p.id}>
                                <ProductCard data={p} />
                            </div>
                        ))}
                    </div>
                ))}
            </section>

            {/* ===== APPEND MODAL ===== */}
            {showAppendModal && (
                <Modal title="Bổ sung mô tả" onClose={() => setShowAppendModal(false)}>
                    <ReactQuill value={appendHtml} onChange={setAppendHtml} />
                    <ModalActions
                        onCancel={() => setShowAppendModal(false)}
                        onConfirm={handleAppendDescription}
                        loading={savingAppend}
                        confirmText="Lưu"
                    />
                </Modal>
            )}

            {/* ===== RATE MODAL ===== */}
            {showRateModal && (
                <Modal title="Đánh giá người thắng" onClose={() => setShowRateModal(false)}>
                    <select
                        className="form-select mb-2"
                        value={rateValue}
                        onChange={e => setRateValue(+e.target.value)}
                    >
                        <option value={1}>+1</option>
                        <option value={-1}>-1</option>
                    </select>

                    <textarea
                        className="form-control"
                        rows={3}
                        value={rateComment}
                        onChange={e => setRateComment(e.target.value)}
                    />

                    <ModalActions
                        onCancel={() => setShowRateModal(false)}
                        onConfirm={handleRateBidder}
                        loading={rating}
                        confirmText="Gửi"
                    />
                </Modal>
            )}

            {/* ===== CANCEL MODAL ===== */}
            {showCancelModal && (
                <Modal title="Huỷ giao dịch" onClose={() => setShowCancelModal(false)}>
                    <p>Người thắng không thanh toán</p>
                    <ModalActions
                        onCancel={() => setShowCancelModal(false)}
                        onConfirm={handleCancelTransaction}
                        loading={canceling}
                        confirmText="Xác nhận huỷ"
                        danger
                    />
                </Modal>
            )}
        </div>
    );
}
