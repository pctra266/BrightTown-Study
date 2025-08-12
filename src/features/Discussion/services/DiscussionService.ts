import api from "../../../api/api";

// Interface for comments on answers (nested comments)
export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string | null;
  isEdited: boolean;
  upvotes: number;
  downvotes: number;
  score: number;
  userVotes: { [userId: string]: "upvote" | "downvote" };
}

// Interface for main answers (primary responses)
export interface Answer {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string | null;
  isEdited: boolean;
  upvotes: number;
  downvotes: number;
  score: number;
  userVotes: { [userId: string]: "upvote" | "downvote" };
  comments: Comment[]; // Nested comments under each answer
  isAccepted?: boolean; // For marking best answer
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string | null;
  isEdited: boolean;
  upvotes: number;
  downvotes: number;
  score: number;
  userVotes: { [userId: string]: "upvote" | "downvote" };
  views: number;
  viewedBy: string[];
  answers: Answer[];
  comments: Comment[]; // Comments directly on the question
  tags?: string[];
  hasAcceptedAnswer?: boolean; // Track if question has accepted answer
}

export interface CreateDiscussionData {
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  tags?: string[];
}

export interface UpdateDiscussionData {
  title: string;
  content: string;
  tags?: string[];
}

export interface CreateAnswerData {
  content: string;
  authorId: string;
  authorName: string;
  discussionId: string;
}

export interface CreateCommentData {
  content: string;
  authorId: string;
  authorName: string;
  discussionId: string;
  answerId?: string; // Optional - if not provided, comment is on the question
}

export interface UpdateAnswerData {
  content: string;
}

export interface UpdateCommentData {
  content: string;
}

export interface VoteData {
  userId: string;
  voteType: "upvote" | "downvote";
}

export interface AcceptAnswerData {
  answerId: string;
  questionAuthorId: string;
}

