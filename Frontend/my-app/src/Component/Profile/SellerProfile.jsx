import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

/**
 * Props:
 *  - user: { id, name, ... }
 *  - token: string (JWT)
 */
export default function SellerProfile({ user, token }) {
    const [myProducts, setMyProducts] = useState([]);       // products still active / not expired
    const [wonProducts, setWonProducts] = useState([]);     // products where seller is winner? (you said "sản phẩm đã có người thắng đấu giá")
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Append description modal state
    const [showAppendModal, setShowAppendModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [appendHtml, setAppendHtml] = useState('');

    // Rate modal
    const [showRateModal, setShowRateModal] = useState(false);
    const [rateTarget, setRateTarget] = useState(null);
    const [rateValue, setRateValue] = useState(0);
    const [rateComment, setRateComment] = useState('');

    // Cancel transaction modal
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelReason, setCancelReason] = useState('Người thắng không thanh toán');

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [myRes, wonRes] = await Promise.all([
                fetch('http://localhost:3000/product/myActiveProducts', { headers }),
                fetch('http://localhost:3000/product/myWonProducts', { headers }),
            ]);

            const myJson = await myRes.json();
            const wonJson = await wonRes.json();

            setMyProducts(myJson.data || []);
            setWonProducts(wonJson.data || []);
            setError(null);
            } catch (err) {
                console.error(err);
                setError('Lấy dữ liệu thất bại');
            } finally {
                setLoading(false);
            }
        }

    /* -------------------------
        Append description flow
        - appendHtml contains new HTML to append to existing description
        ------------------------- */
    function openAppendModal(product) {
        setCurrentProduct(product);
        setAppendHtml(''); // start empty
        setShowAppendModal(true);
    }

    async function submitAppend() {
        if (!currentProduct) return;
        
        try {
            const res = await fetch(`http://localhost:3000/product/appendDescription/:${currentProduct.id}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ appendHtml }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Append failed');

            // update product description in UI (append)
            setMyProducts((prev) =>
                prev.map((p) =>
                p.id === currentProduct.id ? { ...p, description: (p.description || '') + appendHtml } : p
                )
            );

            setShowAppendModal(false);
            setCurrentProduct(null);
        } catch (err) {
            console.error(err);
            alert('Append description failed: ' + err.message);
        }
    }

    /* -------------------------
        Rate winner flow
        rateValue: +1 or -1 (IMG_258(+1) or IMG_259(-1))
        ------------------------- */
    function openRateModal(product, winner) {
        // product: product object; winner: user object or winner id
        setRateTarget({ product, winner });
        setRateValue(1);
        setRateComment('');
        setShowRateModal(true);
    }

    async function submitRate() {
        if (!rateTarget) return;
        try {
            const res = await fetch(`/api/product/${rateTarget.product.id}/rate-winner`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                winnerId: rateTarget.winner.id ?? rateTarget.winner,
                score: rateValue,
                comment: rateComment,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Rate failed');

            // Optionally update wonProducts UI (mark as rated)
            setWonProducts((prev) =>
                prev.map((p) =>
                p.id === rateTarget.product.id ? { ...p, ratedBySeller: true, sellerRating: rateValue } : p
                )
            );

            setShowRateModal(false);
            setRateTarget(null);
        } catch (err) {
            console.error(err);
            alert('Rate failed: ' + err.message);
        }
    }

    /* -------------------------
        Cancel transaction (seller cancels a sale & auto -1 to winner)
        ------------------------- */
    function openCancelModal(product, winner) {
        setCancelTarget({ product, winner });
        setCancelReason('Người thắng không thanh toán');
        setShowCancelModal(true);
    }

    async function submitCancel() {
        if (!cancelTarget) return;
        try {
        const res = await fetch(`/api/product/${cancelTarget.product.id}/cancel-transaction`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
            winnerId: cancelTarget.winner.id ?? cancelTarget.winner,
            reason: cancelReason,
            }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Cancel failed');

        // update UI: move product back to active products or mark canceled
        setWonProducts((prev) => prev.filter((p) => p.id !== cancelTarget.product.id));

        setShowCancelModal(false);
        setCancelTarget(null);
        } catch (err) {
        console.error(err);
        alert('Cancel failed: ' + err.message);
        }
    }

    /* -------------------------
        Render helpers
        ------------------------- */
    function formatDate(d) {
        try {
        return new Date(d).toLocaleString();
        } catch {
        return d;
        }
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Seller Profile</h2>

            {loading && <div className="mb-4">Đang tải dữ liệu...</div>}
            {error && <div className="mb-4 text-red-600">{error}</div>}

            {/* Section: My active products */}
            <section className="mb-8">
                <h3 className="text-xl font-medium mb-2">Sản phẩm đang đăng & còn hạn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myProducts.length === 0 && <div>Không có sản phẩm nào.</div>}
                {myProducts.map((p) => (
                    <div key={p.id} className="border rounded p-4 shadow-sm">
                    <div className="flex items-start gap-4">
                        <img
                        src={Array.isArray(p.image_path) ? p.image_path[0] : (p.image_path?.[0] ?? '/placeholder.png')}
                        alt={p.name}
                        className="w-24 h-24 object-cover rounded"
                        />
                        <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                            <h4 className="font-semibold">{p.name}</h4>
                            <div className="text-sm text-gray-600">Giá khởi điểm: {p.start_price}</div>
                            <div className="text-sm text-gray-600">Bước giá: {p.bid_step}</div>
                            <div className="text-sm text-gray-600">Kết thúc: {formatDate(p.end_time)}</div>
                            </div>
                            <div className="text-sm text-right">
                            <div>Auto-extend: {p.auto_extend ? 'Bật' : 'Tắt'}</div>
                            {p.auto_extend && (
                                <div className="text-xs text-gray-500">
                                Khi có giá trước khi kết thúc {p.extend_before_seconds ?? 300}s → cộng {p.extend_seconds ?? 600}s
                                </div>
                            )}
                            </div>
                        </div>

                        <div className="mt-3 flex gap-2">
                            <button
                            onClick={() => openAppendModal(p)}
                            className="px-3 py-1 bg-blue-600 text-white rounded"
                            >
                            Bổ sung mô tả
                            </button>
                            <a
                            href={`/product/${p.id}`}
                            className="px-3 py-1 border rounded text-sm"
                            >
                            Xem chi tiết
                            </a>
                            {/* seller-specific actions */}
                        </div>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </section>

            {/* Section: Won products (products that already had a winner) */}
            <section className="mb-8">
                <h3 className="text-xl font-medium mb-2">Sản phẩm đã có người thắng đấu giá</h3>
                <div className="space-y-3">
                {wonProducts.length === 0 && <div>Chưa có sản phẩm nào được đấu xong.</div>}
                {wonProducts.map((p) => (
                    <div key={p.id} className="border rounded p-4 flex items-center justify-between">
                    <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-sm text-gray-600">Người thắng: {p.winner?.name ?? p.winner_id}</div>
                        <div className="text-sm text-gray-600">Giá thắng: {p.final_price}</div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => openRateModal(p, p.winner)} className="px-3 py-1 bg-green-600 text-white rounded">
                        Đánh giá người thắng
                        </button>
                        <button onClick={() => openCancelModal(p, p.winner)} className="px-3 py-1 bg-red-500 text-white rounded">
                        Huỷ giao dịch
                        </button>
                    </div>
                    </div>
                ))}
                </div>
            </section>

            {/* ---------- Append modal ---------- */}
            {showAppendModal && currentProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="bg-white w-full max-w-3xl rounded shadow-lg p-6">
                    <h4 className="text-lg font-semibold mb-3">Bổ sung mô tả cho: {currentProduct.name}</h4>

                    <ReactQuill value={appendHtml} onChange={setAppendHtml} />

                    <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => setShowAppendModal(false)} className="px-4 py-2 border rounded">Huỷ</button>
                    <button onClick={submitAppend} className="px-4 py-2 bg-blue-600 text-white rounded">Ghi thêm</button>
                    </div>
                </div>
                </div>
            )}

            {/* ---------- Rate modal ---------- */}
            {showRateModal && rateTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="bg-white w-full max-w-md rounded shadow-lg p-6">
                    <h4 className="text-lg font-semibold mb-2">Đánh giá người thắng: {rateTarget.winner?.name ?? rateTarget.winner}</h4>

                    <div className="mb-2">
                    <label className="block text-sm mb-1">Chọn điểm (+1 hoặc -1)</label>
                    <select value={rateValue} onChange={(e) => setRateValue(Number(e.target.value))} className="border p-2 rounded w-full">
                        <option value={1}>+1 (IMG_258)</option>
                        <option value={-1}>-1 (IMG_259)</option>
                    </select>
                    </div>

                    <div className="mb-4">
                    <label className="block text-sm mb-1">Nhận xét (tuỳ chọn)</label>
                    <textarea value={rateComment} onChange={(e) => setRateComment(e.target.value)} rows={4} className="w-full border rounded p-2" />
                    </div>

                    <div className="flex justify-end gap-2">
                    <button onClick={() => setShowRateModal(false)} className="px-3 py-1 border rounded">Huỷ</button>
                    <button onClick={submitRate} className="px-3 py-1 bg-green-600 text-white rounded">Gửi đánh giá</button>
                    </div>
                </div>
                </div>
            )}

            {/* ---------- Cancel modal ---------- */}
            {showCancelModal && cancelTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="bg-white w-full max-w-md rounded shadow-lg p-6">
                    <h4 className="text-lg font-semibold mb-2">Huỷ giao dịch: {cancelTarget.product.name}</h4>

                    <div className="mb-3">
                    <label className="block text-sm mb-1">Lý do</label>
                    <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={4} className="w-full border rounded p-2" />
                    </div>

                    <div className="flex justify-end gap-2">
                    <button onClick={() => setShowCancelModal(false)} className="px-3 py-1 border rounded">Huỷ</button>
                    <button onClick={submitCancel} className="px-3 py-1 bg-red-500 text-white rounded">Xác nhận huỷ</button>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
}
