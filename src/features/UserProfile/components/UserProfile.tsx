import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

interface UserProfileData {
  id: string;
  username: string;
  role: string;
  status: boolean;
  flashcardSetsCount: number;
  discussionsCount: number;
  booksCount: number;
}

interface UserActivityData {
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

const API_BASE = 'http://localhost:9000';

const getRoleDisplayName = (role: string): string => {
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

const fetchUserProfile = async (userId: string): Promise<UserProfileData> => {
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

const fetchUserActivity = async (userId: string): Promise<UserActivityData> => {
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

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [activity, setActivity] = useState<UserActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [profileData, activityData] = await Promise.all([
          fetchUserProfile(user.id),
          fetchUserActivity(user.id),
        ]);
        setProfile(profileData);
        setActivity(activityData);
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Error loading user data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/" className="text-purple-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">{profile.username}</h1>
                <p className="text-purple-100">{getRoleDisplayName(profile.role)}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    profile.status
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.status ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Activity Stats */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{profile.flashcardSetsCount}</div>
                <div className="text-gray-600">Flashcard Sets</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{profile.discussionsCount}</div>
                <div className="text-gray-600">Discussions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{profile.booksCount}</div>
                <div className="text-gray-600">Books</div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Flashcard Sets */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.747 0-3.332.477-4.5 1.253" />
                </svg>
                My Flashcard Sets
              </h2>
              <Link to="/library" className="text-purple-600 hover:underline text-sm">
                View All →
              </Link>
            </div>
            
            {activity?.flashcardSets.length ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activity.flashcardSets.slice(0, 5).map((set) => (
                  <div key={set.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{set.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{set.description}</p>
                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full mt-2">
                          {set.flashcards.length} cards
                        </span>
                      </div>
                      <Link
                        to={`/library/flashcard/${set.id}/play`}
                        className="ml-4 inline-flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition"
                      >
                        Play
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.747 0-3.332.477-4.5 1.253" />
                </svg>
                <p>No flashcard sets created yet</p>
                <Link to="/library/flashcard/new" className="text-purple-600 hover:underline text-sm mt-2 inline-block">
                  Create your first set
                </Link>
              </div>
            )}
          </div>

          {/* Discussions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                My Discussions
              </h2>
              <Link to="/talk" className="text-blue-600 hover:underline text-sm">
                View All →
              </Link>
            </div>
            
            {activity?.discussions.length ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activity.discussions.slice(0, 5).map((discussion) => (
                  <div key={discussion.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <Link to={`/talk/${discussion.id}`} className="block">
                      <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                        {discussion.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {discussion.content}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                          {discussion.upvotes}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {discussion.views}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>No discussions created yet</p>
                <Link to="/talk/new" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                  Start your first discussion
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Books Section */}
        {activity?.books.length ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.747 0-3.332.477-4.5 1.253" />
                </svg>
                My Books
              </h2>
              <Link to="/manage-book" className="text-green-600 hover:underline text-sm">
                View All →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activity.books.slice(0, 6).map((book) => (
                <div key={book.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium text-gray-900">{book.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">by {book.author}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                    book.status === 'approved' ? 'bg-green-100 text-green-800' :
                    book.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {book.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default UserProfile;