import ProductCard from "../ProductCard/ProductCard";

function TopProducts(){
    
    
    return (
        <div className="container">
            <p className="">Top 5 sản phẩm gần kết thúc</p>
            <div className="row">
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
            </div>
            

            <p className="">Top 5 sản phẩm có nhiều lượt ra giá nhất</p>
            <div className="row">
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
            </div>

            <p className="">Top 5 sản phẩm có giá cao nhất</p>
            <div className="row">
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
            </div>
        </div>
    );
}

export default TopProducts