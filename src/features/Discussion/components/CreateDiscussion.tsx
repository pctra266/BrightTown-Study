import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    TextField,
    Stack,
    Alert,
    Paper,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import {
    ArrowBack,
    Send,
    HelpOutline,
    CheckCircleOutline,
    LightbulbOutlined,
    FormatQuoteOutlined,
    CodeOutlined
} from "@mui/icons-material";
import { useAuth } from "../../../contexts/AuthContext";
import { discussionService } from "../services/DiscussionService";
import TagSelector from "./TagSelector";
import { MAX_TAGS_PER_DISCUSSION } from "../constants/tags";
const CreateDiscussion = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [titleError, setTitleError] = useState("");
    const [contentError, setContentError] = useState("");
    const [tagsError, setTagsError] = useState("");
    const [titleCharCount, setTitleCharCount] = useState(0);
    const [contentCharCount, setContentCharCount] = useState(0);


    const validateTitle = (titleText: string): string => {
        const trimmedTitle = titleText.trim();

        if (!trimmedTitle) {
            return "Title cannot be empty.";
        }

        if (trimmedTitle.length < 5) {
            return "Title must be at least 5 characters long.";
        }

        if (trimmedTitle.length > 200) {
            return "Title cannot exceed 200 characters.";
        }


        const wordCount = trimmedTitle.split(/\s+/).length;
        if (wordCount < 2) {
            return "Title must contain at least 2 words.";
        }


        const repeatedCharsPattern = /(.)\1{4,}/;
        if (repeatedCharsPattern.test(trimmedTitle)) {
            return "Title contains too many repeated characters.";
        }

        return "";
    };

    const validateContent = (contentText: string): string => {
        const trimmedContent = contentText.trim();

        if (!trimmedContent) {
            return "Content cannot be empty.";
        }

        if (trimmedContent.length < 20) {
            return "Content must be at least 20 characters long.";
        }

        if (trimmedContent.length > 5000) {
            return "Content cannot exceed 5000 characters.";
        }


        const wordCount = trimmedContent.split(/\s+/).length;
        if (wordCount < 5) {
            return "Content must contain at least 5 words.";
        }


        const repeatedCharsPattern = /(.)\1{9,}/;
        if (repeatedCharsPattern.test(trimmedContent)) {
            return "Content contains too many repeated characters.";
        }

        return "";
    };

    const validateTags = (tagList: string[]): string => {
        if (tagList.length === 0) {
            return "Please select at least one tag to help categorize your question.";
        }

        if (tagList.length > MAX_TAGS_PER_DISCUSSION) {
            return `You can select a maximum of ${MAX_TAGS_PER_DISCUSSION} tags.`;
        }

        return "";
    };


    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = event.target.value;
        setTitle(newTitle);
        setTitleCharCount(newTitle.length);


        if (newTitle.length > 0) {
            const validationError = validateTitle(newTitle);
            setTitleError(validationError);
        } else {
            setTitleError("");
        }


        if (error) {
            setError("");
        }
    };

    const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = event.target.value;
        setContent(newContent);
        setContentCharCount(newContent.length);


        if (newContent.length > 0) {
            const validationError = validateContent(newContent);
            setContentError(validationError);
        } else {
            setContentError("");
        }


        if (error) {
            setError("");
        }
    };

    const handleTagsChange = (newTags: string[]) => {
        setTags(newTags);

        // Validate tags
        const validationError = validateTags(newTags);
        setTagsError(validationError);

        // Clear general error if any
        if (error) {
            setError("");
        }
    };

    const handleSubmit = async () => {

        setError("");
        setTitleError("");
        setContentError("");
        setTagsError("");


        const titleValidationError = validateTitle(title);
        const contentValidationError = validateContent(content);
        const tagsValidationError = validateTags(tags);

        if (titleValidationError) {
            setTitleError(titleValidationError);
        }

        if (contentValidationError) {
            setContentError(contentValidationError);
        }

        if (tagsValidationError) {
            setTagsError(tagsValidationError);
        }


        if (titleValidationError || contentValidationError || tagsValidationError) {
            return;
        }

        if (!user) {
            setError("You must be logged in to ask questions.");
            return;
        }


        if (user.role !== "2" && user.role !== "1") {
            setError("You don't have permission to ask questions.");
            return;
        }

        setSubmitting(true);

        try {
            const newDiscussion = await discussionService.createDiscussion({
                title: title.trim(),
                content: content.trim(),
                authorId: user.id,
                authorName: user.username,
                tags: tags,
            });

            navigate(`/talk/${newDiscussion.id}`);
        } catch (error) {
            console.error("Error creating discussion:", error);
            setError(
                "An error occurred while posting the question. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        navigate("/talk", { state: { refresh: true } });
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Back button */}
            <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mb: 3 }}>
                Back to questions
            </Button>

            <Box sx={{ display: "flex", gap: 4, flexDirection: { xs: "column", md: "row" } }}>
                {/* Main form */}
                <Box sx={{ flex: 1 }}>
                    <Card elevation={0} sx={{ border: 1, borderColor: "divider" }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography
                                variant="h4"
                                component="h1"
                                sx={{
                                    mb: 1,
                                    fontWeight: 400,
                                    fontSize: "1.75rem",
                                    color: "text.primary"
                                }}
                            >
                                Ask a public question
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 4 }}
                            >
                                Get help from the community by asking a clear, detailed question.
                            </Typography>

                            {error && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 3,
                                        borderRadius: 1,
                                        border: 1,
                                        borderColor: "error.main"
                                    }}
                                >
                                    {error}
                                </Alert>
                            )}

                            <Stack spacing={4}>
                                {/* Title Section */}
                                <Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            mb: 1,
                                            fontWeight: 600,
                                            fontSize: "1.125rem"
                                        }}
                                    >
                                        Title
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mb: 2 }}
                                    >
                                        Be specific and imagine you're asking a question to another person.
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="e.g. How can I effectively use flashcards for vocabulary learning?"
                                        value={title}
                                        onChange={handleTitleChange}
                                        error={Boolean(titleError)}
                                        helperText={
                                            titleError ||
                                            `${titleCharCount}/200 characters`
                                        }
                                        required
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                fontSize: "1rem",
                                                "&:hover fieldset": {
                                                    borderColor: "primary.main",
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderWidth: "2px",
                                                },
                                            },
                                        }}
                                    />
                                    {titleError && (
                                        <Alert
                                            severity="error"
                                            sx={{
                                                mt: 1,
                                                borderRadius: 1,
                                                fontSize: "0.875rem"
                                            }}
                                        >
                                            {titleError}
                                        </Alert>
                                    )}
                                </Box>

                                {/* Content Section */}
                                <Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            mb: 1,
                                            fontWeight: 600,
                                            fontSize: "1.125rem"
                                        }}
                                    >
                                        What are the details of your problem?
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mb: 2 }}
                                    >
                                        Introduce the problem and expand on what you put in the title.
                                        Minimum 20 characters.
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={10}
                                        placeholder="Provide context, what you've tried, specific challenges you're facing, and what kind of help you're looking for..."
                                        value={content}
                                        onChange={handleContentChange}
                                        error={Boolean(contentError)}
                                        helperText={
                                            contentError ||
                                            `${contentCharCount}/5000 characters`
                                        }
                                        required
                                        sx={{
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
                                    {contentError && (
                                        <Alert
                                            severity="error"
                                            sx={{
                                                mt: 1,
                                                borderRadius: 1,
                                                fontSize: "0.875rem"
                                            }}
                                        >
                                            {contentError}
                                        </Alert>
                                    )}
                                </Box>

                                {/* Tags Section */}
                                <Box>
                                    <TagSelector
                                        selectedTags={tags}
                                        onTagsChange={handleTagsChange}
                                        error={tagsError}
                                    />
                                </Box>

                                <Divider />

                                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-start" }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<Send />}
                                        onClick={handleSubmit}
                                        disabled={submitting || Boolean(titleError) || Boolean(contentError) || Boolean(tagsError)}
                                        sx={{
                                            px: 3,
                                            py: 1.5,
                                            fontSize: "0.95rem",
                                            fontWeight: 500,
                                            borderRadius: 1,
                                        }}
                                    >
                                        {submitting ? "Publishing..." : "Post your question"}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        onClick={handleBack}
                                        disabled={submitting}
                                        sx={{
                                            px: 3,
                                            py: 1.5,
                                            fontSize: "0.95rem",
                                            borderRadius: 1,
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>

                {/* Sidebar with tips */}
                <Box sx={{ width: { xs: "100%", md: "300px" } }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            border: 1,
                            borderColor: "divider",
                            backgroundColor: (theme) =>
                                theme.palette.mode === "dark"
                                    ? "rgba(255, 255, 255, 0.02)"
                                    : "rgba(0, 116, 204, 0.02)",
                            borderRadius: 2,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <HelpOutline sx={{ mr: 1, color: "primary.main" }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
                                Writing a good question
                            </Typography>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            You're ready to ask a programming-related question and this form will help guide you through the process.
                        </Typography>

                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: "0.875rem" }}>
                            Steps to get the best answers:
                        </Typography>

                        <List dense sx={{ pl: 0 }}>
                            <ListItem sx={{ py: 0.5, px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 28 }}>
                                    <CheckCircleOutline sx={{ fontSize: 16, color: "success.main" }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Summarize your problem in a one-line title"
                                    primaryTypographyProps={{ fontSize: "0.8rem" }}
                                />
                            </ListItem>
                            <ListItem sx={{ py: 0.5, px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 28 }}>
                                    <CheckCircleOutline sx={{ fontSize: 16, color: "success.main" }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Describe your problem in more detail"
                                    primaryTypographyProps={{ fontSize: "0.8rem" }}
                                />
                            </ListItem>
                            <ListItem sx={{ py: 0.5, px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 28 }}>
                                    <CheckCircleOutline sx={{ fontSize: 16, color: "success.main" }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Describe what you tried and what you expected to happen"
                                    primaryTypographyProps={{ fontSize: "0.8rem" }}
                                />
                            </ListItem>
                            <ListItem sx={{ py: 0.5, px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 28 }}>
                                    <CheckCircleOutline sx={{ fontSize: 16, color: "success.main" }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Add relevant tags to help others find your question"
                                    primaryTypographyProps={{ fontSize: "0.8rem" }}
                                />
                            </ListItem>
                        </List>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            mt: 3,
                            border: 1,
                            borderColor: "divider",
                            backgroundColor: (theme) =>
                                theme.palette.mode === "dark"
                                    ? "rgba(255, 193, 7, 0.08)"
                                    : "rgba(255, 193, 7, 0.08)",
                            borderRadius: 2,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <LightbulbOutlined sx={{ mr: 1, color: "warning.main" }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
                                Tips for success
                            </Typography>
                        </Box>

                        <List dense sx={{ pl: 0 }}>
                            <ListItem sx={{ py: 0.5, px: 0, alignItems: "flex-start" }}>
                                <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                                    <FormatQuoteOutlined sx={{ fontSize: 16, color: "warning.main" }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Make your title specific and describe the problem clearly"
                                    primaryTypographyProps={{ fontSize: "0.8rem" }}
                                />
                            </ListItem>
                            <ListItem sx={{ py: 0.5, px: 0, alignItems: "flex-start" }}>
                                <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                                    <CodeOutlined sx={{ fontSize: 16, color: "warning.main" }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Include relevant code, configuration, or examples"
                                    primaryTypographyProps={{ fontSize: "0.8rem" }}
                                />
                            </ListItem>
                            <ListItem sx={{ py: 0.5, px: 0, alignItems: "flex-start" }}>
                                <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                                    <HelpOutline sx={{ fontSize: 16, color: "warning.main" }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Explain what you've already tried and what didn't work"
                                    primaryTypographyProps={{ fontSize: "0.8rem" }}
                                />
                            </ListItem>
                        </List>
                    </Paper>
                </Box>
            </Box>
        </Container>
    );
};

export default CreateDiscussion;