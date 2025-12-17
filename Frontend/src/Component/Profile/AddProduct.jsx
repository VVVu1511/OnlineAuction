import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import * as productService from "../../service/product.service";

export default function AddAuctionProduct() {
    const [name, setName] = useState("");
    const [images, setImages] = useState([]);
    const [startPrice, setStartPrice] = useState("");
    const [bidStep, setBidStep] = useState("");
    const [buyNowPrice, setBuyNowPrice] = useState("");
    const [description, setDescription] = useState("");
    const [autoExtend, setAutoExtend] = useState(true);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (images.length < 3) {
            alert("Vui lòng tải lên ít nhất 3 ảnh.");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        images.forEach((img) => formData.append("images", img));
        formData.append("startPrice", startPrice);
        formData.append("bidStep", bidStep);
        formData.append("buyNowPrice", buyNowPrice);
        formData.append("description", description);
        formData.append("autoExtend", autoExtend);

        try {
            const data = await productService.addProduct(formData);
            if (data.success) {
                alert("Tạo sản phẩm thành công!");
            } else {
                alert(data.message || "Lỗi hệ thống");
            }
        } catch (err) {
            console.error("Add product error:", err);
            alert(err.response?.data?.message || "Lỗi hệ thống");
        }
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
                            required
                            onChange={(e) =>
                                setImages(Array.from(e.target.files))
                            }
                            className="w-full rounded-lg border px-3 py-2 bg-white"
                        />
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
