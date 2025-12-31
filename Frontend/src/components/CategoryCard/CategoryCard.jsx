// components/CategoryCard/CategoryCard.jsx
import { useNavigate } from "react-router-dom";

export default function CategoryCard({ category }) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/category/${category.id}`);
    };

    return (
        <div
            onClick={handleClick}
            className="cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition"
        >
            <div className="p-3 text-center font-medium">
                {category.description}
            </div>
        </div>
    );
}
