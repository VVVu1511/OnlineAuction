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
    
    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [myRes, wonRes] = await Promise.all([
                productService.getMyActiveProducts(user.id),
                productService.getMyWonProducts(user.id),
            ]);

            setMyProducts(myRes.data || []);
            setWonProducts(wonRes.data || []);
                            
        } catch (err) {
            setError(err.response?.data?.message || "Lấy dữ liệu thất bại");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return; // 🔴 bắt buộc


        loadData();
        
    }, [user]);

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
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
            {/* ===== ERROR ===== */}
            {error && (
                <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                    {error}
                </p>
            )}

            {/* ===== ADD PRODUCT ===== */}
            <AddAuctionProduct call={loadData} />

            {/* ================= ACTIVE PRODUCTS ================= */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                    Sản phẩm đang đăng & còn hạn
                </h2>

                {myProducts.length === 0 ? (
                    <p className="text-gray-500">Chưa có sản phẩm</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {myProducts.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                )}
            </section>

            {/* ================= WON PRODUCTS ================= */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                    Sản phẩm đã có người thắng đấu giá
                </h2>

                {wonProducts.length === 0 ? (
                    <p className="text-gray-500">Chưa có sản phẩm</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {wonProducts.map((p) => (
                            <div
                                key={p.id}
                                className="bg-white border rounded-xl shadow-sm p-4 space-y-4"
                            >
                                <ProductCard product={p} />

                                {/* INFO */}
                                <div className="text-sm text-gray-700">
                                    <p>
                                        <span className="font-medium">
                                            Người thắng:
                                        </span>{" "}
                                        {p.winner_name}
                                    </p>
                                    <p>
                                        <span className="font-medium">Email:</span>{" "}
                                        {p.winner_email}
                                    </p>
                                </div>

                                {/* ===== ALREADY RATED ===== */}
                                {p.winner_rating && (
                                    <div className="text-sm text-gray-700 bg-gray-50 border rounded-lg p-3">
                                        <p>
                                            <span className="font-medium">
                                                Đánh giá:
                                            </span>{" "}
                                            {p.winner_rating === 1 ? "Tốt" : "Xấu"}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Nhận xét:
                                            </span>{" "}
                                            {p.winner_comment}
                                        </p>
                                    </div>
                                )}

                                {/* ===== NOT RATED ===== */}
                                {!p.winner_rating && (
                                    <div className="border rounded-lg p-3 space-y-3">
                                        <textarea
                                            rows={2}
                                            placeholder="Nhập nhận xét..."
                                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                                        <div className="flex gap-2 flex-wrap">
                                            <button
                                                className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
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
                                                className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
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
                                                className="px-3 py-1.5 text-sm rounded-lg border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50"
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
                        ))}
                    </div>
                )}
            </section>
        </div>

    );
}

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function AddAuctionProduct({ call }) {
    const [name, setName] = useState("");
    const [images, setImages] = useState([]);
    const [startPrice, setStartPrice] = useState("");
    const [bidStep, setBidStep] = useState("");
    const [buyNowPrice, setBuyNowPrice] = useState("");
    const [description, setDescription] = useState("");
    const [autoExtend, setAutoExtend] = useState(true);
    const [addError, setAddError] = useState(false);
    const { user } = useContext(AuthContext);
    const { setLoading } = useContext(LoadingContext);

    useEffect(() => {
        return () => {
            images.forEach((file) =>
                URL.revokeObjectURL(file)
            );
        };
    }, [images]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            alert("Bạn cần đăng nhập");
            return;
        }

        if (user.role !== "seller") {
            alert("Chỉ seller mới được đăng sản phẩm");
            return;
        }

        if (images.length < 3) {
            alert("Vui lòng tải lên ít nhất 3 ảnh.");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        images.forEach(img => formData.append("images", img));
        formData.append("startPrice", startPrice);
        formData.append("bidStep", bidStep);
        formData.append("buyNowPrice", buyNowPrice);
        formData.append("description", description);
        formData.append("autoExtend", autoExtend);

        try {
            setLoading(true);

            const data = await productService.addProduct(formData, user.id);

            if (data?.success) {
                alert("Tạo sản phẩm thành công!");

                call?.();
                
                // reset form   
                setName("");
                setImages([]);
                setStartPrice("");
                setBidStep("");
                setBuyNowPrice("");
                setDescription("");
                setAutoExtend(true);
                setAddError(false);
                
            } else {
                alert(data?.message || "Lỗi hệ thống");
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Lỗi hệ thống");
            setAddError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        if (files.length < 3) {
            alert("Vui lòng chọn ít nhất 3 ảnh");
            setImages([]);
            e.target.value = ""; // reset input
            return;
        }

        setImages(files);
    };

    return (
        <div className="flex justify-center py-10">
            <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-6">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                    ➕ Thêm sản phẩm đấu giá
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block font-medium mb-1">
                            Tên sản phẩm
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block font-medium mb-1">
                            Ảnh sản phẩm (tối thiểu 3)
                        </label>

                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full rounded-lg border px-3 py-2 bg-white"
                        />

                        {images.length > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                                Đã chọn {images.length} ảnh
                            </p>
                        )}

                        {/* PREVIEW 3 IMAGES */}
                        {images.length > 0 && (
                            <div className="flex gap-3 mt-3">
                                {images.slice(0, 3).map((file, index) => (
                                    <div
                                        key={index}
                                        className="w-20 h-20 border rounded-lg overflow-hidden bg-gray-100"
                                    >
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`preview-${index}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        {images.length > 3 && (
                            <div className="w-20 h-20 flex items-center justify-center border rounded-lg bg-gray-200 text-sm text-gray-600">
                                +{images.length - 3}
                            </div>
                        )}
                    </div>

                    {/* Prices */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-medium mb-1">
                                Giá khởi điểm
                            </label>
                            <input
                                type="number"
                                required
                                value={startPrice}
                                onChange={(e) =>
                                    setStartPrice(e.target.value)
                                }
                                className="w-full rounded-lg border px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">
                                Bước giá
                            </label>
                            <input
                                type="number"
                                required
                                value={bidStep}
                                onChange={(e) => setBidStep(e.target.value)}
                                className="w-full rounded-lg border px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Buy now */}
                    <div>
                        <label className="block font-medium mb-1">
                            Giá mua ngay (tuỳ chọn)
                        </label>
                        <input
                            type="number"
                            value={buyNowPrice}
                            onChange={(e) =>
                                setBuyNowPrice(e.target.value)
                            }
                            className="w-full rounded-lg border px-3 py-2"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block font-medium mb-1">
                            Mô tả sản phẩm
                        </label>
                        <div className="bg-white rounded-lg border">
                            <ReactQuill
                                theme="snow"
                                value={description}
                                onChange={setDescription}
                            />
                        </div>
                    </div>

                    {/* Auto extend */}
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={autoExtend}
                            onChange={(e) =>
                                setAutoExtend(e.target.checked)
                            }
                            className="w-4 h-4"
                        />
                        Tự động gia hạn khi còn 5 phút
                    </label>

                    {/* Add Error */}
                    {addError && (
                        <p className="text-red-600">
                            Đã có lỗi xảy ra khi thêm sản phẩm. Vui lòng thử
                            lại.
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                    >
                        Đăng sản phẩm
                    </button>
                </form>
            </div>
        </div>
    );
}
