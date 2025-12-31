import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function Back({
    to = "/",
    label = "Quay lại",
    className = "",
}) {
    return (
        <Link
            to={to}
            className={`
                !no-underline
                inline-flex items-center gap-2
                text-sm font-medium
                text-white 
                bg-blue-600
                px-4 py-2
                rounded-lg
                hover:bg-blue-500
                transition-colors duration-200
                ${className}
            `}
        >
            <FaArrowLeft className="text-xs" />
            <span>{label}</span>
        </Link>
    );
}
