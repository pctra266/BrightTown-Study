import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import React from "react";
import { fetchUserWithFlashcardSets } from "./userService";
import type { User, FlashcardSet } from "./userService";
import { useTheme } from "@mui/material/styles";

export default function UserViewer() {
  const { id } = useParams();
  const theme = useTheme();
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.palette.background.default }}
      >
        <div
          style={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
          className="p-6 rounded-lg shadow-lg"
        >
          <p style={{ color: theme.palette.error.main }} className="font-medium">
            User not found.
          </p>
          <Link
            to="/manageuser"
            style={{ color: theme.palette.primary.main }}
            className="mt-4 inline-block hover:underline"
          >
            ← Back to User List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: theme.palette.background.default }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div
          style={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          }}
          className="rounded-t-lg p-5 shadow-md"
        >
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

        {/* User Info */}
        <div
          style={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
          className="rounded-b-lg shadow-md p-6 mb-6"
        >
          <div className="grid gap-4">
            <div className="flex">
              <span className="w-25 text-gray-500 font-medium">Username:</span>
              <span className="font-semibold">{user.username}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-500 font-medium">Status:</span>
              <span
                className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: user.status
                    ? theme.palette.success.light
                    : theme.palette.error.light,
                  color: user.status
                    ? theme.palette.success.contrastText
                    : theme.palette.error.contrastText,
                }}
              >
                {user.status ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-500 font-medium">Role:</span>
              <span
                className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor:
                    user.role === "1"
                      ? theme.palette.error.light
                      : theme.palette.grey[300],
                  color:
                    user.role === "1"
                      ? theme.palette.error.contrastText
                      : theme.palette.text.primary,
                }}
              >
                {user.role === "1" ? "Admin" : "User"}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/admin/users"
              style={{
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.primary.main,
              }}
              className="inline-flex items-center px-4 py-2 rounded-lg transition"
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
        <div
          style={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          }}
          className="rounded-lg shadow-md p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-6 h-6"
              style={{ color: theme.palette.primary.main }}
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
            <h3 className="text-lg font-semibold">Flashcard Sets</h3>
          </div>

          {flashcardSets.length > 0 ? (
            <div className="overflow-x-auto">
              <table
                className="min-w-full divide-y"
                style={{
                  borderColor: theme.palette.divider,
                }}
              >
                <thead
                  style={{
                    backgroundColor: theme.palette.action.hover,
                    color: theme.palette.text.secondary,
                  }}
                >
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium">
                      Description
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium">
                      Questions
                    </th>
                    <th className="px-4 py-2 text-center text-sm font-medium">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {flashcardSets.map((set) => (
                    <tr
                      key={set.id}
                      style={{
                        borderColor: theme.palette.divider,
                      }}
                      className="hover:opacity-80"
                    >
                      <td className="px-4 py-2">{set.id}</td>
                      <td className="px-4 py-2">{set.name}</td>
                      <td className="px-4 py-2">{set.description}</td>
                      <td className="px-4 py-2">
                        <span
                          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: theme.palette.primary.light,
                            color: theme.palette.primary.contrastText,
                          }}
                        >
                          {set.flashcards.length}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Link
                          to={`/library/flashcard/${set.id}/play`}
                          state={{ from: "userviewer", userId: user.id }}
                          style={{
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                          }}
                          className="inline-flex items-center px-4 py-1.5 text-sm font-medium rounded-md hover:opacity-90 transition"
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
            <div
              className="text-center py-4"
              style={{ color: theme.palette.text.secondary }}
            >
              No flashcard sets found for this user.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
