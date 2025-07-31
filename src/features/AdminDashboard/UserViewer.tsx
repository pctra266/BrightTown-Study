import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import React from "react";
import { fetchUserWithFlashcardSets } from "./userService"; 

import type { User, FlashcardSet } from "./userService"; 

export default function UserViewer() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        const { user, flashcardSets } = await fetchUserWithFlashcardSets(id);
        setUser(user);
        setFlashcardSets(flashcardSets);
      } catch (error) {
        console.error("Error fetching user and flashcard sets:", error);
      }
    };

    fetchData();
  }, [id]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-red-600 font-medium">User not found.</p>
          <Link
            to="/manageuser"
            className="mt-4 inline-block text-purple-600 hover:underline"
          >
            ← Back to User List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-purple-600 text-white rounded-t-lg p-5 shadow-md">
          <div className="flex items-center gap-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h2 className="text-xl font-semibold">User Profile</h2>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-b-lg shadow-md p-6 mb-6">
          <div className="grid gap-4">
            <div className="flex">
              <span className="w-25 text-gray-500 font-medium">Username:</span>
              <span className="text-gray-900 font-semibold">{user.username}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-500 font-medium">Status:</span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  user.status
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {user.status ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-500 font-medium">Role:</span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  user.role === "1"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {user.role === "1" ? "Admin" : "User"}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/manageuser"
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-purple-600 hover:bg-gray-200 rounded-lg transition"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to User List
            </Link>
          </div>
        </div>

        {/* Flashcard Sets */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.747 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Flashcard Sets</h3>
          </div>

          {flashcardSets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">ID</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Description</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Questions</th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {flashcardSets.map((set) => (
                    <tr key={set.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{set.id}</td>
                      <td className="px-4 py-2">{set.name}</td>
                      <td className="px-4 py-2">{set.description}</td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                          {set.flashcards.length}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Link
                          to={`/flashcard/${set.id}`}
                          className="inline-flex items-center px-4 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No flashcard sets found for this user.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
