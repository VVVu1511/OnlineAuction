import CategoryManagement from "../Admin/CategoryManagement.jsx";
import ProductManagement from "../Admin/ProductMangement.jsx";
import UserManagement from "../Admin/UserManagement.jsx";
import UpgradeRequests from "../Admin/UpgradeRequests.jsx";

export default function AdminProfile({ user, token }) {
    if (!user || user.role !== "1") {
        return <p className="text-danger">Không có quyền truy cập</p>;
    }

    return (
        <div className="p-5 d-flex flex-column gap-5">
            <CategoryManagement token={token} />
            <ProductManagement token={token} />
            <UserManagement token={token} />
            <UpgradeRequests token={token} />
        </div>
    );
}
