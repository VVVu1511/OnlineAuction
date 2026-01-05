

export default function Footer() {
    return (
        <footer className="bg-gray-100 border-t">
            <div className="container mx-auto px-4 py-4 text-center text-gray-500 text-sm">
                © {new Date().getFullYear()} Online Auction
            </div>
        </footer>
    );
}
