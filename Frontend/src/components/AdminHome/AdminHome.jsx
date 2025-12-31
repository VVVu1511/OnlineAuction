import CategoryManagement from "./CategoryManagement";
import ProductManagement from "./ProductManagement";
import UserManagement from "./UserManagement";

export default function AdminHome() {
    return (
        <div className="space-y-12">
            <CategoryManagement />
            <ProductManagement />
            <UserManagement />
        </div>
    );
}
