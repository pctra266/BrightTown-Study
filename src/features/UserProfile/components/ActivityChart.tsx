import React from 'react';
import { useThemeMode } from '../../../contexts/ThemeContext';

interface ActivityChartProps {
  flashcardSetsCount: number;
  discussionsCount: number;
  booksCount: number;
}

const ActivityChart: React.FC<ActivityChartProps> = ({
  flashcardSetsCount,
  discussionsCount,
  booksCount,
}) => {
  const { actualTheme } = useThemeMode();
  const total = flashcardSetsCount + discussionsCount + booksCount;

  // Theme-aware utility functions
  const getThemeClasses = () => {
    const isDark = actualTheme === 'dark';
    return {
      background: isDark ? 'bg-gray-800' : 'bg-white',
      textPrimary: isDark ? 'text-gray-100' : 'text-gray-900',
      textSecondary: isDark ? 'text-gray-400' : 'text-gray-700',
      textMuted: isDark ? 'text-gray-500' : 'text-gray-600',
      progressBackground: isDark ? 'bg-gray-700' : 'bg-gray-200',
      summaryBackground: isDark ? 'bg-gray-700' : 'bg-gray-50',
      shadow: isDark ? 'shadow-gray-900/20' : 'shadow-lg',
      iconEmpty: isDark ? 'text-gray-600' : 'text-gray-300',
    };
  };

  const themeClasses = getThemeClasses();

  if (total === 0) {
    return (
      <div className={`${themeClasses.background} rounded-lg ${themeClasses.shadow} p-6 mb-8`}>
        <h2 className={`text-xl font-semibold ${themeClasses.textPrimary} mb-4 flex items-center`}>
          <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Activity Overview
        </h2>
        <div className={`text-center ${themeClasses.textMuted} py-8`}>
          <svg className={`w-16 h-16 ${themeClasses.iconEmpty} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>Start creating content to see your activity overview!</p>
        </div>
      </div>
    );
  }

  const flashcardPercentage = (flashcardSetsCount / total) * 100;
  const discussionPercentage = (discussionsCount / total) * 100;
  const bookPercentage = (booksCount / total) * 100;

  return (
    <div className={`${themeClasses.background} rounded-lg ${themeClasses.shadow} p-6 mb-8`}>
      <h2 className={`text-xl font-semibold ${themeClasses.textPrimary} mb-6 flex items-center`}>
        <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Activity Overview
      </h2>

      {/* Progress bars */}
      <div className="space-y-6">
        {/* Flashcard Sets */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.747 0-3.332.477-4.5 1.253" />
              </svg>
              <span className={`text-sm font-medium ${themeClasses.textSecondary}`}>Flashcard Sets</span>
            </div>
            <span className={`text-sm ${themeClasses.textMuted}`}>{flashcardSetsCount} ({Math.round(flashcardPercentage)}%)</span>
          </div>
          <div className={`w-full ${themeClasses.progressBackground} rounded-full h-2`}>
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${flashcardPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Discussions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className={`text-sm font-medium ${themeClasses.textSecondary}`}>Discussions</span>
            </div>
            <span className={`text-sm ${themeClasses.textMuted}`}>{discussionsCount} ({Math.round(discussionPercentage)}%)</span>
          </div>
          <div className={`w-full ${themeClasses.progressBackground} rounded-full h-2`}>
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${discussionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Books */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.747 0-3.332.477-4.5 1.253" />
              </svg>
              <span className={`text-sm font-medium ${themeClasses.textSecondary}`}>Books</span>
            </div>
            <span className={`text-sm ${themeClasses.textMuted}`}>{booksCount} ({Math.round(bookPercentage)}%)</span>
          </div>
          <div className={`w-full ${themeClasses.progressBackground} rounded-full h-2`}>
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${bookPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className={`mt-6 p-4 ${themeClasses.summaryBackground} rounded-lg`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${themeClasses.textSecondary}`}>Total Content Created</span>
          <span className={`text-lg font-bold ${themeClasses.textPrimary}`}>{total}</span>
        </div>
        <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
          {discussionsCount > 0 && "Great job staying active in discussions! "}
          {flashcardSetsCount > 0 && "Keep building your study materials! "}
          {booksCount > 0 && "Thanks for contributing to the library! "}
        </p>
      </div>
    </div>
  );
};

export default ActivityChart;