import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as categoryService from "../../service/category.service.jsx";

function CategoryDetail() {
    const [childCategory, setChildCategory] = useState([]);
    const navigate = useNavigate();
    const { categoryId } = useParams();
    const [category, setCategory] = useState(null);

    useEffect(() => {
        if (!categoryId) return;

        const loadChildCategories = async () => {
            try {
                const categoryRes = await categoryService.getCategoryById(categoryId);
                setCategory(categoryRes.data);

                const res = await categoryService.fetchChildCategory(categoryId);
                const children = res.data || [];

                setChildCategory(children);

            } catch (err) {
                console.error("Error fetching child categories:", err);
            }
        };

        loadChildCategories();
    }, [categoryId]);

    const handleClick = (id) => {
        // 👉 xem sản phẩm theo child category
        navigate(`/category/${id}`);
    };

    return (
        <div className="px-4 py-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">{category?.description}</h1>
            
            {childCategory.length > 0 && (
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    Tất Cả Danh Mục Con
                </h2>
            )}

            <div className="flex flex-wrap gap-4">
                {childCategory.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleClick(item.id)}
                        className="
                            px-6 py-3
                            rounded-xl
                            border
                            border-gray-300
                            bg-white
                            text-gray-700
                            font-medium
                            transition
                            hover:bg-blue-600
                            hover:text-black
                            hover:scale-105
                            hover:border-blue-600
                        "
                    >
                        {item.description}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default CategoryDetail;
