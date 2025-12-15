import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as categoryService from "../../service/category.service.jsx"

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
        "/Categories/cart.webp"
    ];

    const handleClick = (id) => {
        navigate('/productGridWithCat', {
            state: { category_id: id , current_category_id: id}
        });
    };

    return (
        <div className="mt-5">
            <p className="h2">DANH MỤC</p>

            <div className="row text-center">
                {category.map((item, index) => (
                    <div
                        key={item.id}
                        className="col-3 border d-flex flex-column align-items-center justify-content-center py-3"
                        onClick={() => handleClick(item.id)}   
                    >
                        <img
                            src={images[index]}
                            alt={item.description}
                            className="img-fluid mb-2"
                            style={{
                                width: "120px",
                                height: "120px",
                                objectFit: "cover"
                            }}
                        />
                        <p className="mt-2">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Category;
