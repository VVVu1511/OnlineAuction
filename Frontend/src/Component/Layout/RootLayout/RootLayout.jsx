// layouts/RootLayout.jsx
import { Outlet, useNavigation } from "react-router-dom";
import Header from "../../Header/Header.jsx";
import Footer from "../../Footer/Footer.jsx";
import { useContext } from "react";
import { LoadingContext } from "../../../context/LoadingContext.jsx";

export default function RootLayout() {
    const { loading } = useContext(LoadingContext);

    return (
        <>
            {loading && <GlobalSpinner />}

            {/* Fixed Header */}
            <div className="fixed top-0 left-0 w-full z-40">
                <Header />
            </div>

            {/* Main Content */}
            <div className="pt-12 min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4">
                    
                    {/* Left spacer */}
                    <div className="hidden lg:block lg:col-span-2 bg-gray-100 rounded-xl" />

                    {/* Main outlet */}
                    <main className="col-span-12 lg:col-span-8 pt-4 pb-10">
                        <Outlet />
                    </main>

                    {/* Right spacer */}
                    <div className="hidden lg:block lg:col-span-2 bg-gray-100 rounded-xl" />
                </div>
            </div>

            <Footer />
        </>
    );
}

function GlobalSpinner() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
                    <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-gray-700 font-medium text-lg">
                    Loading...
                </p>
            </div>
        </div>
    );
}
