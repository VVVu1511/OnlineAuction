import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import * as productService from "../../service/product.service.jsx";

export default function ProductDescription({ product, userId }) {
    const isSeller = product.seller === userId;

    const [description, setDescription] = useState(product.description);
    const [newText, setNewText] = useState("");
    const [saving, setSaving] = useState(false);

    // strip HTML from Quill output
    const stripHtml = (html) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    const handleAppend = async () => {
        const plainText = stripHtml(newText);
        if (!plainText.trim()) {
            alert("Nhập nội dung mới trước khi thêm.");
            return;
        }

        try {
            setSaving(true);

            const res = await productService.appendProductDescription(
                product.id,
                plainText
            );

            if (res.success) {
                setDescription((prev) => prev + "\n" + plainText);
                setNewText("");
                alert("Thêm mô tả thành công!");
            } else {
                alert(res.message || "Thêm thất bại");
            }
        } catch (err) {
            console.error("Append description error:", err);
            alert(err.response?.data?.message || "Lỗi khi thêm mô tả");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* ===== Current description ===== */}
            <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>

                <div className="space-y-2 text-gray-700">
                    {description
                        .replace(/\\n/g, "\n")
                        .split("\n")
                        .map((line, idx) => (
                            <p key={idx} className="leading-relaxed">
                                {line}
                            </p>
                        ))}
                </div>
            </div>

            {/* ===== Seller editor ===== */}
            {isSeller && (
                <div className="border rounded-xl p-4 bg-gray-50 space-y-3">
                    <p className="font-medium text-gray-800">
                        ✏️ Thêm mô tả mới
                    </p>

                    <ReactQuill
                        theme="snow"
                        value={newText}
                        onChange={setNewText}
                        placeholder="Thêm nội dung mô tả mới..."
                    />

                    <div className="flex justify-end">
                        <button
                            onClick={handleAppend}
                            disabled={saving}
                            className={`
                                px-5 py-2 rounded-lg text-sm font-medium
                                transition
                                ${
                                    saving
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                }
                            `}
                        >
                            {saving ? "Saving..." : "Add"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
