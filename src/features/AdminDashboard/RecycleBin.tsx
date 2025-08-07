import React, { useEffect, useState } from "react";
import { getAllUsers, restoreUser, deleteUser } from "./Usermanager/userService";
import type { User } from "./Usermanager/userService";
import LeftMenu from "./LeftMenu";

export default function RecycleBin() {
    const [deletedUsers, setDeletedUsers] = useState<User[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchDeletedUsers = async () => {
            setLoading(true);
            const users = await getAllUsers();
            setDeletedUsers(users.filter(u => u.status === null));
            setLoading(false);
        };
        fetchDeletedUsers();
    }, []);

    const handleRestore = async (userId: string) => {
        const ok = window.confirm("Khôi phục tài khoản này?");
        if (!ok) return;
        const result = await restoreUser(userId);
        if (result.success) {
            setDeletedUsers(deletedUsers.filter(u => u.id !== userId));
        } else {
            alert("Khôi phục thất bại: " + result.message);
        }
    };

    const handleDeleteForever = async (userId: string) => {
        const ok = window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn?");
        if (!ok) return;
        const result = await deleteUser(userId);
        if (result.success) {
            setDeletedUsers(deletedUsers.filter(u => u.id !== userId));
        } else {
            alert("Xóa thất bại: " + result.message);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? deletedUsers.map(u => u.id) : []);
    };

    const handleSelectRow = (userId: string) => {
        setSelectedIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleBulkRestore = async () => {
        if (window.confirm(`Khôi phục ${selectedIds.length} tài khoản đã chọn?`)) {
            for (const id of selectedIds) {
                await restoreUser(id);
            }
            setDeletedUsers(deletedUsers.filter(u => !selectedIds.includes(u.id)));
            setSelectedIds([]);
        }
    };

    const filteredUsers = deletedUsers.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

   useEffect(() => {
       const menu = document.querySelector(".left-menu") as HTMLElement | null;
       const onScroll = () => {
         if (menu) menu.style.top = `${Math.max(0, 63 - window.scrollY)}px`;
       };
       onScroll();
       window.addEventListener("scroll", onScroll);
       return () => window.removeEventListener("scroll", onScroll);
     }, []);


    return (
        <div className="bg-gray-100 min-h-screen ">
            <LeftMenu />
            <div className="ml-[240px] p-6">
                <h2 className="text-3xl font-bold text-purple-700 mb-6">
                    Danh sách người dùng đã xoá
                </h2>
                <div className="bg-white p-4 rounded-lg shadow-md flex flex-wrap items-center gap-4 border border-gray-200 mb-6">
                    <input
                        type="text"
                        className="border border-gray-300 px-3 py-2 rounded w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="🔍 Tìm kiếm theo username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        onClick={handleBulkRestore}
                        disabled={selectedIds.length === 0}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Khôi phục đã chọn ({selectedIds.length})
                    </button>
                </div>
                <div className="bg-white rounded-lg overflow-hidden shadow border border-gray-200">
                    <table className="w-full text-sm">
                        <thead className="bg-purple-50 text-purple-800 text-base">
                            <tr className="text-center">
                                <th className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedIds.length > 0 &&
                                            selectedIds.length === filteredUsers.length
                                        }
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Username</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Deleted At</th>
                                <th className="px-4 py-3">Deleted By</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b hover:bg-gray-50 text-center transition"
                                    >
                                        <td className="px-4 py-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(user.id)}
                                                onChange={() => handleSelectRow(user.id)}
                                            />
                                        </td>
                                        <td className="px-4 py-2">{user.id}</td>
                                        <td className="px-4 py-2 font-medium text-gray-800">{user.username}</td>
                                        <td className="px-4 py-2">
                                            {user.role === "0"
                                                ? "Super Admin"
                                                : user.role === "1"
                                                    ? "Admin"
                                                    : "User"}
                                        </td>
                                        <td className="px-4 py-2">{ "-"}</td>
                                        <td className="px-4 py-2">{"-"}</td>
                                        <td className="px-4 py-2 flex justify-center gap-2">
                                            <button
                                                onClick={() => handleRestore(user.id)}
                                                className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded shadow-sm text-sm"
                                            >
                                                Khôi phục
                                            </button>
                                            <button
                                                onClick={() => handleDeleteForever(user.id)}
                                                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded shadow-sm text-sm"
                                            >
                                                Xoá
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-4 text-gray-500">
                                        Không có tài khoản đã xóa.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
