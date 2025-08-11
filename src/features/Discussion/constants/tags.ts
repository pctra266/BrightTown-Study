export const PREDEFINED_TAGS = [
  "general",
  "study",
  "flashcards",
  "learning",
  "tips",
  "motivation",
  "exam-prep",
  "note-taking",
  "memory",
  "vocabulary",
  "math",
  "science",
  "history",
  "language",
  "time-management",
  "productivity",
  "online-learning",
  "group-study",
  "self-study",
  "revision",
  "homework",
  "assignment",
  "project",
  "research",
  "focus",
] as const;

export type PredefinedTag = (typeof PREDEFINED_TAGS)[number];

export const MAX_TAGS_PER_DISCUSSION = 5;
