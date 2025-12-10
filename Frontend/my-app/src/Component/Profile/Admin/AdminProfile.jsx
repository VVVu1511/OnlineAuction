import CategoryManagement from './CategoryManagement'
import ProductMangement from './ProductMangement'
import UserManagement from './UserManagement'
import UpgradeRequests from './UpgradeRequests'

export default function AdminProfile({ user, token }) {
    return (
        <div className='p-5 gap-5 flex-column d-flex'>
            <CategoryManagement token={token}/>
        
            <ProductMangement token={token}/>
            
            <UserManagement token={token}/>
            
            <UpgradeRequests token={token}/>
        </div>
    );
}
