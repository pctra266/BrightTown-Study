import { useEffect, useState } from "react";
import LeftMenu from "./LeftMenu";
import React from "react";

type User = {
  id: string;
  username: string;
  password: string;
  role: string;
  status: boolean;
};


export default function ManagerUser() {
  const [users, setUsers] = useState<User[]>([]);
  const [flashcards, setFlashcards] = useState<{ [key: string]: string[] }>({});
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch("http://localhost:9000/account");
        const userData: User[] = await userRes.json();
        setUsers(userData);
        const flashRes = await fetch("http://localhost:9000/flashcardSets");
        const flashcardSets = await flashRes.json();
        const userFlashcards: { [key: string]: string[] } = {};
        flashcardSets.forEach((set: any) => {
          const uid = set.userId;
          const title = set.name || "Untitled";
          if (!userFlashcards[uid]) {
            userFlashcards[uid] = [title];
          } else {
            userFlashcards[uid].push(title);
          }
        });

        setFlashcards(userFlashcards);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };

    fetchData();
  }, []);


  const toggleExpand = (id: string) => {
    const s = new Set(expanded);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setExpanded(s);
  };

  const filtered = users.filter(
    (u) =>
      (filterRole === "all" || u.role === filterRole) &&
      (filterStatus === "all" || String(u.status) === filterStatus)
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
      <LeftMenu />

      <div className="ml-[240px] p-6 w-full ">
        <div className="flex justify-between mb-4">
          <h2 className="text-3xl font-bold text-purple-700">User List</h2>
          <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            + Add User
          </button>
        </div>

        <div className="bg-white p-4 rounded mb-6 shadow">
          <label className="mr-4 font-semibold">Role:</label>
          <select
            className="border px-2 py-1 rounded mr-6"
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
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
        </div>

        <table className="w-full bg-white rounded-lg overflow-hidden shadow">
          <thead className="bg-purple-50 text-purple-800">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Username</th>
              <th className="px-4 py-2 text-left">Password</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left" style={{ paddingLeft: '70px', width: '250px' }}>Actions</th>
              <th className="px-4 py-2 text-left">Flashcards</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(user => (
              <React.Fragment key={user.id}>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{user.id}</td>
                  <td className="px-4 py-2">{user.username}</td>
                  <td className="px-4 py-2">{user.password}</td>
                  <td className="px-4 py-2">{user.role === "1" ? "Admin" : "User"}</td>
                  <td className="px-4 py-2">
                    <span className={user.status ? "bg-green-100 text-green-700 px-2 py-1 rounded text-sm"
                      : "bg-red-100 text-red-700 px-2 py-1 rounded text-sm"}>
                      {user.status ? "Active" : "Inactive"}
                    </span>
                  </td>


                  <td className="px-4 py-2 space-x-2">
                    <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-sm">
                      View
                    </button>
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm">
                      Edit
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      onClick={() => {
                        if (confirm("Delete this user?")) {
                          setUsers(users.filter(u => u.id !== user.id));
                          setExpanded(prev => {
                            const s = new Set(prev);
                            s.delete(user.id);
                            return s;
                          });
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                  <td className="px-4 py-2" style={{ paddingLeft: '40px' }}>
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
                    <td colSpan={7} className="px-6 py-2">
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
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
