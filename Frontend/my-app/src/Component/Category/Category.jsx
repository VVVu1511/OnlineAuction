

function Category(){
    const categories_1 = ["Điện tử","Điện tử","Điện tử","Điện tử"];
    const categories_2 = ["Điện tử","Điện tử","Điện tử","Điện tử"];
    
    return (
        <div className="mt-5">
            <p className="h2">DANH MỤC</p>

            <div className="row">
                {
                    categories_1.map((item,index) => (
                        <div className="col-3" key={index}>
                            <img src="/Shirt1/shirt1.jpg" alt="" className="img-fluid" />
                            <p className="text-center">{item}</p>
                        </div>
                    ))
                }
            </div>

            <div className="row">
                {
                    categories_2.map((item,index) => (
                        <div className="col-3" key={index}>
                            <img src="/Shirt1/shirt1.jpg" alt="" className="img-fluid" />
                            <p className="text-center">{item}</p>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Category