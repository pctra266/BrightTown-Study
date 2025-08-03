import { useEffect, useState, useRef } from "react";
import React from "react";
import LeftMenu from "./LeftMenu";
import { Link } from "react-router-dom";
import {
  fetchUsersAndFlashcards, deleteUser
} from "./userService";
import type {
  User,
  FlashcardMap
} from "./userService";
import Alert from "./Alert";
export default function ManagerUser() {
  const [users, setUsers] = useState<User[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardMap>({});
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchUsername, setSearchUsername] = useState<string>("");
  const loadCount = useRef(0);

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
      try {
        const { users, flashcards } = await fetchUsersAndFlashcards();
        setUsers(users);
        setFlashcards(flashcards);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };

    fetchData();
  }, []);

  const toggleExpand = (id: string) => {
    const s = new Set(expanded);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpanded(s);
  };

  const filtered = users.filter(
    (u) =>
      (filterRole === "all" || u.role === filterRole) &&
      (filterStatus === "all" || String(u.status) === filterStatus) &&
      (searchUsername.trim() === "" ||
        u.username.toLowerCase().includes(searchUsername.toLowerCase()))
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
          <Link to={`/adduser`}>
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
          <label style={{ marginLeft: '30px' }} className="mr-4 font-semibold">Search:</label>
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
              <th className="px-4 py-2 text-left w-1/10">ID</th>
              <th className="px-4 py-2 text-left w-1/6">Username</th>
              <th className="px-4 py-2 text-left w-1/6">Role</th>
              <th className="px-4 py-2 text-left w-1/6">Status</th>
              <th className="px-4 py-2 text-left w-1/4" style={{ paddingLeft: "70px", width: "250px" }}>
                Actions
              </th>
              <th className="px-4 py-2 text-center ">Flashcards</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <React.Fragment key={user.id}>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{user.id}</td>
                  <td className="px-4 py-2">{user.username}</td>
                  <td className="px-4 py-2">{user.role === "1" ? "Admin" : "User"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        user.status
                          ? "bg-green-100 text-green-700 px-2 py-1 rounded text-sm"
                          : "bg-red-100 text-red-700 px-2 py-1 rounded text-sm"
                      }
                    >
                      {user.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <Link to={`/userdetail/${user.id}`}>
                      <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-sm">
                        View
                      </button>
                    </Link>
                    {user.role === "2" ? (
                      <>
                        <Link to={`/useredit/${user.id}`}>
                          <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm">
                            Edit
                          </button>
                        </Link>
                        <button
                          type="button"
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          onClick={() => setConfirmDeleteId(user.id)}
                        >
                          Delete
                        </button>
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

                  <td className="px-4 py-2 text-center" style={{ paddingLeft: "20px" }}>
                    <button
                      onClick={() => toggleExpand(user.id)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {expanded.has(user.id) ? "Hide" : "Show"}
                    </button>
                  </td>
                </tr>
                {expanded.has(user.id) && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="px-4 py-2">
                      {flashcards[user.id]?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {flashcards[user.id].map((title, i) => (
                            <span
                              key={i}
                              className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium shadow"
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
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center">
            <p className="text-lg font-semibold mb-4">
              Are you sure you want to delete this user?
            </p>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{ backgroundColor: 'red', color: 'white', padding: '0 15px', borderRadius: '5px' }}
                onClick={async () => {
                  const id = confirmDeleteId;
                  setConfirmDeleteId(null);
                  const result = await deleteUser(id);
                  if (result.success) {
                    setUsers((prev) => prev.filter((u) => u.id !== id));
                    setExpanded((prev) => {
                      const s = new Set(prev);
                      s.delete(id);
                      return s;
                    });
                    // setAlert({ type: "success", message: "User deleted successfully!" });
                  } else {
                    // setAlert({ type: "warning", message: result.message || "Failed to delete user." });
                  }
                  // setTimeout(() => setAlert(null), 3000);
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
