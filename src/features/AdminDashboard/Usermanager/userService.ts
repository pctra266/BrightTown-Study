export type User = {
  id: string;
  username: string;
  password: string;
  role: string;
  status: boolean | null;
};

export type FlashcardMap = {
  [key: string]: string[];
};

export type Flashcard = {
  id: string;
  question: string;
  answer: string;
  image: { id: string; url: string; alt: string } | null;
};

export type FlashcardSet = {
  id: string;
  name: string;
  description: string;
  userId: string;
  flashcards: Flashcard[];
};

export const fetchUsersAndFlashcards = async (): Promise<{
  users: User[];
  flashcards: FlashcardMap;
}> => {
  const userRes = await fetch("http://localhost:9000/account");
  const users: User[] = await userRes.json();

  const flashRes = await fetch("http://localhost:9000/flashcardSets");
  const flashcardSets = await flashRes.json();

  const flashcards: FlashcardMap = {};
  flashcardSets.forEach((set: any) => {
    const uid = set.userId;
    const title = set.name || "Untitled";
    if (!flashcards[uid]) {
      flashcards[uid] = [title];
    } else {
      flashcards[uid].push(title);
    }
  });

  return { users, flashcards };
};

export const fetchUserWithFlashcardSets = async (
  id: string
): Promise<{
  user: User | null;
  flashcardSets: FlashcardSet[];
}> => {
  const userRes = await fetch("http://localhost:9000/account");
  const allUsers: User[] = await userRes.json();
  const user = allUsers.find((u) => u.id === id) || null;

  const flashRes = await fetch("http://localhost:9000/flashcardSets");
  const allSets: FlashcardSet[] = await flashRes.json();
  const flashcardSets = allSets.filter((s) => s.userId === id);

  return { user, flashcardSets };
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch("http://localhost:9000/account");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const addUser = async (
  newUser: Omit<User, "id">
): Promise<{ success: boolean; message?: string }> => {
  try {
    const users = await getAllUsers();
    const isUsernameTaken = users.some(
      (user) => user.username.toLowerCase() === newUser.username.toLowerCase()
    );
    if (isUsernameTaken) {
      return { success: false, message: "Username đã tồn tại!" };
    }
    const flashRes = await fetch("http://localhost:9000/flashcardSets");
    const flashcardSets: FlashcardSet[] = await flashRes.json();
    const numericIds: number[] = [];
    users.forEach((user) => {
      const idNum = parseInt(user.id, 10);
      if (!isNaN(idNum)) numericIds.push(idNum);
    });
    flashcardSets.forEach((set) => {
      const idNum = parseInt(set.userId, 10);
      if (!isNaN(idNum)) numericIds.push(idNum);
    });
    const lastId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
    const newId = (lastId + 1).toString();
    const response = await fetch("http://localhost:9000/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: newId, ...newUser }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, message: "Lỗi server khi thêm user." };
    }
  } catch (error) {
    console.error("Error adding user:", error);
    return { success: false, message: "Lỗi kết nối hoặc server." };
  }
};

export const softDeleteUser = async (id: string) => {
  try {
    const response = await fetch(`http://localhost:9000/account/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: null }),
    });

    if (!response.ok) {
      throw new Error("Failed to soft delete user");
    }
    return { success: true };
  } catch (error) {
    console.error("Error soft deleting user");
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, message: errorMessage };
  }
};

export const deleteUser = async (id: string) => {
  try {
    const response = await fetch(`http://localhost:9000/account/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting user");
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, message: errorMessage };
  }
};

export const restoreUser = async (id: string) => {
  try {
    const response = await fetch(`http://localhost:9000/account/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: true }),
    });

    if (!response.ok) {
      throw new Error("Failed to restore user");
    }

    return { success: true };
  } catch (error) {
    console.error("Error restoring user");
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, message: errorMessage };
  }
};

export const updateUser = async (
  updatedUser: User
): Promise<{ success: boolean; message?: string }> => {
  try {
    const users = await getAllUsers();
    const isUsernameTaken = users.some(
      (user) =>
        user.username.toLowerCase() === updatedUser.username.toLowerCase() &&
        user.id !== updatedUser.id
    );
    if (isUsernameTaken) {
      return { success: false, message: "Username đã tồn tại!" };
    }

    const response = await fetch(
      `http://localhost:9000/account/${updatedUser.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      }
    );

    return response.ok
      ? { success: true }
      : { success: false, message: "Lỗi server khi cập nhật user." };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, message: "Lỗi kết nối hoặc server." };
  }
};
