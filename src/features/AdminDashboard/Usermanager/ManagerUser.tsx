import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LeftMenu from "../LeftMenu";
import Alert from "../Alert";
import { fetchUsersAndFlashcards, softDeleteUser } from "./userService";
import type { User, FlashcardMap } from "./userService";
import { useAuth } from "../../../contexts/AuthContext";
import Pagination from "../Pagination"; 

export default function ManagerUser() {
  const [users, setUsers] = useState<User[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardMap>({});
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchUsername, setSearchUsername] = useState<string>("");

  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const storedCreateAlert = localStorage.getItem("user_create_alert");
    const storedUpdateAlert = localStorage.getItem("user_update_alert");

    if (storedCreateAlert) {
      setAlert(JSON.parse(storedCreateAlert));
      localStorage.removeItem("user_create_alert");
      setTimeout(() => setAlert(null), 3000);
    } else if (storedUpdateAlert) {
      setAlert(JSON.parse(storedUpdateAlert));
      localStorage.removeItem("user_update_alert");
      setTimeout(() => setAlert(null), 3000);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { users, flashcards } = await fetchUsersAndFlashcards();
      setUsers(users);
      setFlashcards(flashcards);
    };
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterRole, filterStatus, searchUsername]);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const filteredUsers = users
    .filter((u) => u.status !== null) 
    .filter((u) => {
      const matchRole = filterRole === "all" || u.role === filterRole;
      const matchStatus = filterStatus === "all" || String(u.status) === filterStatus;
      const matchSearch =
        searchUsername.trim() === "" || u.username.toLowerCase().includes(searchUsername.toLowerCase());

      if (user?.role === "1" && u.role === "0") {
        return false;
      }

      return matchRole && matchStatus && matchSearch;
    });


  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const canEditOrDelete = (targetUser: User) => {
    if (user?.role === "0") return true;
    if (user?.role === "1" && targetUser.role === "2") return true;
    return false;
  };

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
    <div className="flex bg-gray-100 min-h-screen">
      {alert && (
        <Alert
          type={alert.type as "success" | "info" | "warning"}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <LeftMenu />
      <div className="ml-[240px] p-6 w-full">
        <div className="flex justify-between mb-4">
          <h2 className="text-3xl font-bold text-purple-700">User List</h2>
          <Link to="/admin/users/create">
            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              + Add User
            </button>
          </Link>
        </div>

        <div className="bg-white p-4 rounded mb-6 shadow">
          <label className="mr-4 font-semibold">Role:</label>
          <select
            className="border px-2 py-1 rounded mr-6"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All</option>
            <option value="1">Admin</option>
            <option value="2">User</option>
          </select>

          <label className="mr-4 font-semibold">Status:</label>
          <select
            className="border px-2 py-1 rounded"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <label className="ml-8 mr-4 font-semibold">Search:</label>
          <input
            type="text"
            placeholder="Search username"
            className="border px-2 py-1 rounded"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
          />
        </div>

        <table className="w-full bg-white rounded-lg overflow-hidden shadow">
          <thead className="bg-purple-50 text-purple-800">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Username</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
              <th className="px-4 py-2 text-center">Flashcards</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((userItem) => (
                <React.Fragment key={userItem.id}>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{userItem.id}</td>
                    <td className="px-4 py-2">{userItem.username}</td>
                    <td className="px-4 py-2">
                      {userItem.role === "0" ? "Super Admin" : userItem.role === "1" ? "Admin" : "User"}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-sm ${userItem.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                      >
                        {userItem.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <Link to={`/admin/users/${userItem.id}`}>
                        <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-sm">
                          View
                        </button>
                      </Link>
                      {canEditOrDelete(userItem) ? (
                        <>
                          <Link to={`/admin/users/${userItem.id}/edit`}>
                            <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm">
                              Edit
                            </button>
                          </Link>
                          {user?.id === userItem.id && user?.role === "0" ? (
                            <button
                              className="bg-gray-400 text-white px-3 py-1 rounded text-sm cursor-not-allowed"
                              disabled
                            >
                              Delete
                            </button>
                          ) : (
                            <button
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                              onClick={() => setConfirmDeleteId(userItem.id)}
                            >
                              Delete
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            className="bg-gray-400 text-white px-3 py-1 rounded text-sm cursor-not-allowed"
                            disabled
                          >
                            Edit
                          </button>
                          <button
                            className="bg-gray-400 text-white px-3 py-1 rounded text-sm cursor-not-allowed"
                            disabled
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => toggleExpand(userItem.id)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {expanded.has(userItem.id) ? "Hide" : "Show"}
                      </button>
                    </td>
                  </tr>
                  {expanded.has(userItem.id) && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="px-4 py-2">
                        {flashcards[userItem.id]?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {flashcards[userItem.id].map((title, index) => (
                              <span
                                key={index}
                                className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                              >
                                {title}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No flashcard sets</p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center">
            <p className="text-lg font-semibold mb-4">Are you sure you want to delete this user?</p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                onClick={async () => {
                  const id = confirmDeleteId;
                  setConfirmDeleteId(null);
                  const result = await softDeleteUser(id);
                  if (result.success) {
                    setUsers((prev) =>
                      prev.map((u) =>
                        u.id === id ? { ...u, status: null } : u
                      )
                    );
                    setExpanded((prev) => {
                      const newExpanded = new Set(prev);
                      newExpanded.delete(id);
                      return newExpanded;
                    });
                  } else {
                    setAlert({ type: "warning", message: result.message || "Failed to delete" });
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
