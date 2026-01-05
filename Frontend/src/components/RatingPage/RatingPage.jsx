import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import * as accountService from "../../services/account.service.jsx";
import Back from "../Back/Back.jsx";

export default function RatingPage() {
    const { id } = useParams(); // seller id
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRatings() {
            try {
                const res = await accountService.getRatingByUser(id);
                if (res.success) {
                    setRatings(res.data);
                }
            } finally {
                setLoading(false);
            }
        }

        fetchRatings();
    }, [id]);

    const positive =
        ratings.filter(r => r.rating === 1).length;

    const percent =
        ratings.length > 0
            ? Math.round((positive / ratings.length) * 100)
            : 0;

    if (loading) return <p>Đang tải đánh giá...</p>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <Back />
            
            <h1 className="mt-5 mb-4 text-xl font-semibold">
                Đánh giá 
            </h1>

            <p className="mb-6 text-sm text-gray-600">
                👍 {positive}/{ratings.length} đánh giá tốt ({percent}%)
            </p>

            {ratings.length === 0 ? (
                <p>Chưa có đánh giá</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="border px-3 py-2 text-left">
                                    Người đánh giá
                                </th>
                                <th className="border px-3 py-2 text-left">
                                    Sản phẩm
                                </th>
                                <th className="border px-3 py-2 text-center">
                                    Đánh giá
                                </th>
                                <th className="border px-3 py-2 text-left">
                                    Nhận xét
                                </th>
                                <th className="border px-3 py-2 text-left">
                                    Ngày
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {ratings.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50">
                                    <td className="border px-3 py-2">                                        
                                            {r.rater_name}
                                    </td>

                                    <td className="border px-3 py-2">
                                            {r.product_name}
                                    </td>

                                    <td className="border px-3 py-2 text-center">
                                        {r.rating === 1 ? "👍" : "👎"}
                                    </td>

                                    <td className="border px-3 py-2">
                                        {r.comment || "—"}
                                    </td>

                                    <td className="border px-3 py-2">
                                        {new Date(r.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
