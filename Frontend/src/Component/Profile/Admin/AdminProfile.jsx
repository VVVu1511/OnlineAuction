import CategoryManagement from "../Admin/CategoryManagement.jsx";
import ProductManagement from "../Admin/ProductMangement.jsx";
import UserManagement from "../Admin/UserManagement.jsx";
import UpgradeRequests from "../Admin/UpgradeRequests.jsx";
import PersonalInformation from "../Information/PersonalInformation.jsx";
import ChangePassword from "../Information/ChangePassword.jsx";

export default function AdminProfile({ user}) {
    

    return (
        <div className="p-5 d-flex flex-column gap-5">
            <PersonalInformation user={user} />
            <ChangePassword user={user} />
            <CategoryManagement user={user} />
            <ProductManagement user={user} />
            <UserManagement user={user} />
            <UpgradeRequests user={user} />
        </div>
    );
}
