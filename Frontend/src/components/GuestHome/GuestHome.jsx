import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CategoryCard from "../CategoryCard/CategoryCard.jsx";
import ProductCard from "../ProductCard/ProductCard.jsx";
import * as productService from "../../services/product.service.jsx";
import * as categoryService from "../../services/category.service.jsx";

import { AuthContext } from "../../context/AuthContext.jsx";
import { LoadingContext } from "../../context/LoadingContext.jsx";

export default function GuestHome() {
    const { user } = useContext(AuthContext); // dùng sau nếu cần
    const { setLoading } = useContext(LoadingContext);

    const [categories, setCategories] = useState([]);
    const [top5End, setTop5End] = useState([]);
    const [top5Bid, setTop5Bid] = useState([]);
    const [top5Price, setTop5Price] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [catRes, endRes, bidRes, priceRes] = await Promise.all([
                    categoryService.fetchParentCategories(),
                    productService.getTop5NearEnd(),
                    productService.getTop5BidCounts(),
                    productService.getTop5Price(),
                ]);

                setCategories(catRes?.data || []);
                setTop5End(endRes?.data || []);
                setTop5Bid(bidRes?.data || []);
                setTop5Price(priceRes?.data || []);
            } catch (err) {
                console.error("Load GuestHome error:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [setLoading]);

    return (
        <div className="w-full">
            {/* ===== CATEGORY CARD ===== */}
            <Section title="📂 Danh mục">
                {categories.map((cat) => (
                    <CategoryCard key={cat.id} category={cat} />
                ))}
            </Section>

            {/* ===== TOP 5 GẦN KẾT THÚC ===== */}
            <Section title="🔥 Sắp kết thúc">
                {top5End.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </Section>

            {/* ===== TOP 5 NHIỀU LƯỢT RA GIÁ ===== */}
            <Section title="📈 Nhiều lượt ra giá nhất">
                {top5Bid.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </Section>

            {/* ===== TOP 5 GIÁ CAO NHẤT ===== */}
            <Section title="💰 Giá cao nhất">
                {top5Price.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </Section>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div className="px-6 mb-10">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <div className="grid grid-cols-5 gap-4">
                {children}
            </div>
        </div>
    );
}
