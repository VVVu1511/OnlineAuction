import { useEffect, useState } from "react";
import ProductCard from "../../ProductCard/ProductCard.jsx"; // import vào
import { useNavigate } from "react-router-dom";

export default function ProductManagement({ token }) {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3000/product/all", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => setProducts(data.data))
            .catch(err => console.error(err));
    }, [token]);


    // REMOVE PRODUCT
    const removeProduct = async (id) => {
        try {
            const res = await fetch(`http://localhost:3000/product/${id}`, {
                method: "DELETE",   // bạn dùng PUT để "remove"
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ id })
            });

            const result = await res.json();
            if (!result.success) {
                alert("Cannot remove product");
                return;
            }

            setProducts(prev => prev.filter(p => p.id !== id));

        } catch (err) {
            console.error("Remove error:", err);
        }
    };

    return (
        <div>
            <h3>Product Management</h3>

            <div className="d-flex flex-wrap gap-3">
                {products.map(p => (
                    <div key={p.id}>

                        <ProductCard
                            data={p}
                            liked={false}   // admin không cần watchlist
                        />

                        <button
                            className="btn btn-danger mt-1 w-100"
                            onClick={() => removeProduct(p.id)}
                        >
                            Remove
                        </button>

                    </div>
                ))}
            </div>
        </div>
    );
}
