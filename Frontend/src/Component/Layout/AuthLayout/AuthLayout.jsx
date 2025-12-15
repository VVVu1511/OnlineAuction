// layouts/AuthLayout.jsx
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
    return (
        <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
        >
        <Outlet />
        </div>
    );
}
