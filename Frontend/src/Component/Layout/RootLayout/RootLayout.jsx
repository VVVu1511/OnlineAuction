// layouts/RootLayout.jsx
import { Outlet, useNavigation } from "react-router-dom";
import Header from "../Component/Header/Header";
import Footer from "../Component/Footer/Footer";

export default function RootLayout() {
    const navigation = useNavigation();
    const isNavigating = Boolean(navigation.location);

    return (
        <>
        {isNavigating && <GlobalSpinner />}

        <div className="position-fixed w-100 z-3">
            <Header />
        </div>

        <div className="row" style={{ paddingTop: "100px", minHeight: "100vh" }}>
            <div className="col-2 bg-secondary-subtle" />
            <div className="col-8 mb-5 pt-4">
            <Outlet />
            </div>
            <div className="col-2 bg-secondary-subtle" />
        </div>

        <Footer />
        </>
    );
}

function GlobalSpinner() {
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
            </div>
            <p className="text-gray-700 font-medium text-lg">Loading...</p>
        </div>
        </div>
    );
}
