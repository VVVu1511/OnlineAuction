import { useContext, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import * as productService from "../../service/product.service";
//set Loading
import {LoadingContext} from "../../context/LoadingContext.jsx";


export default function AddAuctionProduct() {
    const [name, setName] = useState("");
    const [images, setImages] = useState([]);
    const [startPrice, setStartPrice] = useState("");
    const [bidStep, setBidStep] = useState("");
    const [buyNowPrice, setBuyNowPrice] = useState("");
    const [description, setDescription] = useState("");
    const [autoExtend, setAutoExtend] = useState(true);
    const {setLoading} = useContext(LoadingContext);
    const [addError, setAddError] = useState(false);
    const [user,setUser] = useState(null);

    useEffect(() => {
        return () => {
            images.forEach((file) =>
                URL.revokeObjectURL(file)
            );
        };
    }, [images]);

    const handleSubmit = async (e) => {
        const res = JSON.parse(localStorage.getItem("user"));
        setUser(res);
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
            setLoading(true);

            const data = await productService.addProduct(formData, user.id);

            if (data.success) {
                alert("Tạo sản phẩm thành công!");
                
                // Reset form
                setName("");
                setImages([]);
                setStartPrice("");
                setBidStep("");
                setBuyNowPrice("");
                setDescription("");
                setAutoExtend(true);
                setAddError(false);
                
            } else {
                alert(data.message || "Lỗi hệ thống");
            }
        } catch (err) {
            alert(err);

            setAddError(true);

            // alert(err.response?.data?.message || "Lỗi hệ thống");
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
