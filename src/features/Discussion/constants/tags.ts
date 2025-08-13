export const PREDEFINED_TAGS = [
  // Platform Core Features
  "react",
  "typescript",
  "material-ui",
  "vite",
  "frontend",
  "ui-design",
  "theme",
  "authentication",
  "state-management",
  "routing",
  "security",

  // Learning Features
  "flashcards",
  "study-sets",
  "spaced-repetition",
  "learning-progress",
  "quiz",
  "memory-techniques",
  "educational-content",

  // Development & Architecture
  "component-architecture",
  "hooks",
  "context-api",
  "api-integration",
  "database-design",
  "jwt-security",
  "session-management",
  "performance-optimization",
  "build-optimization",

  // Features & Functionality
  "discussion-forum",
  "real-time-features",
  "voting-system",
  "comments",
  "notifications",
  "user-management",
  "admin-dashboard",
  "library-management",
  "book-content",
  "search-filtering",
  "pagination",

  // Technical Issues & Solutions
  "bug-fix",
  "feature-request",
  "refactoring",
  "testing",
  "debugging",
  "deployment",
  "responsive-design",
  "accessibility",
  "user-experience",
  "mobile",
  "css",
  "seo",

  // General Categories
  "help",
  "question",
  "tutorial",
  "best-practices",
  "code-review",
  "troubleshooting",
] as const;

export type PredefinedTag = (typeof PREDEFINED_TAGS)[number];

export const MAX_TAGS_PER_DISCUSSION = 5;
