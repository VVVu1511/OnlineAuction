function Footer() {
    return (
        <footer className="bg-danger text-white pt-4 pb-3 w-100">
            <div className="container">
                <div className="row">

                    {/* About / Project Info */}
                    <div className="col-md-4 mb-3">
                        <h5>Online Auction</h5>
                        <p className="small">
                            Nền tảng đấu giá trực tuyến giúp người dùng dễ dàng tham gia đấu giá sản phẩm yêu thích,
                            theo dõi trạng thái đấu giá và quản lý lịch sử giao dịch.
                        </p>
                    </div>

                    <div className="col-md-4 mb-3">
                        
                    </div>

                    {/* Contact Info */}
                    <div className="col-md-4 mb-3">
                        <h5>Contact Us</h5>
                        <p className="small mb-1">Email: support@onlineauction.com</p>
                        <p className="small mb-1">Phone: +84 123 456 789</p>
                        <p className="small mb-0">Address:  227 Nguyễn Văn Cừ, thành phố Hồ Chí Minh, Việt Nam</p>
                    </div>

                </div>

                <hr className="bg-white" />

                {/* Copyright */}
                <div className="text-center small">
                    &copy; 2025 Online Auction. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

export default Footer;
