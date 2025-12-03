import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function ProductDescription({ product, userId }) {
    const isSeller = product.seller === userId;

    const [description, setDescription] = useState(product.description); // mô tả hiện tại
    const [newText, setNewText] = useState(""); // nội dung mới để append
    const [saving, setSaving] = useState(false);

    // helper to strip HTML tags from Quill output
    const stripHtml = (html) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    const handleAppend = async () => {
        const plainText = stripHtml(newText);
        if (!plainText.trim()) return alert("Nhập nội dung mới trước khi thêm.");

        setSaving(true);
        try {
            const res = await fetch(`http://localhost:3000/product/appendDescription/${product.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ newDescription: plainText }),
            });

            const data = await res.json();

            if (res.ok) {
                setDescription(prev => prev + "\n" + plainText); // append plain text locally
                setNewText("");
                alert("Thêm mô tả thành công!");
            } else {
                alert(data.message || "Thêm thất bại");
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi khi thêm mô tả");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mb-3">
            <strong>Description:</strong>
            
            <div style={{ whiteSpace: "pre-wrap" }}> {description.replace(/\\n/g, "\n").split("\n").map((line, idx) => ( <p key={idx}>{line}</p> ))} </div>

            {isSeller && (
                <div className="mt-2">
                    <ReactQuill
                        theme="snow"
                        value={newText}
                        onChange={setNewText}
                        placeholder="Thêm nội dung mô tả mới..."
                    />
                    <button className="btn btn-primary mt-2" onClick={handleAppend} disabled={saving}>
                        {saving ? "Saving..." : "Add"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProductDescription;
