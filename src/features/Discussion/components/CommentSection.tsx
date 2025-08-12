import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Box,
    Typography,
    Button,
    TextField,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
} from "@mui/material";
import { useAuth } from "../../../contexts/AuthContext";
import type { Comment } from "../services/DiscussionService";

interface CommentSectionProps {
    comments: Comment[];
    onAddComment: (content: string) => Promise<void>;
    onUpdateComment: (commentId: string, content: string) => Promise<void>;
    onDeleteComment: (commentId: string) => Promise<void>;
    onVoteComment: (commentId: string, voteType: "upvote" | "downvote") => Promise<void>;
}

const CommentSection: React.FC<CommentSectionProps> = ({
    comments,
    onAddComment,
    onUpdateComment,
    onDeleteComment,
    onVoteComment,
}) => {
    const { isAuthenticated, user } = useAuth();

    const [showCommentForm, setShowCommentForm] = useState(false);
    const [newCommentContent, setNewCommentContent] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [editCommentContent, setEditCommentContent] = useState("");

    const [deleteCommentDialog, setDeleteCommentDialog] = useState<string | null>(null);

    const validateComment = (content: string): string => {
        const trimmedContent = content.trim();
        if (!trimmedContent) return "Comment cannot be empty.";
        if (trimmedContent.length < 5) return "Comment must be at least 5 characters long.";
        if (trimmedContent.length > 500) return "Comment cannot exceed 500 characters.";
        return "";
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleSubmitComment = async () => {
        const validationError = validateComment(newCommentContent);
        if (validationError) return;

        setSubmittingComment(true);
        try {
            await onAddComment(newCommentContent.trim());
            setNewCommentContent("");
            setShowCommentForm(false);
        } catch (error) {
            console.error("Error submitting comment:", error);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleUpdateComment = async (commentId: string) => {
        const validationError = validateComment(editCommentContent);
        if (validationError) return;

        try {
            await onUpdateComment(commentId, editCommentContent.trim());
            setEditingComment(null);
            setEditCommentContent("");
        } catch (error) {
            console.error("Error updating comment:", error);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await onDeleteComment(commentId);
            setDeleteCommentDialog(null);
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const startEditComment = (comment: Comment) => {
        setEditingComment(comment.id);
        setEditCommentContent(comment.content);
    };

    return (
        <Box sx={{ mt: 2 }}>
            {/* Comments List */}
            {comments.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    {comments.map((comment) => (
                        <Box
                            key={comment.id}
                            sx={{
                                display: 'flex',
                                gap: 0.5,
                                py: 0.5,
                                px: 0.75,
                                fontSize: '0.75rem',
                                borderBottom: '1px solid',
                                borderBottomColor: 'divider',
                                '&:last-child': {
                                    borderBottom: 'none'
                                },
                                '&:hover': {
                                    backgroundColor: 'action.hover'
                                },
                                alignItems: 'flex-start',
                                minHeight: '24px'
                            }}
                        >
                            {/* Ultra Compact Vote Buttons - Inline Style */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.25,
                                    minWidth: 'fit-content',
                                    mr: 0.75
                                }}
                            >
                                <Box
                                    component="button"
                                    onClick={() => onVoteComment(comment.id, "upvote")}
                                    disabled={!isAuthenticated || (user?.id === comment.authorId)}
                                    sx={{
                                        border: 'none',
                                        background: 'none',
                                        cursor: (isAuthenticated && user?.id !== comment.authorId) ? 'pointer' : 'default',
                                        p: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: user && comment.userVotes[user.id] === 'upvote' ? 'success.main' : 'text.secondary',
                                        fontSize: '0.7rem',
                                        opacity: (!isAuthenticated || user?.id === comment.authorId) ? 0.3 : 1,
                                        '&:hover': {
                                            color: (isAuthenticated && user?.id !== comment.authorId) ? 'success.main' : 'text.secondary'
                                        }
                                    }}
                                >
                                    ▲
                                </Box>

                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: '0.65rem',
                                        color: comment.score > 0 ? 'success.main' : comment.score < 0 ? 'error.main' : 'text.secondary',
                                        fontWeight: 500,
                                        minWidth: '14px',
                                        textAlign: 'center'
                                    }}
                                >
                                    {comment.score}
                                </Typography>

                                <Box
                                    component="button"
                                    onClick={() => onVoteComment(comment.id, "downvote")}
                                    disabled={!isAuthenticated || (user?.id === comment.authorId)}
                                    sx={{
                                        border: 'none',
                                        background: 'none',
                                        cursor: (isAuthenticated && user?.id !== comment.authorId) ? 'pointer' : 'default',
                                        p: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: user && comment.userVotes[user.id] === 'downvote' ? 'error.main' : 'text.secondary',
                                        fontSize: '0.7rem',
                                        opacity: (!isAuthenticated || user?.id === comment.authorId) ? 0.3 : 1,
                                        '&:hover': {
                                            color: (isAuthenticated && user?.id !== comment.authorId) ? 'error.main' : 'text.secondary'
                                        }
                                    }}
                                >
                                    ▼
                                </Box>
                            </Box>

                            {/* Comment Content - Single Line Layout */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                {editingComment === comment.id ? (
                                    // Edit Comment Form - Compact
                                    <Box sx={{ py: 0.5 }}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            value={editCommentContent}
                                            onChange={(e) => setEditCommentContent(e.target.value)}
                                            placeholder="Edit your comment..."
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                mb: 1,
                                                "& .MuiOutlinedInput-root": {
                                                    fontSize: "0.8rem",
                                                }
                                            }}
                                        />
                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => handleUpdateComment(comment.id)}
                                                sx={{
                                                    fontSize: "0.7rem",
                                                    textTransform: "none",
                                                    px: 1.5,
                                                    py: 0.25,
                                                    minHeight: 'auto'
                                                }}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="small"
                                                onClick={() => setEditingComment(null)}
                                                sx={{
                                                    fontSize: "0.7rem",
                                                    textTransform: "none",
                                                    color: 'text.secondary',
                                                    px: 1.5,
                                                    py: 0.25,
                                                    minHeight: 'auto'
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </Stack>
                                    </Box>
                                ) : (
                                    // Display Comment - Single Line Layout like Stack Overflow
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%', flexWrap: 'wrap' }}>
                                        {/* Comment Text - Inline */}
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontSize: "0.75rem",
                                                lineHeight: 1.2,
                                                color: 'text.primary',
                                                mr: 0.5
                                            }}
                                        >
                                            {comment.content}
                                        </Typography>

                                        {/* Author and Meta - Inline */}
                                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: 'white',
                                                    fontSize: "0.65rem",
                                                }}
                                            >
                                                –
                                            </Typography>
                                            <Link
                                                to={`/user/${comment.authorId}`}
                                                style={{ textDecoration: 'none' }}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: 'primary.main',
                                                        fontSize: "0.65rem",
                                                        fontWeight: 500,
                                                        mr: 0.25,
                                                        '&:hover': {
                                                            textDecoration: 'underline'
                                                        }
                                                    }}
                                                >
                                                    {comment.authorName}
                                                </Typography>
                                            </Link>
                                        </Box>                                        {/* Date */}
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: 'text.secondary',
                                                fontSize: "0.65rem",
                                                mr: 0.25
                                            }}
                                        >
                                            {formatDate(comment.updatedAt || comment.createdAt)}
                                        </Typography>

                                        {/* Edited flag */}
                                        {comment.isEdited && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: 'text.secondary',
                                                    fontSize: "0.65rem",
                                                    fontStyle: 'italic',
                                                    mr: 0.25
                                                }}
                                            >
                                                (edited)
                                            </Typography>
                                        )}

                                        {/* Action Buttons - Inline */}
                                        {user && user.id === comment.authorId && (
                                            <>
                                                <Typography
                                                    component="button"
                                                    onClick={() => startEditComment(comment)}
                                                    sx={{
                                                        border: 'none',
                                                        background: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: "0.65rem",
                                                        color: 'text.secondary',
                                                        textDecoration: 'underline',
                                                        p: 0,
                                                        mr: 0.25,
                                                        '&:hover': {
                                                            color: 'primary.main'
                                                        }
                                                    }}
                                                >
                                                    edit
                                                </Typography>
                                                <Typography
                                                    component="button"
                                                    onClick={() => setDeleteCommentDialog(comment.id)}
                                                    sx={{
                                                        border: 'none',
                                                        background: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: "0.65rem",
                                                        color: 'text.secondary',
                                                        textDecoration: 'underline',
                                                        p: 0,
                                                        '&:hover': {
                                                            color: 'error.main'
                                                        }
                                                    }}
                                                >
                                                    delete
                                                </Typography>
                                            </>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            {/* Add Comment Section - Compact */}
            {isAuthenticated && (
                <Box sx={{ mt: 1 }}>
                    {!showCommentForm ? (
                        <Button
                            size="small"
                            onClick={() => setShowCommentForm(true)}
                            sx={{
                                fontSize: "0.75rem",
                                textTransform: "none",
                                color: 'text.secondary',
                                p: 0.5,
                                minWidth: 'auto',
                                minHeight: 'auto',
                                '&:hover': {
                                    backgroundColor: 'transparent',
                                    color: 'primary.main'
                                }
                            }}
                        >
                            Add a comment
                        </Button>
                    ) : (
                        <Box sx={{ mt: 1 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                value={newCommentContent}
                                onChange={(e) => setNewCommentContent(e.target.value)}
                                placeholder="Use comments to ask for more information or suggest improvements. Avoid comments that are just thanks or me too."
                                variant="outlined"
                                size="small"
                                sx={{
                                    mb: 1,
                                    "& .MuiOutlinedInput-root": {
                                        fontSize: "0.8rem",
                                    }
                                }}
                            />
                            <Stack direction="row" spacing={1}>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={handleSubmitComment}
                                    disabled={submittingComment || !newCommentContent.trim()}
                                    sx={{
                                        fontSize: "0.7rem",
                                        textTransform: "none",
                                        px: 1.5,
                                        py: 0.25,
                                        minHeight: 'auto'
                                    }}
                                >
                                    {submittingComment ? "Adding..." : "Add comment"}
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => {
                                        setShowCommentForm(false);
                                        setNewCommentContent("");
                                    }}
                                    sx={{
                                        fontSize: "0.7rem",
                                        textTransform: "none",
                                        color: 'text.secondary',
                                        px: 1.5,
                                        py: 0.25,
                                        minHeight: 'auto'
                                    }}
                                >
                                    Cancel
                                </Button>
                            </Stack>
                        </Box>
                    )}
                </Box>
            )}

            {/* Delete Comment Dialog */}
            <Dialog
                open={deleteCommentDialog !== null}
                onClose={() => setDeleteCommentDialog(null)}
            >
                <DialogTitle>Delete Comment</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this comment? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteCommentDialog(null)}>Cancel</Button>
                    <Button
                        onClick={() => deleteCommentDialog && handleDeleteComment(deleteCommentDialog)}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CommentSection;
