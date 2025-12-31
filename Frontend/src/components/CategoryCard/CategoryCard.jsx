// components/CategoryCard/CategoryCard.jsx
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext.jsx";
import { LoadingContext } from "../../context/LoadingContext.jsx";

export default function CategoryCard({ category }) {
    const navigate = useNavigate();

    const { user } = useContext(AuthContext); // để sẵn cho phân quyền sau
    const { setLoading } = useContext(LoadingContext);

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
