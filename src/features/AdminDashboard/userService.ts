export type User = {
  id: string;
  username: string;
  password: string;
  role: string;
  status: boolean;
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

export const fetchUserWithFlashcardSets = async (id: string): Promise<{
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
