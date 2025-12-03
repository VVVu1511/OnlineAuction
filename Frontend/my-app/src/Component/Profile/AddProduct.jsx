import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // quill css

function AddAuctionProduct() {
    const [name, setName] = useState("");
    const [images, setImages] = useState([]); // file list
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

        const res = await fetch("http://localhost:3000/product/add", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: formData
        });
        
        const data = await res.json();
        if (res.ok) alert("Tạo sản phẩm thành công!");
        else alert(data.message || "Lỗi hệ thống");
    };

    return (
        <>
            <h3 className="text-xl font-medium mb-2">Thêm sản phẩm</h3>

            <form onSubmit={handleSubmit} className="container py-4">
                <div className="mb-3">
                    <label className="form-label">Tên sản phẩm</label>
                    <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Ảnh sản phẩm (tối thiểu 3)</label>
                    <input type="file" multiple accept="image/*" className="form-control"
                    onChange={e => setImages(Array.from(e.target.files))} required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Giá khởi điểm</label>
                    <input type="number" className="form-control" value={startPrice} onChange={e => setStartPrice(e.target.value)} required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Bước giá</label>
                    <input type="number" className="form-control" value={bidStep} onChange={e => setBidStep(e.target.value)} required />
                </div>

                <div className="mb-3">
                    <label className="form-label">Giá mua ngay (tùy chọn)</label>
                    <input type="number" className="form-control" value={buyNowPrice} onChange={e => setBuyNowPrice(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Mô tả sản phẩm</label>
                    <ReactQuill value={description} onChange={setDescription} />
                </div>

                <div className="form-check mb-3">
                    <input type="checkbox" className="form-check-input" checked={autoExtend} onChange={e => setAutoExtend(e.target.checked)} />
                    <label className="form-check-label">Tự động gia hạn khi còn 5 phút</label>
                </div>

                <button type="submit" className="btn btn-primary">Đăng sản phẩm</button>
            </form>
        </>
    );
}

export default AddAuctionProduct;
