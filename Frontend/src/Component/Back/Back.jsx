import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function Back({
    to = "/",
    label = "Back",
    className = ""
    }) {
    return (
        <Link
        to={to}
        className={`inline-flex items-center gap-2
                    text-sm font-medium
                    text-gray-600 hover:text-red-600
                    px-3 py-2 rounded-md
                    hover:bg-gray-100 transition
                    ${className}`}
        >
        <FaArrowLeft />
        {label}
        </Link>
    );
}
