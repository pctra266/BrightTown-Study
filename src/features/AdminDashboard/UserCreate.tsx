import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";


const UserCreate = () => {
    type Role = {
        id: string;
        role: string;
    };
    const [showPassword, setShowPassword] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);

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

    const defaultRole = roles.length > 0 ? roles[0].role : "";
    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="bg-purple-600 text-white rounded-t-lg p-4 mb-4 shadow-md">
                    <h2 className="text-xl font-semibold">Add new User</h2>
                </div>
                <div className="bg-white rounded-b-lg shadow-md p-6 space-y-4">
                    <div>
                        <label className="text-sm text-gray-500">Username:</label>
                        <input
                            type="text"
                            className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                            placeholder="username"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Password:</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 pr-10"
                                placeholder="password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-purple-600"
                            >
                                {!showPassword ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.03-10-9s4.477-9 10-9a10.05 10.05 0 011.875.175M19.428 15.341A8.966 8.966 0 0021 10c0-4.97-4.03-9-9-9S3 5.03 3 10c0 2.256.832 4.323 2.214 5.909"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-500">Role:</label>
                        <select
                            className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                            defaultValue={defaultRole} 
                        >
                            {roles.map((role) => (
                                <option key={role.id} value={role.role}>
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
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                            Add User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserCreate;
