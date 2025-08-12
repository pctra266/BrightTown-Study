import React, { useState } from "react";
import { Box, Typography, Link, Button, TextField, IconButton } from "@mui/material";
import { Edit, Delete, KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";
import { useAuth } from "../../../contexts/AuthContext";
import { useThemeMode } from "../../../contexts/ThemeContext";
import type { Comment } from "../services/DiscussionService";

interface CommentInlineProps {
    comments: Comment[];
    onAddComment: (content: string) => void;
    onUpdateComment: (commentId: string, content: string) => void;
    onDeleteComment: (commentId: string) => void;
    onVoteComment: (commentId: string, voteType: "upvote" | "downvote") => void;
}

const CommentInline: React.FC<CommentInlineProps> = ({
    comments,
    onAddComment,
    onUpdateComment,
    onDeleteComment,
    onVoteComment,
}) => {
    const { user, isAuthenticated } = useAuth();
    const { actualTheme } = useThemeMode();
    const [showAll, setShowAll] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");

    const displayLimit = 5;
    const displayedComments = showAll ? comments : comments.slice(0, displayLimit);
    const hasMoreComments = comments.length > displayLimit;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const handleAddComment = () => {
        if (newComment.trim()) {
            onAddComment(newComment.trim());
            setNewComment("");
        }
    };

    const handleEditComment = (comment: Comment) => {
        setEditingId(comment.id);
        setEditContent(comment.content);
    };

    const handleSaveEdit = () => {
        if (editingId && editContent.trim()) {
            onUpdateComment(editingId, editContent.trim());
            setEditingId(null);
            setEditContent("");
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditContent("");
    };

    const canEditDelete = (authorId: string) => {
        return user && (user.id === authorId || user.role === "0");
    };

    return (
        <Box sx={{ mt: 2, borderTop: `1px solid ${actualTheme === 'dark' ? '#3c4043' : '#e3e6e8'}`, pt: 2 }}>
            {displayedComments.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    {displayedComments.map((comment) => (
                        <Box key={comment.id}>
                            {editingId === comment.id ? (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSaveEdit();
                                            }
                                        }}
                                        sx={{ fontSize: "0.875rem" }}
                                    />
                                    <Button size="small" onClick={handleSaveEdit}>Save</Button>
                                    <Button size="small" onClick={handleCancelEdit}>Cancel</Button>
                                </Box>
                            ) : (
                                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}>
                                    {/* Vote count */}
                                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 20 }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => onVoteComment(comment.id, "upvote")}
                                            disabled={!isAuthenticated}
                                            sx={{ p: 0.25 }}
                                        >
                                            <KeyboardArrowUp sx={{ fontSize: 16 }} />
                                        </IconButton>
                                        {comment.score > 0 && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: "0.75rem",
                                                    fontWeight: 600,
                                                    color: actualTheme === 'dark' ? '#48bb78' : '#38a169'
                                                }}
                                            >
                                                {comment.score}
                                            </Typography>
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={() => onVoteComment(comment.id, "downvote")}
                                            disabled={!isAuthenticated}
                                            sx={{ p: 0.25 }}
                                        >
                                            <KeyboardArrowDown sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </Box>

                                    {/* Comment content */}
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontSize: "0.875rem",
                                                lineHeight: 1.4,
                                                color: actualTheme === 'dark' ? '#e8e6e3' : '#232629',
                                                display: "inline"
                                            }}
                                        >
                                            {comment.content}
                                        </Typography>

                                        {/* Author and date inline */}
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontSize: "0.75rem",
                                                color: actualTheme === 'dark' ? '#9199a1' : '#6a737c',
                                                ml: 1,
                                                display: "inline"
                                            }}
                                        >
                                            –{" "}
                                            <Link
                                                href={`/user/${comment.authorId}`}
                                                sx={{
                                                    color: actualTheme === 'dark' ? '#0a95ff' : '#0074cc',
                                                    textDecoration: "none",
                                                    "&:hover": { textDecoration: "underline" }
                                                }}
                                            >
                                                {comment.authorName}
                                            </Link>
                                            {" "}{formatDate(comment.createdAt)}
                                            {comment.isEdited && " (edited)"}
                                        </Typography>

                                        {/* Edit/Delete actions */}
                                        {canEditDelete(comment.authorId) && (
                                            <Box sx={{ display: "inline", ml: 1 }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEditComment(comment)}
                                                    sx={{ p: 0.25 }}
                                                >
                                                    <Edit sx={{ fontSize: 12 }} />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onDeleteComment(comment.id)}
                                                    sx={{ p: 0.25 }}
                                                >
                                                    <Delete sx={{ fontSize: 12 }} />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    ))}

                    {/* Show more comments */}
                    {hasMoreComments && !showAll && (
                        <Button
                            size="small"
                            onClick={() => setShowAll(true)}
                            sx={{
                                fontSize: "0.75rem",
                                color: actualTheme === 'dark' ? '#0a95ff' : '#0074cc',
                                textTransform: "none",
                                p: 0,
                                "&:hover": { backgroundColor: "transparent", textDecoration: "underline" }
                            }}
                        >
                            Show {comments.length - displayLimit} more comment{comments.length - displayLimit !== 1 ? 's' : ''}
                        </Button>
                    )}
                </Box>
            )}

            {/* Add new comment */}
            {isAuthenticated && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment();
                            }
                        }}
                        sx={{ fontSize: "0.875rem" }}
                    />
                    <Button
                        size="small"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                    >
                        Add
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default CommentInline;
