import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { addUser } from "./userService";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Alert from "./Alert";

const UserCreate = () => {
    type Role = {
        id: string;
        role: string;
    };

    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [selectedRole, setSelectedRole] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [alert, setAlert] = useState<{ type: "success" | "info" | "warning"; message: string } | null>(null);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch("http://localhost:9000/role");
                const data = await response.json();
                setRoles(data);
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        };
        fetchRoles();
    }, []);

    useEffect(() => {
        if (roles.length > 0) {
            setSelectedRole(roles[0].id);
        }
    }, [roles]);

    const handleAddUser = async () => {
        const username = usernameRef.current?.value || "";
        const password = passwordRef.current?.value || "";

        const newUser = {
            username,
            password,
            role: selectedRole,
            status: true,
        };

        const result = await addUser(newUser);
        if (result.success) {
            localStorage.setItem("user_create_alert", JSON.stringify({
                type: "success",
                message: "User added successfully!",
            }));
            window.location.href = "/manageuser";
        } else {
            setAlert({ type: "warning", message: result.message || "Failed to add user." });
            setTimeout(() => {
                setAlert(null);
            }, 3000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
            <div className="max-w-md mx-auto">
                <div className="bg-purple-600 text-white rounded-t-lg p-4 mb-4 shadow-md">
                    <h2 className="text-xl font-semibold">Add new User</h2>
                </div>
                <div className="bg-white rounded-b-lg shadow-md p-6 space-y-4">
                    <div>
                        <label className="text-sm text-gray-500">Username:</label>
                        <input
                            autoComplete="off"
                            type="text"
                            className="w-full mt-1 p-2 border rounded-lg"
                            placeholder="username"
                            ref={usernameRef}
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Password:</label>
                        <div className="relative">
                            <input
                                autoComplete="off"
                                type={showPassword ? "text" : "password"}
                                className="w-full mt-1 p-2 border rounded-lg pr-10"
                                placeholder="password"
                                ref={passwordRef}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-purple-600"
                            >
                                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Role:</label>
                        <select
                            className="w-full mt-1 p-2 border rounded-lg"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.role}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <Link to={'/manageuser'}>
                            <button className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">
                                Cancel
                            </button>
                        </Link>
                        <button
                            onClick={handleAddUser}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            Add User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserCreate;
