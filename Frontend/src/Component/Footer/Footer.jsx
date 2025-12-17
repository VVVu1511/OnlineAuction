function Footer() {
    return (
        <footer className="bg-red-600 text-white mt-12">
            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Top content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* About */}
                    <div>
                        <h5 className="text-lg font-semibold mb-3">
                            Online Auction
                        </h5>
                        <p className="text-sm text-red-100 leading-relaxed">
                            Nền tảng đấu giá trực tuyến giúp người dùng dễ dàng tham gia đấu giá
                            sản phẩm yêu thích, theo dõi trạng thái đấu giá và quản lý lịch sử giao dịch.
                        </p>
                    </div>

                    {/* Spacer / Future links */}
                    <div>
                        {/* Có thể thêm:
                            - Chính sách
                            - Điều khoản
                            - FAQ
                        */}
                    </div>

                    {/* Contact */}
                    <div>
                        <h5 className="text-lg font-semibold mb-3">
                            Contact Us
                        </h5>
                        <p className="text-sm text-red-100 mb-1">
                            Email: support@onlineauction.com
                        </p>
                        <p className="text-sm text-red-100 mb-1">
                            Phone: +84 123 456 789
                        </p>
                        <p className="text-sm text-red-100">
                            Address: 227 Nguyễn Văn Cừ, TP. Hồ Chí Minh, Việt Nam
                        </p>
                    </div>

                </div>

                {/* Divider */}
                <div className="border-t border-red-400 my-6"></div>

                {/* Copyright */}
                <div className="text-center text-sm text-red-100">
                    © 2025 Online Auction. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

export default Footer;
