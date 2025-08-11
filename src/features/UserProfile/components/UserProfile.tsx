import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useThemeMode } from '../../../contexts/ThemeContext';
import type { UserProfileData, UserActivityData } from '../types';
import { fetchUserProfile, fetchUserActivity, updateUserProfile, getRoleDisplayName } from '../services';
import ProfileEditForm from './ProfileEditForm';
import ActivityChart from './ActivityChart';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { actualTheme } = useThemeMode();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [activity, setActivity] = useState<UserActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Theme-aware utility functions
  const getThemeClasses = () => {
    const isDark = actualTheme === 'dark';
    return {
      background: isDark ? 'bg-gray-900' : 'bg-gray-50',
      cardBackground: isDark ? 'bg-gray-800' : 'bg-white',
      textPrimary: isDark ? 'text-gray-100' : 'text-gray-900',
      textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
      textMuted: isDark ? 'text-gray-500' : 'text-gray-700',
      border: isDark ? 'border-gray-700' : 'border-gray-200',
      hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
      socialLink: isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700',
      shadow: isDark ? 'shadow-gray-900/20' : 'shadow-lg',
    };
  };

  const themeClasses = getThemeClasses();

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

  const handleSaveProfile = async (updatedProfile: Partial<UserProfileData>) => {
    if (!user?.id || !profile) return;

    try {
      setSaveLoading(true);
      const updatedProfileData = await updateUserProfile(user.id, updatedProfile);
      setProfile(updatedProfileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile changes');
    } finally {
      setSaveLoading(false);
    }
  };

  const renderSocialLinks = () => {
    if (!profile?.socialLinks) return null;

    const links = [
      { key: 'website', icon: '🌐', url: profile.socialLinks.website },
      { key: 'linkedin', icon: '💼', url: profile.socialLinks.linkedin },
      { key: 'github', icon: '💻', url: profile.socialLinks.github },
      { key: 'twitter', icon: '🐦', url: profile.socialLinks.twitter },
    ].filter(link => link.url);

    if (links.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className={`text-sm font-medium ${themeClasses.textMuted} mb-2`}>Connect with me</h4>
        <div className="flex space-x-3">
          {links.map(link => (
            <a
              key={link.key}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center px-3 py-1 ${themeClasses.socialLink} rounded-full text-sm transition-colors`}
            >
              <span className="mr-1">{link.icon}</span>
              <span className="capitalize">{link.key}</span>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const renderQuickActions = () => (
    <div className={`${themeClasses.cardBackground} rounded-lg ${themeClasses.shadow} p-6 mb-8`}>
      <h2 className={`text-xl font-semibold ${themeClasses.textPrimary} mb-4 flex items-center`}>
        <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/library/flashcard/new"
          className={`flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group ${actualTheme === 'dark' ? 'bg-purple-900/20 hover:bg-purple-900/30' : ''}`}
        >
          <div className={`w-10 h-10 ${actualTheme === 'dark' ? 'bg-purple-900/40 group-hover:bg-purple-900/60' : 'bg-purple-100 group-hover:bg-purple-200'} rounded-lg flex items-center justify-center mr-3`}>
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h3 className={`font-medium ${themeClasses.textPrimary}`}>Create Flashcards</h3>
            <p className={`text-sm ${themeClasses.textSecondary}`}>Build new study sets</p>
          </div>
        </Link>

        <Link
          to="/talk/new"
          className={`flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group ${actualTheme === 'dark' ? 'bg-blue-900/20 hover:bg-blue-900/30' : ''}`}
        >
          <div className={`w-10 h-10 ${actualTheme === 'dark' ? 'bg-blue-900/40 group-hover:bg-blue-900/60' : 'bg-blue-100 group-hover:bg-blue-200'} rounded-lg flex items-center justify-center mr-3`}>
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className={`font-medium ${themeClasses.textPrimary}`}>Start Discussion</h3>
            <p className={`text-sm ${themeClasses.textSecondary}`}>Share your thoughts</p>
          </div>
        </Link>

        <Link
          to="/manage-book"
          className={`flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group ${actualTheme === 'dark' ? 'bg-green-900/20 hover:bg-green-900/30' : ''}`}
        >
          <div className={`w-10 h-10 ${actualTheme === 'dark' ? 'bg-green-900/40 group-hover:bg-green-900/60' : 'bg-green-100 group-hover:bg-green-200'} rounded-lg flex items-center justify-center mr-3`}>
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.747 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h3 className={`font-medium ${themeClasses.textPrimary}`}>Add Book</h3>
            <p className={`text-sm ${themeClasses.textSecondary}`}>Expand your library</p>
          </div>
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.background}`}>
        <div className={`${themeClasses.cardBackground} p-8 rounded-lg ${themeClasses.shadow}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className={`mt-4 ${themeClasses.textSecondary} text-center`}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.background}`}>
        <div className={`${themeClasses.cardBackground} p-8 rounded-lg ${themeClasses.shadow} text-center`}>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className={`text-xl font-semibold ${themeClasses.textPrimary} mb-2`}>Profile Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/" className="text-purple-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className={`min-h-screen ${themeClasses.background} py-8 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-4xl mx-auto">
          <ProfileEditForm
            profile={profile}
            onSave={handleSaveProfile}
            onCancel={() => setIsEditing(false)}
            isLoading={saveLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className={`${themeClasses.cardBackground} rounded-lg ${themeClasses.shadow} overflow-hidden mb-8`}>
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.username} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div className="text-white">
                  <h1 className="text-3xl font-bold">{profile.username}</h1>
                  <p className="text-purple-100">{getRoleDisplayName(profile.role)}</p>
                  {profile.email && (
                    <p className="text-purple-100 text-sm">{profile.email}</p>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${profile.status
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {profile.status ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 border-2 ${actualTheme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-100 border-gray-600/50'
                    : 'bg-white hover:bg-gray-100 text-gray-900 border-white/20'
                  }`}
              >
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            </div>
          </div>

          {/* Bio and Social Links */}
          {(profile.bio || profile.socialLinks) && (
            <div className={`px-6 py-4 ${actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} ${themeClasses.border} border-b`}>
              {profile.bio && (
                <p className={`${themeClasses.textMuted} mb-3`}>{profile.bio}</p>
              )}
              {renderSocialLinks()}
            </div>
          )}

          {/* Activity Stats */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{profile.flashcardSetsCount}</div>
                <div className={`${themeClasses.textSecondary}`}>Flashcard Sets</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{profile.discussionsCount}</div>
                <div className={`${themeClasses.textSecondary}`}>Discussions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{profile.booksCount}</div>
                <div className={`${themeClasses.textSecondary}`}>Books</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Activity Chart */}
        <ActivityChart
          flashcardSetsCount={profile.flashcardSetsCount}
          discussionsCount={profile.discussionsCount}
          booksCount={profile.booksCount}
        />

        {/* Activity Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Flashcard Sets */}
          <div className={`${themeClasses.cardBackground} rounded-lg ${themeClasses.shadow} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${themeClasses.textPrimary} flex items-center`}>
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
                  <div key={set.id} className={`${themeClasses.border} border rounded-lg p-4 ${themeClasses.hover} transition-colors`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className={`font-medium ${themeClasses.textPrimary}`}>{set.name}</h3>
                        <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>{set.description}</p>
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
              <div className={`text-center ${themeClasses.textSecondary} py-8`}>
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
          <div className={`${themeClasses.cardBackground} rounded-lg ${themeClasses.shadow} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${themeClasses.textPrimary} flex items-center`}>
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
                  <div key={discussion.id} className={`${themeClasses.border} border rounded-lg p-4 ${themeClasses.hover} transition-colors`}>
                    <Link to={`/talk/${discussion.id}`} className="block">
                      <h3 className={`font-medium ${themeClasses.textPrimary} hover:text-blue-600 transition-colors`}>
                        {discussion.title}
                      </h3>
                      <p className={`text-sm ${themeClasses.textSecondary} mt-1 line-clamp-2`}>
                        {discussion.content}
                      </p>
                      <div className={`flex items-center space-x-4 mt-2 text-xs ${themeClasses.textSecondary}`}>
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
              <div className={`text-center ${themeClasses.textSecondary} py-8`}>
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
          <div className={`${themeClasses.cardBackground} rounded-lg ${themeClasses.shadow} p-6 mt-8`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${themeClasses.textPrimary} flex items-center`}>
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
                <div key={book.id} className={`${themeClasses.border} border rounded-lg p-4 ${themeClasses.hover} transition-colors`}>
                  <h3 className={`font-medium ${themeClasses.textPrimary}`}>{book.title}</h3>
                  <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>by {book.author}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${book.status === 'approved' ? 'bg-green-100 text-green-800' :
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