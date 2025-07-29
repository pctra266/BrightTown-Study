import { useEffect, useState } from "react";
import LeftMenu from './LeftMenu.jsx';
// Dummy flashcards per user
const flashcardsData: { [key: string]: string[] } = {
  "1": ["Admin Card 1", "Admin Card 2"],
  "2": ["User 1 Card A", "User 1 Card B"],
  "3": ["User 2 Card A"],
  "4": ["User 3 Card A", "User 3 Card B", "User 3 Card C"],
  "5": ["Admin 2 Card A"],
  "6": ["Bubu's Card"]
};

type User = {
  id: string;
  username: string;
  password: string;
  role: string;
};

const initialUsers: User[] = [
  { id: "1", username: "bernie", password: "123456", role: "1" },
  { id: "2", username: "truong", password: "123456", role: "2" },
  { id: "3", username: "tqt", password: "123456", role: "2" },
  { id: "4", username: "pctra266", password: "pctra266", role: "2" },
  { id: "5", username: "trapham266", password: "trapham266", role: "1" },
  { id: "6", username: "bubucon", password: "123456", role: "2" },
];

export default function ManagerUser() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const handleRoleChange = (id: string, newRole: string) => {
    const updated = users.map((user) =>
      user.id === id ? { ...user, role: newRole } : user
    );
    setUsers(updated);
  };

  const toggleFlashcards = (userId: string) => {
    const updatedSet = new Set(expandedUsers);
    if (updatedSet.has(userId)) {
      updatedSet.delete(userId);
    } else {
      updatedSet.add(userId);
    }
    setExpandedUsers(updatedSet);
  };

  const filteredUsers = users.filter((user) =>
    filterRole === "all" ? true : user.role === filterRole
  );

  // Optional: handle scroll top position for fixed menu
  useEffect(() => {
    const menu = document.querySelector('.left-menu') as HTMLElement;
    const handleScroll = () => {
      const offset = Math.max(0, 63 - window.scrollY);
      if (menu) menu.style.top = `${offset}px`;
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex">
     <LeftMenu/>

      {/* Main Content */}
      <div className="ml-[240px] p-4 w-full max-w-6xl">
        <h2 className="text-2xl font-bold mb-4">User Manager</h2>

        <div className="mb-4 flex items-center gap-4">
          <label className="font-semibold">Filter by Role:</label>
          <select
            className="border rounded px-3 py-1"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All</option>
            <option value="1">Admin</option>
            <option value="2">User</option>
          </select>
        </div>

        <table className="w-full border border-gray-300 mb-8">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">ID</th>
              <th className="border px-3 py-2">Username</th>
              <th className="border px-3 py-2">Password</th>
              <th className="border px-3 py-2">Role</th>
              <th className="border px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <>
                <tr key={user.id} className="text-center">
                  <td className="border px-3 py-2">{user.id}</td>
                  <td className="border px-3 py-2">{user.username}</td>
                  <td className="border px-3 py-2">{user.password}</td>
                  <td className="border px-3 py-2">
                    <select
                      className="border rounded px-2 py-1"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="1">Admin</option>
                      <option value="2">User</option>
                    </select>
                  </td>
                  <td className="border px-3 py-2">
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => toggleFlashcards(user.id)}
                    >
                      {expandedUsers.has(user.id) ? "Hide" : "Show"} Flashcards
                    </button>
                  </td>
                </tr>
                {expandedUsers.has(user.id) && (
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="px-4 py-2 text-left">
                      <ul className="list-disc pl-6">
                        {flashcardsData[user.id]?.map((card, i) => (
                          <li key={i}>{card}</li>
                        )) || <li>No flashcards</li>}
                      </ul>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
