import image from '../../assets/logo.webp'


function Header(){
    return (
        <div className="bg-danger p-4">
            <div className='row'>
                <div className='col-9'></div>
                <div className="col-3">
                    <a href=''>Đăng ký </a>
                    |
                    <a href=""> Đăng nhập</a>
                </div>
            </div>

            <div className="row m-3">
                <div className="col-2">
                    <p className="h2 text-center">Online Auction</p>
                </div>
                <div className="col-8">
                    <input type='text' className='form-control' placeholder='Tra cứu sản phẩm...'></input>
                </div>
                <div className="col-2">
                    <i className="fa-solid fa-cart-arrow-down fa-3x ms-3"></i>
                </div>
            </div>
        </div>
        
    )
}

export default Header