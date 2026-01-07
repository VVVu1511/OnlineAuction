import { useContext, useEffect, useState } from "react";
import * as productService from "../../services/product.service.jsx";
import * as biddingService from "../../services/bidding.service.jsx";
import { LoadingContext } from "../../context/LoadingContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import ProductCard from "../ProductCard/ProductCard.jsx"
import { useConfirmModal } from "../../context/ConfirmModalContext";
import { useResultModal } from "../../context/ResultModalContext";

export default function SellerHome() {
    const { showConfirm } = useConfirmModal();
    const { showResult } = useResultModal();
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
    // const handleRateBidder = async (p) => {
    //     if (!rateComment.trim()) return;

    //     try {
    //         setRating(true);
    //         setLoading(true);

    //         const res = await biddingService.rateBidder(
    //             p.best_bidder,
    //             p.id,
    //             rateComment,
    //             rateValue
    //         );

    //         if (res.success) {
    //             alert("Đánh giá thành công");
    //             setRateTarget(null);
    //             setRateComment("");

    //             loadData();
    //         } else {
    //             alert(res.message || "Đánh giá thất bại");
    //         }
    //     } catch (err) {
    //         alert(err.response?.data?.message || "Lỗi server");
    //     } finally {
    //         setRating(false);
    //         setLoading(false);
    //     }
    // };

    /* ================= CANCEL TRANSACTION ================= */
    // const handleCancelTransaction = async (p) => {
    //     try {
    //         setCanceling(true);
    //         setLoading(true);

    //         const res = await biddingService.rateBidder(
    //             p.best_bidder,
    //             p.id,
    //             "Người thắng không thanh toán",
    //             -1,
    //         );

    //         if (res.success) {
    //             alert(
    //                 "Đã huỷ giao dịch\nNgười thắng không thanh toán (-1)"
    //             );
    //             setCancelTarget(null);

    //             loadData();

    //         } else {
    //             alert(res.message || "Huỷ thất bại");
    //         }
    //     } catch (err) {
    //         alert(err || "Lỗi server");
    //     } finally {
    //         setCanceling(false);
    //         setLoading(false);
    //     }
    // };

    const MIN_COMMENT_LENGTH = 5;
    const MAX_COMMENT_LENGTH = 200;

    const isCommentValid =
        rateComment.trim().length >= MIN_COMMENT_LENGTH &&
        rateComment.length <= MAX_COMMENT_LENGTH;

    const [rateError, setRateError] = useState("");

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
                                        {p.best_bidder_name}
                                    </p>
                                </div>

                                {/* ===== ALREADY RATED ===== */}
                                {/* {p.winner_rating && (
                                    <div className="text-sm text-gray-700 bg-gray-50 border rounded-lg p-3">
                                        <p>
                                            <span className="font-medium">
                                                Đánh giá:
                                            </span>{" "}
                                            {p.rating === 1 ? "Tốt" : "Xấu"}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Nhận xét:
                                            </span>{" "}
                                            {p.comment}
                                        </p>
                                    </div>
                                )} */}

                                {/* ===== NOT RATED ===== */}
                                {/* {!p.winner_rating && (
                                    <div className="border rounded-lg p-3 space-y-3">
                                        <textarea
                                            rows={2}
                                            placeholder="Nhập nhận xét (tối thiểu 5 ký tự)..."
                                            className={`w-full border rounded-lg px-3 py-2 text-sm
                                                focus:outline-none focus:ring-2
                                                ${
                                                    rateError
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "focus:ring-blue-500"
                                                }`}
                                            value={rateTarget?.id === p.id ? rateComment : ""}
                                            onChange={(e) => {
                                                setRateTarget(p);
                                                const value = e.target.value;
                                                setRateComment(value);

                                                if (value.trim().length < MIN_COMMENT_LENGTH) {
                                                    setRateError(
                                                        `Nhận xét phải có ít nhất ${MIN_COMMENT_LENGTH} ký tự`
                                                    );
                                                } else if (value.length > MAX_COMMENT_LENGTH) {
                                                    setRateError(`Nhận xét tối đa ${MAX_COMMENT_LENGTH} ký tự`);
                                                } else {
                                                    setRateError("");
                                                }
                                            }}
                                        />

                                        <div className="flex justify-between text-xs mt-1">
                                            <span className="text-red-500">{rateError}</span>
                                            <span className="text-gray-400">
                                                {rateComment.length}/{MAX_COMMENT_LENGTH}
                                            </span>
                                        </div>

                                        <div className="flex gap-2 flex-wrap">
                                            <button
                                                className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                                onClick={() => {
                                                    setRateTarget(p);
                                                    setRateValue(1);
                                                    handleRateBidder(p);
                                                }}
                                                disabled={rating || !isCommentValid}
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
                                                disabled={rating || !isCommentValid}
                                            >
                                                -1
                                            </button>

                                            <button
                                                className="px-3 py-1.5 text-sm rounded-lg border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                onClick={() => {
                                                    handleCancelTransaction(p);
                                                }}
                                                disabled={canceling}
                                            >
                                                Huỷ giao dịch
                                            </button>
                                        </div>
                                    </div>
                                )} */}
                                
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
    const { showConfirm } = useConfirmModal();
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
    const [endDate, setEndDate] = useState("");
    const { showResult } = useResultModal();

    useEffect(() => {
        return () => {
            images.forEach((file) =>
                URL.revokeObjectURL(file)
            );
        };
    }, [images]);
    
    const clearError = (field) => {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
    
    // strip HTML from Quill output
    const stripHtml = (html) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (!user) {
            showResult({
                success: false,
                message: "Bạn cần đăng nhập"
            });
            return;
        }

        if (user.role !== "seller") {
            showResult({
                success: false,
                message: "Chỉ seller mới được đăng sản phẩm"
            });
            return;
        }

        if (images.length < 3) {
            showResult({
                success: false,
                message: "Vui lòng tải lên ít nhất 3 ảnh"
            });
            return;
        }

        showConfirm({
            title: "Xác nhận tạo sản phẩm",
            message: (
                <div className="space-y-2 text-sm">
                    <p>Bạn có chắc muốn đăng sản phẩm với thông tin sau?</p>

                    <div className="border rounded bg-gray-50 p-2 text-xs space-y-1">
                        <p><b>Tên:</b> {name}</p>
                        <p><b>Giá khởi điểm:</b> {startPrice}</p>
                        <p><b>Bước giá:</b> {bidStep}</p>

                        {buyNowPrice && (
                            <p><b>Giá mua ngay:</b> {buyNowPrice}</p>
                        )}

                        <p><b>Số ảnh:</b> {images.length}</p>
                        <p>
                            <b>Tự gia hạn:</b>{" "}
                            {autoExtend ? "Có" : "Không"}
                        </p>
                        <p><b>Ngày kết thúc:</b> {endDate}</p>
                    </div>
                </div>
            ),
            onConfirm: async () => {
                const formData = new FormData();
                formData.append("name", name);
                images.forEach(img => formData.append("images", img));
                formData.append("startPrice", startPrice);
                formData.append("bidStep", bidStep);
                formData.append("buyNowPrice", buyNowPrice);
                formData.append("description", description);
                formData.append("autoExtend", autoExtend);
                formData.append("endDate", endDate);

                try {
                    setLoading(true);

                    const data = await productService.addProduct(
                        formData,
                        user.id
                    );

                    if (data?.success) {
                        showResult({
                            success: true,
                            message: "🎉 Tạo sản phẩm thành công!"
                        });

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
                        setEndDate("");

                    } else {
                        showResult({
                            success: false,
                            message: data?.message || "Lỗi hệ thống"
                        });
                    }
                } catch (err) {
                    console.error("Add product error:", err);

                    showResult({
                        success: false,
                        message:
                            err.response?.data?.message ||
                            "Lỗi hệ thống"
                    });

                    setAddError(true);
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        setImages(files);
    };

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        // Name
        if (!name.trim()) {
            newErrors.name = "Tên sản phẩm không được để trống";
        } else if (name.length < 5) {
            newErrors.name = "Tên sản phẩm tối thiểu 5 ký tự";
        }

        // Images
        if (!images || images.length < 3) {
            newErrors.images = "Cần chọn tối thiểu 3 ảnh";
        }

        // Start price
        if (!startPrice || Number(startPrice) <= 0) {
            newErrors.startPrice = "Giá khởi điểm phải lớn hơn 0";
        }

        // Bid step
        if (!bidStep || Number(bidStep) <= 0) {
            newErrors.bidStep = "Bước giá phải lớn hơn 0";
        }

        // Buy now price
        if (
            buyNowPrice &&
            Number(buyNowPrice) <= Number(startPrice)
        ) {
            newErrors.buyNowPrice =
                "Giá mua ngay phải lớn hơn giá khởi điểm";
        }

        // Description
        if (!stripHtml(description)) {
            newErrors.description = "Mô tả không được để trống";
        }

        // End date
        if (!endDate) {
            newErrors.endDate = "Vui lòng chọn thời gian kết thúc";
        } else {
            const end = new Date(endDate);
            const now = new Date();

            if (end <= now) {
                newErrors.endDate = "Thời gian kết thúc phải lớn hơn thời điểm hiện tại";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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
                        {errors.name && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.name}
                            </p>
                        )}
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
                        
                        {errors.images && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.images}
                            </p>
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
                            {errors.startPrice && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.startPrice}
                                </p>
                            )}
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
                            {errors.bidStep && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.bidStep}
                                </p>
                            )}
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
                        {errors.buyNowPrice && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.buyNowPrice}
                            </p>
                        )}
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
                            {errors.description && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.description}
                                </p>
                            )}
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

                    {/* End date */}
                    <div>
                        <label className="block font-medium mb-1">
                            Thời gian kết thúc đấu giá
                        </label>
                        <input
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                clearError("endDate");
                            }}
                            className="w-full rounded-lg border px-3 py-2"
                        />
                        {errors.endDate && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.endDate}
                            </p>
                        )}
                    </div>

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
