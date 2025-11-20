import ProductCard from "../ProductCard/ProductCard";

function TopProducts(){
    
    
    return (
        <div>
            <p className="mt-3">Top 5 sản phẩm gần kết thúc</p>
            <div className="row">
                <div className="col-2">
                    <ProductCard/>
                </div>
                <div className="col-2">
                    <ProductCard/>
                </div>
                <div className="col-2">
                    <ProductCard/>
                </div>
                <div className="col-2">
                    <ProductCard/>
                </div>
                <div className="col-2">
                    <ProductCard/>
                </div>
            </div>
            

            <p className="mt-3">Top 5 sản phẩm có nhiều lượt ra giá nhất</p>
            <div className="row mx-auto">
                <div className="col-2">
                    <ProductCard/>
                </div>
                <div className="col-2">
                    <ProductCard/>
                </div>
                <div className="col-2">
                    <ProductCard/>
                </div>
                <div className="col-2">
                    <ProductCard/>
                </div>
                <div className="col-2">
                    <ProductCard/>
                </div>
            </div>

            <p className="mt-3">Top 5 sản phẩm có giá cao nhất</p>
            <div className="row">
                <div className="col-2">
                    <ProductCard/>
                </div>
                <div className="col-2">
                    <ProductCard/>
                </div>
                <div className="col-2">
                    <ProductCard/>
                </div>
                <div className="col-2">
                    <ProductCard/>
                </div>
                <div className="col-2">
                    <ProductCard/>
                </div>
            </div>
        </div>
    );
}

export default TopProducts