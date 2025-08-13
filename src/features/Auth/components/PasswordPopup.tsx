// PasswordPopup.tsx
import React, { useState } from "react";

interface PasswordPopupProps {
  photoURL: string;
  resolve: (password: string | null) => void; // callback to return password
}

const PasswordPopup: React.FC<PasswordPopupProps> = ({ photoURL, resolve }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    resolve(password); // return password
  };

  const handleCancel = () => resolve(null);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <div className="flex flex-col items-center mb-4">
          <img
            src={photoURL}
            alt="Google Profile"
            className="w-20 h-20 rounded-full border-4 border-blue-500"
          />
          <h2 className="text-xl font-bold text-blue-700 mt-2">
            Set Your Password
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Enter password"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm password"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordPopup;
