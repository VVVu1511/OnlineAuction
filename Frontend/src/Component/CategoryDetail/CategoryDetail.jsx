import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as categoryService from "../../service/category.service.jsx";

function CategoryDetail() {
    const [childCategory, setChildCategory] = useState([]);
    const location = useLocation();
    const { category_id } = location.state || {};
    const navigate = useNavigate();

    useEffect(() => {
        if (!category_id) return;

        const loadChildCategories = async () => {
            try {
                const res = await categoryService.fetchChildCategory(category_id);
                const children = res.data || [];

                // ✅ thêm "Tất cả"
                const withAll = [
                    {
                        id: "all",
                        description: "Tất cả",
                    },
                    ...children,
                ];

                setChildCategory(withAll);
            } catch (err) {
                console.error("Error fetching child categories:", err);
            }
        };

        loadChildCategories();
    }, [category_id]);

    const handleClick = (id) => {
        if (id === "all") {
            // 👉 xem tất cả sản phẩm của parent
            navigate(`/category/${category_id}`, {
                state: {
                    category_id,
                    current_category_id: "all",
                },
            });
            return;
        }

        // 👉 xem sản phẩm theo child category
        navigate(`/category/${id}`, {
            state: {
                category_id,
                current_category_id: id,
            },
        });
    };

    return (
        <div className="px-4 py-6 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Tất Cả Danh Mục
            </h2>

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
