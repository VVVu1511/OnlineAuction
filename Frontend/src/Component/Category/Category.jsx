import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as categoryService from "../../service/category.service.jsx";

function Category() {
    const navigate = useNavigate();
    const [category, setCategory] = useState([]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await categoryService.fetchParentCategories();
                setCategory(res.data);
            } catch (err) {
                console.error("Error fetching parent categories:", err);
            }
        };

        loadCategories();
    }, []);

    const images = [
        "/Categories/phone.webp",
        "/Categories/shirt.jpg",
        "/Categories/book.jpg",
        "/Categories/cart.webp",
    ];

    const handleClick = (id) => {
        navigate(`/category/${id}`, {
            state: { category_id: id, current_category_id: id },
        });
    };

    return (
        <div className="mt-12 px-4">
            
            
            {/* Title */}
            <h2 className="text-2xl font-bold mb-6 text-center">
                DANH MỤC
            </h2>

            {/* Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {category.map((item, index) => (
                    <div
                        key={item.id}
                        onClick={() => handleClick(item.id)}
                        className="
                            cursor-pointer
                            rounded-2xl
                            border
                            bg-white
                            p-4
                            flex
                            flex-col
                            items-center
                            justify-center
                            text-center
                            transition
                            hover:shadow-lg
                            hover:-translate-y-1
                        "
                    >
                        <img
                            src={images[index]}
                            alt={item.description}
                            className="w-28 h-28 object-cover rounded-xl mb-3"
                        />
                        <p className="font-medium text-gray-700">
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Category;
