import React, { useEffect, useState } from "react";
import { getAllUsers, restoreUser, deleteUser } from "./Usermanager/userService";
import type { User } from "./Usermanager/userService";
import LeftMenu from "./LeftMenu";
import { useTheme } from "@mui/material/styles";

export default function RecycleBin() {
    const theme = useTheme();
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

    return (
        <div
            style={{
                backgroundColor: theme.palette.background.default,
                minHeight: "100vh"
            }}
        >
            <LeftMenu />
            <div className="ml-[240px] p-6">
                <h2
                    className="text-3xl font-bold mb-6"
                    style={{ color: theme.palette.primary.main }}
                >
                    Danh sách người dùng đã xoá
                </h2>
                <div
                    className="p-4 rounded-lg shadow-md flex flex-wrap items-center gap-4 mb-6"
                    style={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`
                    }}
                >
                    <input
                        type="text"
                        className="px-3 py-2 rounded w-full sm:w-1/3 focus:outline-none focus:ring-2"
                        style={{
                            border: `1px solid ${theme.palette.divider}`,
                            backgroundColor: theme.palette.background.default,
                            color: theme.palette.text.primary,
                            outlineColor: theme.palette.primary.main
                        }}
                        placeholder="🔍 Tìm kiếm theo username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        onClick={handleBulkRestore}
                        disabled={selectedIds.length === 0}
                        className="px-5 py-2 rounded shadow"
                        style={{
                            backgroundColor: selectedIds.length === 0
                                ? theme.palette.action.disabledBackground
                                : theme.palette.success.main,
                            color: theme.palette.success.contrastText,
                            cursor: selectedIds.length === 0 ? "not-allowed" : "pointer"
                        }}
                    >
                        Khôi phục đã chọn ({selectedIds.length})
                    </button>
                </div>
                <div
                    className="rounded-lg overflow-hidden shadow"
                    style={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`
                    }}
                >
                    <table className="w-full text-sm">
                        <thead
                            style={{
                                backgroundColor: theme.palette.action.hover,
                                color: theme.palette.primary.main
                            }}
                        >
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
                                        className="border-b text-center transition"
                                        style={{
                                            borderColor: theme.palette.divider
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.backgroundColor =
                                                theme.palette.action.hover)
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.backgroundColor = "")
                                        }
                                    >
                                        <td className="px-4 py-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(user.id)}
                                                onChange={() => handleSelectRow(user.id)}
                                            />
                                        </td>
                                        <td className="px-4 py-2" style={{ color: theme.palette.text.primary }}>
                                            {user.id}
                                        </td>
                                        <td
                                            className="px-4 py-2 font-medium"
                                            style={{ color: theme.palette.text.primary }}
                                        >
                                            {user.username}
                                        </td>
                                        <td className="px-4 py-2" style={{ color: theme.palette.text.primary }}>
                                            {user.role === "0"
                                                ? "Super Admin"
                                                : user.role === "1"
                                                    ? "Admin"
                                                    : "User"}
                                        </td>
                                        <td className="px-4 py-2" style={{ color: theme.palette.text.secondary }}>
                                            {"-"}
                                        </td>
                                        <td className="px-4 py-2" style={{ color: theme.palette.text.secondary }}>
                                            {"-"}
                                        </td>
                                        <td className="px-4 py-2 flex justify-center gap-2">
                                            <button
                                                onClick={() => handleRestore(user.id)}
                                                className="py-1 px-3 rounded shadow-sm text-sm"
                                                style={{
                                                    backgroundColor: theme.palette.success.main,
                                                    color: theme.palette.success.contrastText
                                                }}
                                            >
                                                Khôi phục
                                            </button>
                                            <button
                                                onClick={() => handleDeleteForever(user.id)}
                                                className="py-1 px-3 rounded shadow-sm text-sm"
                                                style={{
                                                    backgroundColor: theme.palette.error.main,
                                                    color: theme.palette.error.contrastText
                                                }}
                                            >
                                                Xoá
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="text-center py-4"
                                        style={{ color: theme.palette.text.secondary }}
                                    >
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
