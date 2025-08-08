import { UserProfileData, UserActivityData } from './types';

const API_BASE = 'http://localhost:9000';

export const fetchUserProfile = async (userId: string): Promise<UserProfileData> => {
  try {
    // Fetch user data
    const userResponse = await fetch(`${API_BASE}/account`);
    const users = await userResponse.json();
    const user = users.find((u: any) => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Count user's flashcard sets
    const flashcardResponse = await fetch(`${API_BASE}/flashcardSets`);
    const flashcardSets = await flashcardResponse.json();
    const userFlashcardSets = flashcardSets.filter((set: any) => set.userId === userId);

    // Count user's discussions
    const discussionResponse = await fetch(`${API_BASE}/discussions`);
    const discussions = await discussionResponse.json();
    const userDiscussions = discussions.filter((d: any) => d.authorId === userId);

    // Count user's books
    const booksResponse = await fetch(`${API_BASE}/books`);
    const books = await booksResponse.json();
    const userBooks = books.filter((b: any) => b.userId === userId);

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
      flashcardSetsCount: userFlashcardSets.length,
      discussionsCount: userDiscussions.length,
      booksCount: userBooks.length,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const fetchUserActivity = async (userId: string): Promise<UserActivityData> => {
  try {
    // Fetch user's flashcard sets
    const flashcardResponse = await fetch(`${API_BASE}/flashcardSets`);
    const allFlashcardSets = await flashcardResponse.json();
    const flashcardSets = allFlashcardSets.filter((set: any) => set.userId === userId);

    // Fetch user's discussions
    const discussionResponse = await fetch(`${API_BASE}/discussions`);
    const allDiscussions = await discussionResponse.json();
    const discussions = allDiscussions.filter((d: any) => d.authorId === userId);

    // Fetch user's books
    const booksResponse = await fetch(`${API_BASE}/books`);
    const allBooks = await booksResponse.json();
    const books = allBooks.filter((b: any) => b.userId === userId);

    return {
      flashcardSets: flashcardSets.map((set: any) => ({
        id: set.id,
        name: set.name,
        description: set.description,
        flashcards: set.flashcards || [],
      })),
      discussions: discussions.map((d: any) => ({
        id: d.id,
        title: d.title,
        content: d.content,
        createdAt: d.createdAt,
        upvotes: d.upvotes || 0,
        downvotes: d.downvotes || 0,
        views: d.views || 0,
      })),
      books: books.map((b: any) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        status: b.status,
      })),
    };
  } catch (error) {
    console.error('Error fetching user activity:', error);
    throw error;
  }
};

export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case '0':
      return 'Super Admin';
    case '1':
      return 'Admin';
    case '2':
      return 'User';
    default:
      return role;
  }
};