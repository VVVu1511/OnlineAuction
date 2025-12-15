import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as categoryService from "../../service/category.service.jsx"

function CategoryDetail(){
    const [childCategory, setChildCategory] = useState([]);
    const location = useLocation();
    const { category_id } = location.state || {};
    const navigate = useNavigate();

    useEffect(() => {
        if (!category_id) return;

        const loadChildCategories = async () => {
            try {
                const res = await categoryService.fetchChildCategory(category_id);
                setChildCategory(res.data);
            } catch (err) {
                console.error("Error fetching child categories:", err);
            }
        };

        loadChildCategories();
    }, [category_id]);

    const handleClick = (id) => {
        navigate('/productGridWithCat', {
            state: { category_id: category_id, current_category_id: id }
        });
    };

    return (
        <div className="p-5">
            <p>Tất Cả Danh Mục</p>

            {childCategory.map((item, index) => (
                <button className="btn btn-primary" onClick={() => handleClick(item.id)} key={index}>{item.description}</button>

            ))}
        </div>
    );
}

export default CategoryDetail;
