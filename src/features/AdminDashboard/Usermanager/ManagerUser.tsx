import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LeftMenu from "../LeftMenu";
import Alert from "../Alert";
import { fetchUsersAndFlashcards, softDeleteUser } from "./userService";
import type { User, FlashcardMap } from "./userService";
import { useAuth } from "../../../contexts/AuthContext";
import Pagination from "../Pagination";
import { useTheme } from "@mui/material/styles";

export default function ManagerUser() {
  const theme = useTheme();
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

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}
    >
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
          <h2 style={{ color: theme.palette.primary.main }} className="text-3xl font-bold">
            User List
          </h2>
          <Link to="/admin/users/create">
            <button
              style={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              }}
              className="px-4 py-2 rounded hover:opacity-90"
            >
              + Add User
            </button>
          </Link>
        </div>

        <div
          className="p-4 rounded mb-6 shadow"
          style={{ backgroundColor: theme.palette.background.paper }}
        >
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

        <table
          className="w-full rounded-lg overflow-hidden shadow"
          style={{ backgroundColor: theme.palette.background.paper }}
        >
          <thead style={{ backgroundColor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}>
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Username</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left" style={{width: '300px', paddingLeft:'70px'}}>Actions</th>
              <th className="px-4 py-2 text-left">Flashcards</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((userItem) => (
                <React.Fragment key={userItem.id}>
                  <tr
                    className="border-b"
                    style={{
                      borderColor: theme.palette.divider,
                    }}
                  >
                    <td className="px-4 py-2">{userItem.id}</td>
                    <td className="px-4 py-2">{userItem.username}</td>
                    <td className="px-4 py-2">
                      {userItem.role === "0" ? "Super Admin" : userItem.role === "1" ? "Admin" : "User"}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className="px-2 py-1 rounded text-sm"
                        style={{
                          backgroundColor: userItem.status
                            ? theme.palette.success.light
                            : theme.palette.error.light,
                          color: userItem.status
                            ? theme.palette.success.contrastText
                            : theme.palette.error.contrastText,
                        }}
                      >
                        {userItem.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <Link to={`/admin/users/${userItem.id}`}>
                        <button
                          style={{
                            backgroundColor: theme.palette.info.main,
                            color: theme.palette.info.contrastText,
                          }}
                          className="px-3 py-1 rounded text-sm hover:opacity-90"
                        >
                          View
                        </button>
                      </Link>
                      {canEditOrDelete(userItem) ? (
                        <>
                          <Link to={`/admin/users/${userItem.id}/edit`}>
                            <button
                              style={{
                                backgroundColor: theme.palette.warning.main,
                                color: theme.palette.warning.contrastText,
                              }}
                              className="px-3 py-1 rounded text-sm hover:opacity-90"
                            >
                              Edit
                            </button>
                          </Link>
                          {user?.id === userItem.id && user?.role === "0" ? (
                            <button
                              style={{
                                backgroundColor: theme.palette.grey[400],
                                color: theme.palette.text.primary,
                              }}
                              className="px-3 py-1 rounded text-sm cursor-not-allowed"
                              disabled
                            >
                              Delete
                            </button>
                          ) : (
                            <button
                              style={{
                                backgroundColor: theme.palette.error.main,
                                color: theme.palette.error.contrastText,
                              }}
                              className="px-3 py-1 rounded text-sm hover:opacity-90"
                              onClick={() => setConfirmDeleteId(userItem.id)}
                            >
                              Delete
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            style={{
                              backgroundColor: theme.palette.grey[400],
                              color: theme.palette.text.primary,
                            }}
                            className="px-3 py-1 rounded text-sm cursor-not-allowed"
                            disabled
                          >
                            Edit
                          </button>
                          <button
                            style={{
                              backgroundColor: theme.palette.grey[400],
                              color: theme.palette.text.primary,
                            }}
                            className="px-3 py-1 rounded text-sm cursor-not-allowed"
                            disabled
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-2 text-left" style={{paddingLeft: '40px'}}>
                      <button
                        onClick={() => toggleExpand(userItem.id)}
                        style={{ color: theme.palette.info.main }}
                        className="text-sm hover:underline"
                      >
                        {expanded.has(userItem.id) ? "Hide" : "Show"}
                      </button>
                    </td>
                  </tr>
                  {expanded.has(userItem.id) && (
                    <tr style={{ backgroundColor: theme.palette.action.hover }}>
                      <td colSpan={6} className="px-4 py-2">
                        {flashcards[userItem.id]?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {flashcards[userItem.id].map((title, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 rounded-full text-sm"
                                style={{
                                  backgroundColor: theme.palette.primary.light,
                                  color: theme.palette.primary.contrastText,
                                }}
                              >
                                {title}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm" style={{ color: theme.palette.text.secondary }}>
                            No flashcard sets
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-4"
                  style={{ color: theme.palette.text.secondary }}
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
          <div
            className="p-6 rounded-lg shadow-md w-full max-w-sm text-center"
            style={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}
          >
            <p className="text-lg font-semibold mb-4">
              Are you sure you want to delete this user?
            </p>
            <div className="flex justify-center gap-4">
              <button
                style={{
                  backgroundColor: theme.palette.grey[300],
                  color: theme.palette.text.primary,
                }}
                className="px-4 py-2 rounded hover:opacity-90"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
              <button
                style={{
                  backgroundColor: theme.palette.error.main,
                  color: theme.palette.error.contrastText,
                }}
                className="px-4 py-2 rounded hover:opacity-90"
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
