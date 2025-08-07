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
} from "@mui/material";
import { ArrowBack, Send } from "@mui/icons-material";
import { useAuth } from "../../../contexts/AuthContext";
import { discussionService } from "../services/DiscussionService";
const CreateDiscussion = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [titleError, setTitleError] = useState("");
    const [contentError, setContentError] = useState("");
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

    const handleContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleSubmit = async () => {

        setError("");
        setTitleError("");
        setContentError("");


        const titleValidationError = validateTitle(title);
        const contentValidationError = validateContent(content);

        if (titleValidationError) {
            setTitleError(titleValidationError);
        }

        if (contentValidationError) {
            setContentError(contentValidationError);
        }


        if (titleValidationError || contentValidationError) {
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
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Back button */}
            <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mb: 3 }}>
                Back to list
            </Button>

            <Card>
                <CardContent>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{ mb: 3, fontWeight: 600 }}
                    >
                        Ask New Question
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="Question Title"
                            placeholder="Enter your question title... (minimum 5 characters, 2 words)"
                            value={title}
                            onChange={handleTitleChange}
                            error={Boolean(titleError)}
                            helperText={
                                titleError ||
                                `${titleCharCount}/200 characters`
                            }
                            required
                        />

                        {titleError && (
                            <Alert severity="error" sx={{ mt: 1 }}>
                                {titleError}
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            multiline
                            rows={8}
                            label="Question Content"
                            placeholder="Describe your question in detail... (minimum 20 characters, 5 words)"
                            value={content}
                            onChange={handleContentChange}
                            error={Boolean(contentError)}
                            helperText={
                                contentError ||
                                `${contentCharCount}/5000 characters`
                            }
                            required
                        />

                        {contentError && (
                            <Alert severity="error" sx={{ mt: 1 }}>
                                {contentError}
                            </Alert>
                        )}

                        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                            <Button
                                variant="outlined"
                                onClick={handleBack}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Send />}
                                onClick={handleSubmit}
                                disabled={submitting || Boolean(titleError) || Boolean(contentError)}
                            >
                                {submitting ? "Posting..." : "Post Question"}
                            </Button>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    );
};

export default CreateDiscussion;