export const discussionService = {
  getAllDiscussions: async (): Promise<Discussion[]> => {
    const response = await api.get("/discussions");
    return response.data.map((discussion: Discussion) => ({
      ...discussion,
      views: discussion.views ?? 0,
      viewedBy: discussion.viewedBy ?? [],
      hasAcceptedAnswer: discussion.hasAcceptedAnswer ?? false,
      answers: discussion.answers.map((answer) => ({
        ...answer,
        comments: answer.comments ?? [],
        isAccepted: answer.isAccepted ?? false,
      })),
    }));
  },

  getDiscussionById: async (id: string): Promise<Discussion> => {
    const response = await api.get(`/discussions/${id}`);
    const discussion = response.data;

    return {
      ...discussion,
      views: discussion.views ?? 0,
      viewedBy: discussion.viewedBy ?? [],
      hasAcceptedAnswer: discussion.hasAcceptedAnswer ?? false,
      answers: discussion.answers.map((answer: Answer) => ({
        ...answer,
        comments: answer.comments ?? [],
        isAccepted: answer.isAccepted ?? false,
      })),
    };
  },

  generateNextDiscussionId: async (): Promise<string> => {
    const discussions = await discussionService.getAllDiscussions();
    const maxId = discussions.reduce((max, discussion) => {
      const currentId = parseInt(discussion.id);
      return currentId > max ? currentId : max;
    }, 0);
    return (maxId + 1).toString();
  },

  generateNextAnswerId: async (discussionId: string): Promise<string> => {
    const discussion = await discussionService.getDiscussionById(discussionId);
    const maxId = discussion.answers.reduce((max, answer) => {
      const currentId = parseInt(answer.id);
      return currentId > max ? currentId : max;
    }, 0);
    return (maxId + 1).toString();
  },

  createDiscussion: async (data: CreateDiscussionData): Promise<Discussion> => {
    const newId = await discussionService.generateNextDiscussionId();

    const newDiscussion = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      isEdited: false,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      userVotes: {},
      views: 0,
      viewedBy: [],
      answers: [],
      tags: data.tags || [],
    };

    const response = await api.post("/discussions", newDiscussion);
    return response.data;
  },

  trackView: async (
    discussionId: string,
    userId: string
  ): Promise<Discussion> => {
    const discussion = await discussionService.getDiscussionById(discussionId);

    if (
      discussion.authorId === userId ||
      discussion.viewedBy.includes(userId)
    ) {
      return discussion;
    }

    const updatedDiscussion = {
      ...discussion,
      views: discussion.views + 1,
      viewedBy: [...discussion.viewedBy, userId],
    };

    const response = await api.put(
      `/discussions/${discussionId}`,
      updatedDiscussion
    );
    return response.data;
  },

  updateDiscussion: async (
    id: string,
    data: UpdateDiscussionData
  ): Promise<Discussion> => {
    const discussion = await discussionService.getDiscussionById(id);

    const updatedDiscussion = {
      ...discussion,
      title: data.title,
      content: data.content,
      tags: data.tags !== undefined ? data.tags : discussion.tags,
      updatedAt: new Date().toISOString(),
      isEdited: true,
    };

    const response = await api.put(`/discussions/${id}`, updatedDiscussion);
    return response.data;
  },

  deleteDiscussion: async (id: string): Promise<void> => {
    await api.delete(`/discussions/${id}`);
  },

  addAnswer: async (data: CreateAnswerData): Promise<Discussion> => {
    const discussion = await discussionService.getDiscussionById(
      data.discussionId
    );
    const newAnswerId = await discussionService.generateNextAnswerId(
      data.discussionId
    );

    const newAnswer: Answer = {
      id: newAnswerId,
      content: data.content,
      authorId: data.authorId,
      authorName: data.authorName,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      isEdited: false,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      userVotes: {},
      comments: [], // Initialize empty comments array
      isAccepted: false,
    };

    const updatedDiscussion = {
      ...discussion,
      answers: [...discussion.answers, newAnswer],
    };

    const response = await api.put(
      `/discussions/${data.discussionId}`,
      updatedDiscussion
    );
    return response.data;
  },

  updateAnswer: async (
    discussionId: string,
    answerId: string,
    data: UpdateAnswerData
  ): Promise<Discussion> => {
    const discussion = await discussionService.getDiscussionById(discussionId);

    const updatedAnswers = discussion.answers.map((answer) =>
      answer.id === answerId
        ? {
            ...answer,
            content: data.content,
            updatedAt: new Date().toISOString(),
            isEdited: true,
          }
        : answer
    );

    const updatedDiscussion = {
      ...discussion,
      answers: updatedAnswers,
    };

    const response = await api.put(
      `/discussions/${discussionId}`,
      updatedDiscussion
    );
    return response.data;
  },

  deleteAnswer: async (
    discussionId: string,
    answerId: string
  ): Promise<Discussion> => {
    const discussion = await discussionService.getDiscussionById(discussionId);

    const updatedAnswers = discussion.answers.filter(
      (answer) => answer.id !== answerId
    );

    const updatedDiscussion = {
      ...discussion,
      answers: updatedAnswers,
    };

    const response = await api.put(
      `/discussions/${discussionId}`,
      updatedDiscussion
    );
    return response.data;
  },

  voteOnDiscussion: async (
    discussionId: string,
    data: VoteData
  ): Promise<Discussion> => {
    const discussion = await discussionService.getDiscussionById(discussionId);

    // Prevent users from voting on their own discussion
    if (discussion.authorId === data.userId) {
      throw new Error("You cannot vote on your own discussion.");
    }

    const currentUserVote = discussion.userVotes[data.userId];
    let newUpvotes = discussion.upvotes;
    let newDownvotes = discussion.downvotes;
    const newUserVotes = { ...discussion.userVotes };

    if (currentUserVote === "upvote") {
      newUpvotes--;
    } else if (currentUserVote === "downvote") {
      newDownvotes--;
    }

    if (currentUserVote !== data.voteType) {
      if (data.voteType === "upvote") {
        newUpvotes++;
      } else {
        newDownvotes++;
      }
      newUserVotes[data.userId] = data.voteType;
    } else {
      delete newUserVotes[data.userId];
    }

    const updatedDiscussion = {
      ...discussion,
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      score: newUpvotes - newDownvotes,
      userVotes: newUserVotes,
    };

    const response = await api.put(
      `/discussions/${discussionId}`,
      updatedDiscussion
    );
    return response.data;
  },

  voteOnAnswer: async (
    discussionId: string,
    answerId: string,
    data: VoteData
  ): Promise<Discussion> => {
    const discussion = await discussionService.getDiscussionById(discussionId);

    const updatedAnswers = discussion.answers.map((answer) => {
      if (answer.id === answerId) {
        // Prevent users from voting on their own answers
        if (answer.authorId === data.userId) {
          throw new Error("You cannot vote on your own answer.");
        }

        const currentUserVote = answer.userVotes[data.userId];
        let newUpvotes = answer.upvotes;
        let newDownvotes = answer.downvotes;
        const newUserVotes = { ...answer.userVotes };

        if (currentUserVote === "upvote") {
          newUpvotes--;
        } else if (currentUserVote === "downvote") {
          newDownvotes--;
        }

        if (currentUserVote !== data.voteType) {
          if (data.voteType === "upvote") {
            newUpvotes++;
          } else {
            newDownvotes++;
          }
          newUserVotes[data.userId] = data.voteType;
        } else {
          delete newUserVotes[data.userId];
        }

        return {
          ...answer,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          score: newUpvotes - newDownvotes,
          userVotes: newUserVotes,
        };
      }
      return answer;
    });

    const updatedDiscussion = {
      ...discussion,
      answers: updatedAnswers,
    };

    const response = await api.put(
      `/discussions/${discussionId}`,
      updatedDiscussion
    );
    return response.data;
  },

  // Comment Management
  generateNextCommentId: async (
    discussionId: string,
    answerId: string
  ): Promise<string> => {
    const discussion = await discussionService.getDiscussionById(discussionId);
    const answer = discussion.answers.find((a) => a.id === answerId);
    if (!answer) throw new Error("Answer not found");

    const maxId = answer.comments.reduce((max, comment) => {
      const currentId = parseInt(comment.id);
      return currentId > max ? currentId : max;
    }, 0);
    return (maxId + 1).toString();
  },

  addComment: async (data: CreateCommentData): Promise<Discussion> => {
    const discussion = await discussionService.getDiscussionById(
      data.discussionId
    );

    let newCommentId: string;

    if (data.answerId) {
      // Comment on answer
      newCommentId = await discussionService.generateNextCommentId(
        data.discussionId,
        data.answerId
      );
    } else {
      // Comment on question
      const maxId =
        discussion.comments?.reduce((max, comment) => {
          const currentId = parseInt(comment.id);
          return currentId > max ? currentId : max;
        }, 0) || 0;
      newCommentId = (maxId + 1).toString();
    }

    const newComment: Comment = {
      id: newCommentId,
      content: data.content,
      authorId: data.authorId,
      authorName: data.authorName,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      isEdited: false,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      userVotes: {},
    };

    let updatedDiscussion;

    if (data.answerId) {
      // Add comment to answer
      const updatedAnswers = discussion.answers.map((answer) => {
        if (answer.id === data.answerId) {
          return {
            ...answer,
            comments: [...answer.comments, newComment],
          };
        }
        return answer;
      });

      updatedDiscussion = {
        ...discussion,
        answers: updatedAnswers,
      };
    } else {
      // Add comment to question
      updatedDiscussion = {
        ...discussion,
        comments: [...(discussion.comments || []), newComment],
      };
    }

    const response = await api.put(
      `/discussions/${data.discussionId}`,
      updatedDiscussion
    );
    return response.data;
  },

  updateComment: async (
    discussionId: string,
    answerId: string | undefined,
    commentId: string,
    data: UpdateCommentData
  ): Promise<Discussion> => {
    const discussion = await discussionService.getDiscussionById(discussionId);

    let updatedDiscussion;

    if (answerId) {
      // Update comment on answer
      const updatedAnswers = discussion.answers.map((answer) => {
        if (answer.id === answerId) {
          const updatedComments = answer.comments.map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                content: data.content,
                updatedAt: new Date().toISOString(),
                isEdited: true,
              };
            }
            return comment;
          });
          return { ...answer, comments: updatedComments };
        }
        return answer;
      });

      updatedDiscussion = {
        ...discussion,
        answers: updatedAnswers,
      };
    } else {
      // Update comment on question
      const updatedComments = (discussion.comments || []).map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            content: data.content,
            updatedAt: new Date().toISOString(),
            isEdited: true,
          };
        }
        return comment;
      });

      updatedDiscussion = {
        ...discussion,
        comments: updatedComments,
      };
    }

    const response = await api.put(
      `/discussions/${discussionId}`,
      updatedDiscussion
    );
    return response.data;
  },

  deleteComment: async (
    discussionId: string,
    answerId: string | undefined,
    commentId: string
  ): Promise<Discussion> => {
    const discussion = await discussionService.getDiscussionById(discussionId);

    let updatedDiscussion;

    if (answerId) {
      // Delete comment from answer
      const updatedAnswers = discussion.answers.map((answer) => {
        if (answer.id === answerId) {
          return {
            ...answer,
            comments: answer.comments.filter(
              (comment) => comment.id !== commentId
            ),
          };
        }
        return answer;
      });

      updatedDiscussion = {
        ...discussion,
        answers: updatedAnswers,
      };
    } else {
      // Delete comment from question
      const updatedComments = (discussion.comments || []).filter(
        (comment) => comment.id !== commentId
      );

      updatedDiscussion = {
        ...discussion,
        comments: updatedComments,
      };
    }

    const response = await api.put(
      `/discussions/${discussionId}`,
      updatedDiscussion
    );
    return response.data;
  },

  voteOnComment: async (
    discussionId: string,
    answerId: string | undefined,
    commentId: string,
    data: VoteData
  ): Promise<Discussion> => {
    const discussion = await discussionService.getDiscussionById(discussionId);

    let updatedDiscussion;

    if (answerId) {
      // Vote on comment under answer
      const updatedAnswers = discussion.answers.map((answer) => {
        if (answer.id === answerId) {
          const updatedComments = answer.comments.map((comment) => {
            if (comment.id === commentId) {
              // Prevent users from voting on their own comments
              if (comment.authorId === data.userId) {
                throw new Error("You cannot vote on your own comment.");
              }

              const currentUserVote = comment.userVotes[data.userId];
              let newUpvotes = comment.upvotes;
              let newDownvotes = comment.downvotes;
              const newUserVotes = { ...comment.userVotes };

              if (currentUserVote === "upvote") {
                newUpvotes--;
              } else if (currentUserVote === "downvote") {
                newDownvotes--;
              }

              if (currentUserVote !== data.voteType) {
                if (data.voteType === "upvote") {
                  newUpvotes++;
                } else {
                  newDownvotes++;
                }
                newUserVotes[data.userId] = data.voteType;
              } else {
                delete newUserVotes[data.userId];
              }

              return {
                ...comment,
                upvotes: newUpvotes,
                downvotes: newDownvotes,
                score: newUpvotes - newDownvotes,
                userVotes: newUserVotes,
              };
            }
            return comment;
          });
          return { ...answer, comments: updatedComments };
        }
        return answer;
      });

      updatedDiscussion = {
        ...discussion,
        answers: updatedAnswers,
      };
    } else {
      // Vote on comment under question
      const updatedComments = (discussion.comments || []).map((comment) => {
        if (comment.id === commentId) {
          // Prevent users from voting on their own comments
          if (comment.authorId === data.userId) {
            throw new Error("You cannot vote on your own comment.");
          }

          const currentUserVote = comment.userVotes[data.userId];
          let newUpvotes = comment.upvotes;
          let newDownvotes = comment.downvotes;
          const newUserVotes = { ...comment.userVotes };

          if (currentUserVote === "upvote") {
            newUpvotes--;
          } else if (currentUserVote === "downvote") {
            newDownvotes--;
          }

          if (currentUserVote !== data.voteType) {
            if (data.voteType === "upvote") {
              newUpvotes++;
            } else {
              newDownvotes++;
            }
            newUserVotes[data.userId] = data.voteType;
          } else {
            delete newUserVotes[data.userId];
          }

          return {
            ...comment,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            score: newUpvotes - newDownvotes,
            userVotes: newUserVotes,
          };
        }
        return comment;
      });

      updatedDiscussion = {
        ...discussion,
        comments: updatedComments,
      };
    }

    const response = await api.put(
      `/discussions/${discussionId}`,
      updatedDiscussion
    );
    return response.data;
  },

  // Accept Answer functionality
  acceptAnswer: async (
    discussionId: string,
    data: AcceptAnswerData
  ): Promise<Discussion> => {
    const discussion = await discussionService.getDiscussionById(discussionId);

    // Only question author can accept answers
    if (discussion.authorId !== data.questionAuthorId) {
      throw new Error("Only the question author can accept answers");
    }

    const updatedAnswers = discussion.answers.map((answer) => ({
      ...answer,
      isAccepted: answer.id === data.answerId,
    }));

    const updatedDiscussion = {
      ...discussion,
      answers: updatedAnswers,
      hasAcceptedAnswer: true,
    };

    const response = await api.put(
      `/discussions/${discussionId}`,
      updatedDiscussion
    );
    return response.data;
  },

  // Validation functions
  canUserAnswer: (discussion: Discussion, userId: string): boolean => {
    // Prevent question author from answering their own question
    return discussion.authorId !== userId;
  },

  canUserComment: (userId: string): boolean => {
    // All authenticated users can comment
    return !!userId;
  },

  canUserAcceptAnswer: (discussion: Discussion, userId: string): boolean => {
    // Only question author can accept answers
    return discussion.authorId === userId;
  },
};
