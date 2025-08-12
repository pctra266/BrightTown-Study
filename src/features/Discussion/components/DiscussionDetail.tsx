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
    EditNote,
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

        switch (answerSortBy) {
            case "newest":
                sorted.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                break;
            case "oldest":
                sorted.sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
                break;
            case "highestScore":
                sorted.sort((a, b) => b.score - a.score);
                break;
            case "lowestScore":
                sorted.sort((a, b) => a.score - b.score);
                break;
        }

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
            {/* Back button */}
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate("/talk")}
                sx={{ mb: 3 }}
            >
                Back to list
            </Button>

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
                                            sx={{
                                                fontWeight: 400,
                                                lineHeight: 1.35,
                                                flex: 1,
                                                mr: 2,
                                                color: "text.primary",
                                                fontSize: "1.75rem",
                                            }}
                                        >
                                            {discussion.title}
                                            {discussion.isEdited && (
                                                <Chip
                                                    icon={<EditNote />}
                                                    label="edited"
                                                    size="small"
                                                    sx={{
                                                        ml: 2,
                                                        fontSize: "0.7rem",
                                                        backgroundColor: actualTheme === 'dark' ? '#fd8500' : '#fb8500',
                                                        color: '#ffffff',
                                                        border: 'none',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            )}
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
                                            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
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
                                        sx={{
                                            mb: 4,
                                            lineHeight: 1.6,
                                            fontSize: "1rem",
                                            color: "text.primary",
                                        }}
                                    >
                                        {discussion.content}
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-end",
                                            flexWrap: "wrap",
                                            gap: 2,
                                        }}
                                    >
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
                                    </Box>
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
                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 400,
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
                            {currentAnswers.map((answer: Answer, index: number) => (
                                <Paper
                                    key={answer.id}
                                    elevation={0}
                                    sx={{
                                        border: (theme) => `1px solid ${theme.palette.divider}`,
                                        borderRadius: 2,
                                        overflow: "hidden",
                                        backgroundColor: (theme) =>
                                            index === 0 && answer.score > 0
                                                ? theme.palette.mode === "dark"
                                                    ? "rgba(94, 186, 125, 0.03)"
                                                    : "rgba(94, 186, 125, 0.02)"
                                                : "transparent",
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
                                                                sx={{
                                                                    lineHeight: 1.6,
                                                                    flex: 1,
                                                                    mr: 2,
                                                                    fontSize: "1rem",
                                                                    color: "text.primary",
                                                                }}
                                                            >
                                                                {answer.content}
                                                                {answer.isEdited && (
                                                                    <Chip
                                                                        icon={<EditNote />}
                                                                        label="edited"
                                                                        size="small"
                                                                        sx={{
                                                                            ml: 1,
                                                                            fontSize: "0.65rem",
                                                                            backgroundColor: actualTheme === 'dark' ? '#fd8500' : '#fb8500',
                                                                            color: '#ffffff',
                                                                            border: 'none',
                                                                            fontWeight: 'bold'
                                                                        }}
                                                                    />
                                                                )}
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

                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                justifyContent: "flex-end",
                                                                mt: 2,
                                                            }}
                                                        >
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
                                                        </Box>
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
            {isAuthenticated ? (
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