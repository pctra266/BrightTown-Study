import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserWithFlashcardSets, updateUser } from "./userService";
import Alert from "../Alert";
import { useAuth } from "../../../contexts/AuthContext";

export default function UserEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("2");
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: "success" | "info" | "warning"; message: string } | null>(null);
  const [targetUser, setTargetUser] = useState<any>(null);
  useEffect(() => {
    const loadUser = async () => {
      if (!id || !currentUser) {
        navigate("/admin/users");
        return;
      }
      const { user } = await fetchUserWithFlashcardSets(id);
      if (!user) {
        navigate("/not-found");
        return;
      }
      const isSuperAdmin = currentUser.role === "0";
      const isAdmin = currentUser.role === "1";
      const isEditingSelf = currentUser.id === user.id;

      if (isAdmin && isEditingSelf) {
        navigate("/admin/users");
        return;
      }
      if (isSuperAdmin) {
        setTargetUser(user);
      } else if (isAdmin && user.role === "2") {
        setTargetUser(user);
      } else {
        navigate("/admin/users");
        return;
      }

      setUsername(user.username || "");
      setPassword(user.password || "");
      setRole(user.role);
      setStatus(user.status);
      setLoading(false);
    };
    loadUser();
  }, [id, currentUser, navigate]);

  const isGoogleAccount = !!targetUser?.email && !targetUser?.password;

  const handleUpdate = async () => {
    if (!username.trim()) {
      setAlert({ type: "warning", message: "Username không được để trống." });
      return;
    }

    if (!isGoogleAccount && !password.trim()) {
      setAlert({ type: "warning", message: "Password không được để trống." });
      return;
    }

    const updatedData: any = {
      id: id!,
      username: username.trim(),
      role,
      status
    };

    if (!isGoogleAccount) {
      updatedData.password = password.trim();
    }

    if (targetUser?.email) {
      updatedData.email = targetUser.email;
    }

    const result = await updateUser(updatedData);

    if (result.success) {
      localStorage.setItem(
        "user_update_alert",
        JSON.stringify({
          type: "success",
          message: "User updated successfully!",
        })
      );
      window.location.href = "/admin/users";
    } else {
      setAlert({ type: "warning", message: result.message || "Cập nhật thất bại." });
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const isEditingSelf = currentUser?.id === targetUser?.id;
  const isSuperAdminEditingSelf = isEditingSelf && currentUser?.role === "0";

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded shadow">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="bg-purple-600 text-white text-lg font-semibold p-4 rounded-t">
        Update User
      </div>
      <div className="p-6 space-y-4">
        <div>
          <label className="block mb-1 font-medium">Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border px-3 py-2 rounded bg-blue-50"
            autoComplete="off"
          />
        </div>

        {!isGoogleAccount && (
          <div>
            <label className="block mb-1 font-medium">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded bg-blue-50"
              autoComplete="off"
            />
          </div>
        )}

        <div>
          <label className="block mb-1 font-medium">Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            disabled={isSuperAdminEditingSelf || currentUser?.role === "1" || targetUser?.role === "0"}
          >
            {targetUser?.role === "0" && (
              <option value="0">Super Admin</option>
            )}
            {(currentUser?.role === "0" && targetUser?.role !== "0") && (
              <>
                <option value="1">Admin</option>
                <option value="2">User</option>
              </>
            )}
            {currentUser?.role === "1" && (
              <option value="2">User</option>
            )}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="true"
              checked={status === true}
              onChange={() => setStatus(true)}
              className="w-4 h-4"
            />
            <span className="font-medium">Active</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="false"
              checked={status === false}
              onChange={() => setStatus(false)}
              className="w-4 h-4"
            />
            <span className="font-medium">Inactive</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={() => navigate("/admin/users")}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Update User
          </button>
        </div>
      </div>
    </div>
  );
}