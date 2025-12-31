import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { LoadingContext } from "../../context/LoadingContext.jsx";
import { updateProfile, changePassword } from "../../services/account.service.jsx";
import Back from "../Back/Back.jsx";

export default function Profile() {
    const { user, updateUser } = useContext(AuthContext);
    const { setLoading } = useContext(LoadingContext);

    const [isEditing, setIsEditing] = useState(false);

    const [profile, setProfile] = useState({
        full_name: user.full_name || "",
        email: user.email || "",
        address: user.address || "",
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    /* ================= EDIT ================= */
    const handleEdit = () => {
        setProfile({
            full_name: user.full_name || "",
            email: user.email || "",
            address: user.address || "",
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    /* ================= UPDATE PROFILE ================= */
    const handleUpdateProfile = async () => {
        try {
            setLoading(true);

            const updated = await updateProfile(
                {
                    full_name: profile.full_name,
                    address: profile.address,
                },
                user.id
            );


            updateUser(updated); // cập nhật AuthContext
            setIsEditing(false);
            alert("Cập nhật thông tin thành công");

        } catch {
            alert("Cập nhật thất bại");
        } finally {
            setLoading(false);
        }
    };

    /* ================= CHANGE PASSWORD ================= */
    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Mật khẩu xác nhận không khớp");
            return;
        }

        try {
            setLoading(true);

            await changePassword(
                {
                    old_password: passwordData.oldPassword,
                    new_password: passwordData.newPassword,
                },
                user.id
            );

            setPasswordData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            alert("Đổi mật khẩu thành công");
        } catch {
            alert("Đổi mật khẩu thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-8">
            <Back />
            
            {/* ================= PROFILE ================= */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">
                        Thông tin cá nhân
                    </h2>

                    {!isEditing && (
                        <button
                            onClick={handleEdit}
                            className="text-blue-600 font-medium"
                        >
                            Chỉnh sửa
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    <input
                        className="border p-2 rounded w-full"
                        placeholder="Họ tên"
                        value={isEditing ? profile.full_name : user.full_name}
                        disabled={!isEditing}
                        onChange={e =>
                            setProfile({ ...profile, full_name: e.target.value })
                        }
                    />

                    <input
                        className="border p-2 rounded w-full bg-gray-100"
                        value={user.email}
                        disabled
                    />

                    <input
                        className="border p-2 rounded w-full"
                        placeholder="Địa chỉ"
                        value={isEditing ? profile.address : user.address}
                        disabled={!isEditing}
                        onChange={e =>
                            setProfile({ ...profile, address: e.target.value })
                        }
                    />

                    {isEditing && (
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={handleUpdateProfile}
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                Lưu
                            </button>

                            <button
                                onClick={handleCancel}
                                className="border px-4 py-2 rounded"
                            >
                                Huỷ
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* ================= PASSWORD ================= */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Đổi mật khẩu</h2>

                <div className="space-y-3">
                    <input
                        type="password"
                        className="border p-2 rounded w-full"
                        placeholder="Mật khẩu hiện tại"
                        value={passwordData.oldPassword}
                        onChange={e =>
                            setPasswordData({
                                ...passwordData,
                                oldPassword: e.target.value,
                            })
                        }
                    />

                    <input
                        type="password"
                        className="border p-2 rounded w-full"
                        placeholder="Mật khẩu mới"
                        value={passwordData.newPassword}
                        onChange={e =>
                            setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value,
                            })
                        }
                    />

                    <input
                        type="password"
                        className="border p-2 rounded w-full"
                        placeholder="Xác nhận mật khẩu mới"
                        value={passwordData.confirmPassword}
                        onChange={e =>
                            setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value,
                            })
                        }
                    />

                    <button
                        onClick={handleChangePassword}
                        className="bg-green-600 text-white px-4 py-2 rounded mt-3"
                    >
                        Đổi mật khẩu
                    </button>
                </div>
            </section>
        </div>
    );
}
