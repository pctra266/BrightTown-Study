export interface UserProfileData {
  id: string;
  username: string;
  role: string;
  status: boolean;
  flashcardSetsCount: number;
  discussionsCount: number;
  booksCount: number;
  joinedDate?: string;
}

export interface UserActivityData {
  flashcardSets: Array<{
    id: string;
    name: string;
    description: string;
    flashcards: Array<{
      id: string;
      question: string;
      answer: string;
    }>;
  }>;
  discussions: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
    upvotes: number;
    downvotes: number;
    views: number;
  }>;
  books: Array<{
    id: string;
    title: string;
    author: string;
    status: string;
  }>;
}