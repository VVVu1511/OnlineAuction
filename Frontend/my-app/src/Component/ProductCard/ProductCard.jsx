function ProductCard(){
    return (
        <>
            <div className="card">
                <img className="card-img-top img-fluid" src="/Shirt1/shirt1.jpg" alt="" />
                <div className="card-body">
                    <p className="text-center card-title">Tên sản phẩm</p>
                    <p className="text-center card-text">Giá hiện tại</p>
                    <p className="text-center card-text">Best Bidder</p>
                    <p className="text-center card-text">Giá mua ngay</p>
                    <p className="text-center card-text">Ngày đăng</p>
                    <p className="text-center card-text">Thời gian còn lại</p>
                    <p className="text-center card-text">Số lượt ra giá hiện tại</p>
                </div>
            </div>
        </>
    );
}

export default ProductCard;