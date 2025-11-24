import { useNavigate } from "react-router-dom";


function Category(){
    const navigate = useNavigate();
    const categories_1 = ["Điện tử","Thời trang","Sách Online","Bách hóa Online"];
    const image = ["/Categories/phone.webp", "/Categories/shirt.jpg", "/Categories/book.jpg", "/Categories/cart.webp"];

    const handleClick = () => {
        navigate('/productTest');
    }

    return (
    <div className="mt-5">
        <p className="h2">DANH MỤC</p>

        <div className="row text-center">
        {categories_1.map((item, index) => (
            <div
            onClick={() => handleClick()}
            className="col-3 border d-flex flex-column align-items-center justify-content-center py-3"
            key={index}
            >
            <img
                src={image[index]}
                alt=""
                className="img-fluid mb-2"
                style={{ width: "120px", height: "120px", objectFit: "cover" }}
            />
            <p className="mt-2">{item}</p>
            </div>
        ))}
        </div>
    </div>
);

}

export default Category