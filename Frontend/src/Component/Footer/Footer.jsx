function Footer() {
    return (
        <footer className="bg-red-700 text-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">

            {/* Top content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            {/* About */}
            <div>
                <h5 className="text-lg font-bold mb-4">
                Online Auction
                </h5>
                <p className="text-sm text-red-100 leading-relaxed">
                Nền tảng đấu giá trực tuyến giúp người dùng dễ dàng tham gia đấu giá
                sản phẩm yêu thích, theo dõi trạng thái đấu giá và quản lý lịch sử giao dịch.
                </p>
            </div>

            {/* Spacer / Future links */}
            <div className="md:text-center">
                {/* Có thể thêm sau:
                - Chính sách
                - Điều khoản
                - FAQ
                */}
            </div>

            {/* Contact */}
            <div>
                <h5 className="text-lg font-bold mb-4">
                Contact Us
                </h5>
                <ul className="space-y-2 text-sm text-red-100">
                <li>
                    <span className="font-medium text-white">Email:</span>{" "}
                    support@onlineauction.com
                </li>
                <li>
                    <span className="font-medium text-white">Phone:</span>{" "}
                    +84 123 456 789
                </li>
                <li>
                    <span className="font-medium text-white">Address:</span>{" "}
                    227 Nguyễn Văn Cừ, TP. Hồ Chí Minh, Việt Nam
                </li>
                </ul>
            </div>

            </div>

            {/* Divider */}
            <div className="border-t border-red-500 my-8"></div>

            {/* Copyright */}
            <div className="text-center text-xs text-red-200">
            © 2025 Online Auction. All rights reserved.
            </div>
        </div>
        </footer>
    );
}

export default Footer;
