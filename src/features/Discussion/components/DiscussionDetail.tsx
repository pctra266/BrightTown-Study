import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    Container,
    Typography,
    Box,
    CardContent,
    Button,
    TextField,
    Stack,
    Chip,
    Divider,
    Alert,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    FormControl,
    InputLabel,
    Select,
    Pagination,
    Paper,
} from "@mui/material";
import {
    ArrowBack,
    Person,
    Send,
    MoreVert,
    Edit,
    Delete,
    CheckCircle,
} from "@mui/icons-material";
import { useAuth } from "../../../contexts/AuthContext";
import { useThemeMode } from "../../../contexts/ThemeContext";
import {
    discussionService,
    type Discussion,
    type Answer,
} from "../services/DiscussionService";
import VoteButtons from "./VoteButton";
import TagSelector from "./TagSelector";
import CommentSection from "./CommentSection";


const DiscussionDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { actualTheme } = useThemeMode();
    const [discussion, setDiscussion] = useState<Discussion | null>(null);
    const [loading, setLoading] = useState(true);
    const [answerContent, setAnswerContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [answerError, setAnswerError] = useState("");
    const [answerCharCount, setAnswerCharCount] = useState(0);

    const [currentAnswerPage, setCurrentAnswerPage] = useState(1);
    const [answerSortBy, setAnswerSortBy] = useState("newest");
    const [filteredAnswers, setFilteredAnswers] = useState<Answer[]>([]);
    const answersPerPage = 3;

    const [editingQuestion, setEditingQuestion] = useState(false);
    const [editQuestionTitle, setEditQuestionTitle] = useState("");
    const [editQuestionContent, setEditQuestionContent] = useState("");
    const [editQuestionTags, setEditQuestionTags] = useState<string[]>([]);
    const [editingAnswer, setEditingAnswer] = useState<string | null>(null);
    const [editAnswerContent, setEditAnswerContent] = useState("");

    const [questionMenuAnchor, setQuestionMenuAnchor] =
        useState<null | HTMLElement>(null);
    const [answerMenuAnchor, setAnswerMenuAnchor] = useState<{
        [key: string]: HTMLElement | null;
    }>({});

    const [deleteQuestionDialog, setDeleteQuestionDialog] = useState(false);
    const [deleteAnswerDialog, setDeleteAnswerDialog] = useState<string | null>(
        null
    );

    const loadDiscussion = useCallback(async () => {
        try {
            const data = await discussionService.getDiscussionById(id!);
            setDiscussion(data);
            setEditQuestionTitle(data.title);
            setEditQuestionContent(data.content);
            setEditQuestionTags(data.tags || []);

            if (user && user.id !== data.authorId) {
                try {
                    const updatedData = await discussionService.trackView(id!, user.id);
                    setDiscussion(updatedData);
                } catch (error) {
                    console.error("Error tracking view:", error);
                }
            }
        } catch (error) {
            console.error("Error loading discussion:", error);
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    const filterAndSortAnswers = useCallback(() => {
        if (!discussion) return;

        const sorted = [...discussion.answers];

        // Always sort accepted answer first
        sorted.sort((a, b) => {
            // If one is accepted and the other isn't, accepted comes first
            if (a.isAccepted && !b.isAccepted) return -1;
            if (!a.isAccepted && b.isAccepted) return 1;

            // If both or neither are accepted, apply the selected sort
            switch (answerSortBy) {
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case "highestScore":
                    return b.score - a.score;
                case "lowestScore":
                    return a.score - b.score;
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

        setFilteredAnswers(sorted);
        setCurrentAnswerPage(1);
    }, [discussion, answerSortBy]);

    useEffect(() => {
        if (id) {
            loadDiscussion();
        }
    }, [id, loadDiscussion]);

    useEffect(() => {
        if (discussion) {
            filterAndSortAnswers();
        }
    }, [discussion, answerSortBy, filterAndSortAnswers]);


    const validateAnswer = (content: string): string => {
        const trimmedContent = content.trim();

        if (!trimmedContent) {
            return "Answer cannot be empty.";
        }

        if (trimmedContent.length < 10) {
            return "Answer must be at least 10 characters long.";
        }

        if (trimmedContent.length > 2000) {
            return "Answer cannot exceed 2000 characters.";
        }


        const repeatedCharsPattern = /(.)\1{9,}/;
        if (repeatedCharsPattern.test(trimmedContent)) {
            return "Answer contains too many repeated characters.";
        }


        const wordCount = trimmedContent.split(/\s+/).length;
        if (wordCount < 3) {
            return "Answer must contain at least 3 words.";
        }

        return "";
    };

    const handleVoteOnQuestion = async (voteType: "upvote" | "downvote") => {
        if (!user || !id || !discussion) return;

        try {
            const updatedDiscussion = await discussionService.voteOnDiscussion(id, {
                userId: user.id,
                voteType,
            });
            setDiscussion(updatedDiscussion);
        } catch (error) {
            console.error("Error voting on question:", error);
        }
    };

    const handleVoteOnAnswer = async (
        answerId: string,
        voteType: "upvote" | "downvote"
    ) => {
        if (!user || !id || !discussion) return;

        try {
            const updatedDiscussion = await discussionService.voteOnAnswer(
                id,
                answerId,
                {
                    userId: user.id,
                    voteType,
                }
            );
            setDiscussion(updatedDiscussion);
        } catch (error) {
            console.error("Error voting on answer:", error);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!user || !id || !discussion) return;

        // Check if user can answer (not question author)
        if (!canUserAnswer) {
            setAnswerError("You cannot answer your own question.");
            return;
        }

        setAnswerError("");

        const validationError = validateAnswer(answerContent);
        if (validationError) {
            setAnswerError(validationError);
            return;
        }

        setSubmitting(true);
        try {
            const updatedDiscussion = await discussionService.addAnswer({
                content: answerContent.trim(),
                authorId: user.id,
                authorName: user.username,
                discussionId: id,
            });

            setDiscussion(updatedDiscussion);
            setAnswerContent("");
            setAnswerCharCount(0);
            setAnswerError("");
        } catch (error) {
            console.error("Error submitting answer:", error);
            setAnswerError("Failed to submit answer. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAnswerContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const content = event.target.value;
        setAnswerContent(content);
        setAnswerCharCount(content.length);


        if (content.length > 0) {
            const validationError = validateAnswer(content);
            setAnswerError(validationError);
        } else {
            setAnswerError("");
        }
    };

    const handleUpdateQuestion = async () => {
        if (
            !editQuestionTitle.trim() ||
            !editQuestionContent.trim() ||
            !id ||
            !discussion
        )
            return;

        try {
            const updatedDiscussion = await discussionService.updateDiscussion(id, {
                title: editQuestionTitle.trim(),
                content: editQuestionContent.trim(),
                tags: editQuestionTags,
            });

            setDiscussion(updatedDiscussion);
            setEditingQuestion(false);
        } catch (error) {
            console.error("Error updating question:", error);
        }
    };

    const handleDeleteQuestion = async () => {
        if (!id) return;

        try {
            await discussionService.deleteDiscussion(id);
            navigate("/talk");
        } catch (error) {
            console.error("Error deleting question:", error);
        }
    };

    const handleUpdateAnswer = async (answerId: string) => {
        if (!id || !discussion) return;


        const validationError = validateAnswer(editAnswerContent);
        if (validationError) {

            alert(validationError);
            return;
        }

        try {
            const updatedDiscussion = await discussionService.updateAnswer(
                id,
                answerId,
                {
                    content: editAnswerContent.trim(),
                }
            );

            setDiscussion(updatedDiscussion);
            setEditingAnswer(null);
            setEditAnswerContent("");
        } catch (error) {
            console.error("Error updating answer:", error);
            alert("Failed to update answer. Please try again.");
        }
    };

    const handleDeleteAnswer = async (answerId: string) => {
        if (!id || !discussion) return;

        try {
            const updatedDiscussion = await discussionService.deleteAnswer(
                id,
                answerId
            );
            setDiscussion(updatedDiscussion);
        } catch (error) {
            console.error("Error deleting answer:", error);
        }
    };

    const totalAnswerPages = Math.ceil(filteredAnswers.length / answersPerPage);
    const startAnswerIndex = (currentAnswerPage - 1) * answersPerPage;
    const currentAnswers = filteredAnswers.slice(
        startAnswerIndex,
        startAnswerIndex + answersPerPage
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const canEditDelete = useCallback(
        (authorId: string) => {
            return isAuthenticated && user?.id === authorId;
        },
        [isAuthenticated, user?.id]
    );

    const canVote = useCallback(
        (authorId: string) => {

            return isAuthenticated && user?.id !== authorId;
        },
        [isAuthenticated, user?.id]
    );

    const openAnswerMenu = (
        answerId: string,
        event: React.MouseEvent<HTMLElement>
    ) => {
        setAnswerMenuAnchor((prev) => ({
            ...prev,
            [answerId]: event.currentTarget,
        }));
    };

    const closeAnswerMenu = (answerId: string) => {
        setAnswerMenuAnchor((prev) => ({ ...prev, [answerId]: null }));
    };

    // Comment handlers for answers
    const handleAddComment = async (answerId: string, content: string) => {
        if (!id || !user) return;

        try {
            const updatedDiscussion = await discussionService.addComment({
                content,
                authorId: user.id,
                authorName: user.username,
                discussionId: id,
                answerId,
            });
            setDiscussion(updatedDiscussion);
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    // Comment handlers for questions
    const handleAddQuestionComment = async (content: string) => {
        if (!id || !user) return;

        try {
            const updatedDiscussion = await discussionService.addComment({
                content,
                authorId: user.id,
                authorName: user.username,
                discussionId: id,
                // No answerId - this is a question comment
            });
            setDiscussion(updatedDiscussion);
        } catch (error) {
            console.error("Error adding question comment:", error);
        }
    };

    const handleUpdateComment = async (answerId: string, commentId: string, content: string) => {
        if (!id) return;

        try {
            const updatedDiscussion = await discussionService.updateComment(
                id,
                answerId,
                commentId,
                { content }
            );
            setDiscussion(updatedDiscussion);
        } catch (error) {
            console.error("Error updating comment:", error);
        }
    };

    const handleUpdateQuestionComment = async (commentId: string, content: string) => {
        if (!id) return;

        try {
            const updatedDiscussion = await discussionService.updateComment(
                id,
                undefined, // No answerId - this is a question comment
                commentId,
                { content }
            );
            setDiscussion(updatedDiscussion);
        } catch (error) {
            console.error("Error updating question comment:", error);
        }
    };

    const handleDeleteComment = async (answerId: string, commentId: string) => {
        if (!id) return;

        try {
            const updatedDiscussion = await discussionService.deleteComment(
                id,
                answerId,
                commentId
            );
            setDiscussion(updatedDiscussion);
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const handleDeleteQuestionComment = async (commentId: string) => {
        if (!id) return;

        try {
            const updatedDiscussion = await discussionService.deleteComment(
                id,
                undefined, // No answerId - this is a question comment
                commentId
            );
            setDiscussion(updatedDiscussion);
        } catch (error) {
            console.error("Error deleting question comment:", error);
        }
    };

    const handleVoteComment = async (answerId: string, commentId: string, voteType: "upvote" | "downvote") => {
        if (!id || !user) return;

        try {
            const updatedDiscussion = await discussionService.voteOnComment(
                id,
                answerId,
                commentId,
                { userId: user.id, voteType }
            );
            setDiscussion(updatedDiscussion);
        } catch (error) {
            console.error("Error voting on comment:", error);
        }
    };

    const handleVoteQuestionComment = async (commentId: string, voteType: "upvote" | "downvote") => {
        if (!id || !user) return;

        try {
            const updatedDiscussion = await discussionService.voteOnComment(
                id,
                undefined, // No answerId - this is a question comment
                commentId,
                { userId: user.id, voteType }
            );
            setDiscussion(updatedDiscussion);
        } catch (error) {
            console.error("Error voting on question comment:", error);
        }
    };

    // Accept answer handler
    const handleAcceptAnswer = async (answerId: string) => {
        if (!id || !user || !discussion) return;

        try {
            const updatedDiscussion = await discussionService.acceptAnswer(id, {
                answerId,
                questionAuthorId: user.id,
            });
            setDiscussion(updatedDiscussion);
        } catch (error) {
            console.error("Error accepting answer:", error);
        }
    };

    // Permission checks
    const canUserAnswer = discussion ? discussionService.canUserAnswer(discussion, user?.id || "") : false;

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography>Loading...</Typography>
            </Container>
        );
    }

    if (!discussion) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography>Question not found.</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header with Back button and Ask Question button */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate("/talk")}
                >
                    Back to list
                </Button>

                {isAuthenticated && (
                    <Button
                        variant="contained"
                        onClick={() => navigate("/talk/new")}
                        sx={{
                            backgroundColor: "#0a95ff",
                            color: "#ffffff",
                            fontWeight: 700,
                            textTransform: "none",
                            borderRadius: "3px",
                            px: 2,
                            py: 1,
                            fontSize: "0.875rem",
                            boxShadow: "none",
                            "&:hover": {
                                boxShadow: "none",
                                backgroundColor: "#0074cc"
                            }
                        }}
                    >
                        Ask Question
                    </Button>
                )}
            </Stack>

            {/* Question */}
            <Paper
                elevation={0}
                sx={{
                    mb: 4,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    overflow: "hidden",
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Stack direction="row" spacing={3}>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                minWidth: 48,
                                pt: 1,
                            }}
                        >
                            <VoteButtons
                                score={discussion.score}
                                userVote={
                                    user && discussion.userVotes
                                        ? discussion.userVotes[user.id]
                                        : undefined
                                }
                                onUpvote={() => handleVoteOnQuestion("upvote")}
                                onDownvote={() => handleVoteOnQuestion("downvote")}
                                disabled={!canVote(discussion.authorId)}
                            />
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            {editingQuestion ? (
                                <Box>
                                    <TextField
                                        fullWidth
                                        label="Question Title"
                                        value={editQuestionTitle}
                                        onChange={(e) => setEditQuestionTitle(e.target.value)}
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        label="Question Content"
                                        value={editQuestionContent}
                                        onChange={(e) => setEditQuestionContent(e.target.value)}
                                        sx={{ mb: 2 }}
                                    />
                                    <TagSelector
                                        selectedTags={editQuestionTags}
                                        onTagsChange={setEditQuestionTags}
                                    />
                                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                        <Button
                                            variant="contained"
                                            onClick={handleUpdateQuestion}
                                            disabled={
                                                !editQuestionTitle.trim() || !editQuestionContent.trim()
                                            }
                                        >
                                            Save Changes
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={() => {
                                                setEditingQuestion(false);
                                                setEditQuestionTitle(discussion.title);
                                                setEditQuestionContent(discussion.content);
                                                setEditQuestionTags(discussion.tags || []);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </Stack>
                                </Box>
                            ) : (
                                <Box>
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="flex-start"
                                        sx={{ mb: 3 }}
                                    >
                                        <Typography
                                            variant="h3"
                                            component="h1"
                                            className="discussion-title"
                                            sx={{
                                                fontWeight: 700,
                                                lineHeight: 1.35,
                                                flex: 1,
                                                mr: 2,
                                                color: "text.primary",
                                                fontSize: "1.75rem",
                                            }}
                                        >
                                            {discussion.title}
                                        </Typography>

                                        {canEditDelete(discussion.authorId) && (
                                            <IconButton
                                                onClick={(e) => setQuestionMenuAnchor(e.currentTarget)}
                                                size="small"
                                                sx={{
                                                    color: "text.secondary",
                                                    "&:hover": { color: "text.primary" },
                                                }}
                                            >
                                                <MoreVert />
                                            </IconButton>
                                        )}
                                    </Stack>

                                    {/* Question metadata bar */}
                                    <Stack
                                        direction="row"
                                        spacing={2}
                                        sx={{
                                            mb: 3,
                                            pb: 2,
                                            borderBottom: "1px solid white",
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            Asked {formatDate(discussion.createdAt)}
                                        </Typography>
                                        {discussion.isEdited && discussion.updatedAt && (
                                            <Typography variant="body2" color="text.secondary">
                                                Modified {formatDate(discussion.updatedAt)}
                                            </Typography>
                                        )}
                                        <Typography variant="body2" color="text.secondary">
                                            Viewed {discussion.views} time{discussion.views !== 1 ? 's' : ''}
                                        </Typography>
                                    </Stack>

                                    <Typography
                                        variant="body1"
                                        className="discussion-content"
                                        sx={{
                                            mb: 3,
                                            lineHeight: 1.6,
                                            fontSize: "1rem",
                                            fontWeight: 600,
                                            color: "text.primary",
                                        }}
                                    >
                                        {discussion.content}
                                    </Typography>

                                    {/* Tags section - moved below content */}
                                    <Box sx={{ mb: 3 }}>
                                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                            {discussion.tags && discussion.tags.length > 0 ? (
                                                discussion.tags.map((tag: string) => (
                                                    <Chip
                                                        key={tag}
                                                        label={tag}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{
                                                            fontSize: "0.75rem",
                                                            backgroundColor: actualTheme === 'dark' ? "#1e2a3a" : "#e8f4fd",
                                                            borderColor: actualTheme === 'dark' ? "#3182ce" : "#39739d",
                                                            color: actualTheme === 'dark' ? "#63b3ed" : "#39739d",
                                                        }}
                                                    />
                                                ))
                                            ) : (
                                                <Chip
                                                    label="general"
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        fontSize: "0.75rem",
                                                        backgroundColor: actualTheme === 'dark' ? "#1e2a3a" : "#e8f4fd",
                                                        borderColor: actualTheme === 'dark' ? "#3182ce" : "#39739d",
                                                        color: actualTheme === 'dark' ? "#63b3ed" : "#39739d",
                                                    }}
                                                />
                                            )}
                                        </Stack>
                                    </Box>

                                    {/* Author info and metadata - same as Answer layout */}
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="flex-start"
                                        sx={{ mt: 2, mb: 2 }}
                                    >
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            {/* Empty space to match Answer layout */}
                                        </Stack>

                                        <Box
                                            sx={{
                                                p: 2,
                                                backgroundColor: (theme) =>
                                                    theme.palette.mode === "dark"
                                                        ? "rgba(255, 255, 255, 0.02)"
                                                        : "rgba(0, 116, 204, 0.02)",
                                                borderRadius: 1,
                                                border: (theme) => `1px solid ${theme.palette.divider}`,
                                                minWidth: 200,
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ fontSize: "0.75rem", mb: 0.5 }}
                                            >
                                                {discussion.isEdited && discussion.updatedAt
                                                    ? `edited ${formatDate(discussion.updatedAt)}`
                                                    : `asked ${formatDate(discussion.createdAt)}`}
                                            </Typography>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Box
                                                    sx={{
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: "50%",
                                                        backgroundColor: "primary.main",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <Person sx={{ fontSize: 12, color: "white" }} />
                                                </Box>
                                                <Link
                                                    to={`/user/${discussion.authorId}`}
                                                    style={{ textDecoration: 'none' }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 500,
                                                            fontSize: "0.8rem",
                                                            color: "primary.main",
                                                            '&:hover': {
                                                                textDecoration: 'underline'
                                                            }
                                                        }}
                                                    >
                                                        {discussion.authorName}
                                                    </Typography>
                                                </Link>
                                            </Stack>
                                        </Box>
                                    </Stack>

                                    {/* Comments Section - same as Answer */}
                                    <CommentSection
                                        comments={discussion.comments || []}
                                        onAddComment={handleAddQuestionComment}
                                        onUpdateComment={handleUpdateQuestionComment}
                                        onDeleteComment={handleDeleteQuestionComment}
                                        onVoteComment={handleVoteQuestionComment}
                                    />
                                </Box>
                            )}
                        </Box>
                    </Stack>
                </CardContent>
            </Paper>

            {/* Question Menu */}
            <Menu
                anchorEl={questionMenuAnchor}
                open={Boolean(questionMenuAnchor)}
                onClose={() => setQuestionMenuAnchor(null)}
            >
                <MenuItem
                    onClick={() => {
                        setEditingQuestion(true);
                        setQuestionMenuAnchor(null);
                    }}
                >
                    <Edit sx={{ mr: 1 }} /> Edit Question
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setDeleteQuestionDialog(true);
                        setQuestionMenuAnchor(null);
                    }}
                >
                    <Delete sx={{ mr: 1 }} /> Delete Question
                </MenuItem>
            </Menu>

            {/* Answers section */}
            <Box sx={{ mb: 4 }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                        mb: 3,
                        pb: 2,
                        borderBottom: "1px solid white",
                    }}
                >
                    <Typography
                        variant="h4"
                        className="discussion-header"
                        sx={{
                            fontWeight: 700,
                            fontSize: "1.5rem",
                            color: "text.primary",
                        }}
                    >
                        {discussion.answers.length === 0
                            ? "No Answer"
                            : `${discussion.answers.length} Answer${discussion.answers.length !== 1 ? 's' : ''}`}
                    </Typography>

                    {discussion.answers.length > 0 && (
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Sort by</InputLabel>
                            <Select
                                value={answerSortBy}
                                label="Sort by"
                                onChange={(e) => setAnswerSortBy(e.target.value)}
                            >
                                <MenuItem value="newest">Newest</MenuItem>
                                <MenuItem value="oldest">Oldest</MenuItem>
                                <MenuItem value="highestScore">Highest Score</MenuItem>
                                <MenuItem value="lowestScore">Lowest Score</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                </Stack>

                {discussion.answers.length === 0 ? (
                    <Alert
                        severity="info"
                        sx={{
                            mb: 3,
                            backgroundColor: (theme) =>
                                theme.palette.mode === "dark" ? "rgba(33, 150, 243, 0.08)" : "rgba(33, 150, 243, 0.04)",
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                            Share your knowledge
                        </Typography>
                        <Typography variant="body2">
                            Be the first to answer this question! Your insights could help others facing similar challenges.
                        </Typography>
                    </Alert>
                ) : (
                    <>
                        <Stack spacing={2} sx={{ mb: 4 }}>
                            {currentAnswers.map((answer: Answer) => (
                                <Paper
                                    key={answer.id}
                                    elevation={0}
                                    sx={{
                                        border: (theme) => `1px solid ${theme.palette.divider}`,
                                        borderRadius: 2,
                                        overflow: "hidden",
                                        backgroundColor: "transparent",
                                    }}
                                >
                                    <CardContent sx={{ p: 4 }}>
                                        <Stack direction="row" spacing={3}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    minWidth: 48,
                                                    pt: 1,
                                                }}
                                            >
                                                <VoteButtons
                                                    score={answer.score}
                                                    userVote={
                                                        user && answer.userVotes
                                                            ? answer.userVotes[user.id]
                                                            : undefined
                                                    }
                                                    onUpvote={() => handleVoteOnAnswer(answer.id, "upvote")}
                                                    onDownvote={() =>
                                                        handleVoteOnAnswer(answer.id, "downvote")
                                                    }
                                                    disabled={!canVote(answer.authorId)}
                                                    isAccepted={answer.isAccepted}
                                                />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                {editingAnswer === answer.id ? (
                                                    <Box>
                                                        <TextField
                                                            fullWidth
                                                            multiline
                                                            rows={4}
                                                            value={editAnswerContent}
                                                            onChange={(e) =>
                                                                setEditAnswerContent(e.target.value)
                                                            }
                                                            sx={{ mb: 2 }}
                                                        />
                                                        <Stack direction="row" spacing={2}>
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                onClick={() => handleUpdateAnswer(answer.id)}
                                                                disabled={!editAnswerContent.trim()}
                                                            >
                                                                Save Changes
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={() => {
                                                                    setEditingAnswer(null);
                                                                    setEditAnswerContent("");
                                                                }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </Stack>
                                                    </Box>
                                                ) : (
                                                    <Box>
                                                        <Stack
                                                            direction="row"
                                                            justifyContent="space-between"
                                                            alignItems="flex-start"
                                                            sx={{ mb: 3 }}
                                                        >
                                                            <Typography
                                                                variant="body1"
                                                                className="discussion-content"
                                                                sx={{
                                                                    lineHeight: 1.6,
                                                                    flex: 1,
                                                                    mr: 2,
                                                                    fontSize: "1rem",
                                                                    fontWeight: 600,
                                                                    color: "text.primary",
                                                                }}
                                                            >
                                                                {answer.content}
                                                            </Typography>

                                                            {canEditDelete(answer.authorId) && (
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(e) => openAnswerMenu(answer.id, e)}
                                                                    sx={{
                                                                        color: "text.secondary",
                                                                        "&:hover": { color: "text.primary" },
                                                                    }}
                                                                >
                                                                    <MoreVert />
                                                                </IconButton>
                                                            )}
                                                        </Stack>

                                                        {/* Accept Answer Button and Answer Actions */}
                                                        <Stack
                                                            direction="row"
                                                            justifyContent="space-between"
                                                            alignItems="flex-start"
                                                            sx={{ mt: 2, mb: 2 }}
                                                        >
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                {/* Accept Answer Button (only for question author) */}
                                                                {user?.id === discussion.authorId && !answer.isAccepted && (
                                                                    <Button
                                                                        size="small"
                                                                        variant="outlined"
                                                                        color="success"
                                                                        startIcon={<CheckCircle />}
                                                                        onClick={() => handleAcceptAnswer(answer.id)}
                                                                        sx={{
                                                                            borderColor: 'success.main',
                                                                            color: 'success.main',
                                                                            '&:hover': {
                                                                                backgroundColor: 'success.main',
                                                                                color: 'white',
                                                                            }
                                                                        }}
                                                                    >
                                                                        Accept Answer
                                                                    </Button>
                                                                )}
                                                            </Stack>

                                                            <Box
                                                                sx={{
                                                                    p: 2,
                                                                    backgroundColor: (theme) =>
                                                                        theme.palette.mode === "dark"
                                                                            ? "rgba(255, 255, 255, 0.02)"
                                                                            : "rgba(0, 116, 204, 0.02)",
                                                                    borderRadius: 1,
                                                                    border: (theme) => `1px solid ${theme.palette.divider}`,
                                                                    minWidth: 200,
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    sx={{ fontSize: "0.75rem", mb: 0.5 }}
                                                                >
                                                                    {answer.isEdited && answer.updatedAt
                                                                        ? `edited ${formatDate(answer.updatedAt)}`
                                                                        : `answered ${formatDate(answer.createdAt)}`}
                                                                </Typography>
                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    <Box
                                                                        sx={{
                                                                            width: 20,
                                                                            height: 20,
                                                                            borderRadius: "50%",
                                                                            backgroundColor: "primary.main",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                        }}
                                                                    >
                                                                        <Person sx={{ fontSize: 12, color: "white" }} />
                                                                    </Box>
                                                                    <Link
                                                                        to={`/user/${answer.authorId}`}
                                                                        style={{ textDecoration: 'none' }}
                                                                    >
                                                                        <Typography
                                                                            variant="body2"
                                                                            sx={{
                                                                                fontWeight: 500,
                                                                                fontSize: "0.8rem",
                                                                                color: "primary.main",
                                                                                '&:hover': {
                                                                                    textDecoration: 'underline'
                                                                                }
                                                                            }}
                                                                        >
                                                                            {answer.authorName}
                                                                        </Typography>
                                                                    </Link>
                                                                </Stack>
                                                            </Box>
                                                        </Stack>

                                                        {/* Comments Section */}
                                                        <CommentSection
                                                            comments={answer.comments || []}
                                                            onAddComment={(content) => handleAddComment(answer.id, content)}
                                                            onUpdateComment={(commentId, content) => handleUpdateComment(answer.id, commentId, content)}
                                                            onDeleteComment={(commentId) => handleDeleteComment(answer.id, commentId)}
                                                            onVoteComment={(commentId, voteType) => handleVoteComment(answer.id, commentId, voteType)}
                                                        />
                                                    </Box>
                                                )}

                                                {/* Answer Menu */}
                                                <Menu
                                                    anchorEl={answerMenuAnchor[answer.id]}
                                                    open={Boolean(answerMenuAnchor[answer.id])}
                                                    onClose={() => closeAnswerMenu(answer.id)}
                                                >
                                                    <MenuItem
                                                        onClick={() => {
                                                            setEditingAnswer(answer.id);
                                                            setEditAnswerContent(answer.content);
                                                            closeAnswerMenu(answer.id);
                                                        }}
                                                    >
                                                        <Edit sx={{ mr: 1 }} /> Edit Answer
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={() => {
                                                            setDeleteAnswerDialog(answer.id);
                                                            closeAnswerMenu(answer.id);
                                                        }}
                                                    >
                                                        <Delete sx={{ mr: 1 }} /> Delete Answer
                                                    </MenuItem>
                                                </Menu>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Paper>
                            ))}
                        </Stack>

                        {/* Answer Pagination */}
                        {totalAnswerPages > 1 && (
                            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                                <Pagination
                                    count={totalAnswerPages}
                                    page={currentAnswerPage}
                                    onChange={(_, value) => setCurrentAnswerPage(value)}
                                    color="primary"
                                    size="medium"
                                />
                            </Box>
                        )}
                    </>
                )}
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Answer form */}
            {isAuthenticated && canUserAnswer ? (
                <Box sx={{ mt: 4 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            borderRadius: 2,
                        }}
                    >
                        <CardContent sx={{ p: 4 }}>
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 1,
                                    fontWeight: 400,
                                    fontSize: "1.375rem",
                                    color: "text.primary",
                                }}
                            >
                                Your Answer
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 3 }}
                            >
                                Thanks for contributing an answer! Please be sure the answer is correct and provides helpful information.
                            </Typography>

                            <TextField
                                fullWidth
                                multiline
                                rows={8}
                                placeholder="Write your answer here... Include relevant details, examples, and explanations. Minimum 10 characters."
                                value={answerContent}
                                onChange={handleAnswerContentChange}
                                error={Boolean(answerError)}
                                helperText={
                                    answerError ||
                                    `${answerCharCount}/2000 characters`
                                }
                                sx={{
                                    mb: 3,
                                    "& .MuiOutlinedInput-root": {
                                        fontSize: "0.9rem",
                                        lineHeight: 1.6,
                                        "&:hover fieldset": {
                                            borderColor: "primary.main",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderWidth: "2px",
                                        },
                                    },
                                }}
                            />

                            {answerError && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 3,
                                        borderRadius: 1,
                                        border: (theme) => `1px solid ${theme.palette.error.main}`,
                                    }}
                                >
                                    {answerError}
                                </Alert>
                            )}

                            {/* Writing tips */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2,
                                    mb: 3,
                                    backgroundColor: (theme) =>
                                        theme.palette.mode === "dark"
                                            ? "rgba(33, 150, 243, 0.08)"
                                            : "rgba(33, 150, 243, 0.04)",
                                    border: (theme) => `1px solid ${theme.palette.divider}`,
                                    borderRadius: 1,
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: 600,
                                        mb: 1,
                                        fontSize: "0.875rem",
                                        color: "primary.main"
                                    }}
                                >
                                    💡 Tips for a great answer
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontSize: "0.8rem",
                                        color: "text.secondary",
                                        lineHeight: 1.5
                                    }}
                                >
                                    • Be specific and provide concrete examples<br />
                                    • Explain your reasoning and show your work<br />
                                    • Include relevant code, links, or resources when helpful<br />
                                    • Stay focused on answering the question asked
                                </Typography>
                            </Paper>

                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<Send />}
                                    onClick={handleSubmitAnswer}
                                    disabled={submitting || Boolean(answerError)}
                                    sx={{
                                        px: 3,
                                        py: 1.5,
                                        fontSize: "0.95rem",
                                        fontWeight: 500,
                                        borderRadius: 1,
                                    }}
                                >
                                    {submitting ? "Publishing..." : "Post Your Answer"}
                                </Button>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontSize: "0.8rem" }}
                                >
                                    By posting your answer, you agree to our terms of service
                                </Typography>
                            </Box>
                        </CardContent>
                    </Paper>
                </Box>
            ) : isAuthenticated && !canUserAnswer ? (
                <Alert
                    severity="info"
                    sx={{
                        mt: 4,
                        backgroundColor: (theme) =>
                            theme.palette.mode === "dark"
                                ? "rgba(255, 193, 7, 0.08)"
                                : "rgba(255, 193, 7, 0.04)",
                        border: (theme) => `1px solid ${theme.palette.warning.main}`,
                        borderRadius: 1,
                    }}
                >
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                        You cannot answer your own question
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        As the author of this question, you cannot provide an answer. You can edit your question to add more details or accept answers from other users.
                    </Typography>
                </Alert>
            ) : (
                <Alert
                    severity="info"
                    sx={{
                        mt: 4,
                        backgroundColor: (theme) =>
                            theme.palette.mode === "dark"
                                ? "rgba(33, 150, 243, 0.08)"
                                : "rgba(33, 150, 243, 0.04)",
                        border: (theme) => `1px solid ${theme.palette.primary.main}`,
                        borderRadius: 1,
                    }}
                >
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                        Want to improve this post? Add your answer!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Please <strong>log in</strong> to post an answer to this question.
                    </Typography>
                </Alert>
            )}

            {/* Delete Question Dialog */}
            <Dialog
                open={deleteQuestionDialog}
                onClose={() => setDeleteQuestionDialog(false)}
            >
                <DialogTitle>Delete Question</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this question? This action cannot be
                        undone. All answers will also be deleted.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteQuestionDialog(false)}>Cancel</Button>
                    <Button
                        onClick={() => {
                            handleDeleteQuestion();
                            setDeleteQuestionDialog(false);
                        }}
                        color="error"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Answer Dialog */}
            <Dialog
                open={Boolean(deleteAnswerDialog)}
                onClose={() => setDeleteAnswerDialog(null)}
            >
                <DialogTitle>Delete Answer</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this answer? This action cannot be
                        undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteAnswerDialog(null)}>Cancel</Button>
                    <Button
                        onClick={() => {
                            if (deleteAnswerDialog) {
                                handleDeleteAnswer(deleteAnswerDialog);
                                setDeleteAnswerDialog(null);
                            }
                        }}
                        color="error"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DiscussionDetail;