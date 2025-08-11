import { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    Chip,
    Stack,
    Pagination,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import {
    Add as AddIcon,
    EditNote,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { discussionService } from "../services/DiscussionService";

interface Discussion {
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
    answers: any[];
}

const DiscussionHub = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [filteredDiscussions, setFilteredDiscussions] = useState<Discussion[]>(
        []
    );
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const discussionsPerPage = 5;

    useEffect(() => {
        loadDiscussions();
    }, []);


    useEffect(() => {
        if (location.state?.refresh) {
            loadDiscussions();

            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        filterAndSortDiscussions();
    }, [discussions, searchTerm, sortBy]);

    const loadDiscussions = async () => {
        try {
            const data = await discussionService.getAllDiscussions();
            setDiscussions(data);
        } catch (error) {
            console.error("Error loading discussions:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortDiscussions = () => {
        let filtered = discussions.filter(
            (discussion) =>
                discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                discussion.content.toLowerCase().includes(searchTerm.toLowerCase())
        );

        switch (sortBy) {
            case "newest":
                filtered.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                break;
            case "oldest":
                filtered.sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
                break;
            case "mostAnswers":
                filtered.sort((a, b) => b.answers.length - a.answers.length);
                break;
            case "mostViews":
                filtered.sort((a, b) => b.views - a.views);
                break;
            case "highestScore":
                filtered.sort((a, b) => b.score - a.score);
                break;
            case "unanswered":
                filtered = filtered.filter(
                    (discussion) => discussion.answers.length === 0
                );
                break;
        }

        setFilteredDiscussions(filtered);
        setCurrentPage(1);
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

    const handleDiscussionClick = (id: string) => {
        navigate(`/talk/${id}`);
    };

    const handleCreateQuestion = () => {
        navigate("/talk/new");
    };


    const totalPages = Math.ceil(filteredDiscussions.length / discussionsPerPage);
    const startIndex = (currentPage - 1) * discussionsPerPage;
    const currentDiscussions = filteredDiscussions.slice(
        startIndex,
        startIndex + discussionsPerPage
    );

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography>Loading...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 3 }}
                >
                    <Box>
                        <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
                            All Questions
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            {filteredDiscussions.length} question{filteredDiscussions.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                    {isAuthenticated && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateQuestion}
                            size="large"
                            sx={{ 
                                minWidth: "160px",
                                backgroundColor: "#0074cc",
                                "&:hover": { backgroundColor: "#0063c1" }
                            }}
                        >
                            Ask Question
                        </Button>
                    )}
                </Stack>

                {!isAuthenticated && (
                    <Box sx={{ p: 2, bgcolor: "info.light", borderRadius: 1, mb: 3 }}>
                        <Typography variant="body2" color="info.contrastText">
                            You need to log in to ask questions and answer questions.
                        </Typography>
                    </Box>
                )}

                {/* Enhanced Filter Section */}
                <Box sx={{ mb: 3 }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
                        <Box sx={{ flex: 1 }}>
                            <TextField
                                fullWidth
                                placeholder="Search for questions, answers, and tags..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                size="small"
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: "white"
                                    }
                                }}
                            />
                        </Box>
                        <Box sx={{ minWidth: { xs: "100%", md: "200px" } }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Sort by</InputLabel>
                                <Select
                                    value={sortBy}
                                    label="Sort by"
                                    onChange={(e) => setSortBy(e.target.value)}
                                    sx={{ backgroundColor: "white" }}
                                >
                                    <MenuItem value="newest">Newest</MenuItem>
                                    <MenuItem value="oldest">Oldest</MenuItem>
                                    <MenuItem value="mostAnswers">Most Answers</MenuItem>
                                    <MenuItem value="mostViews">Most Views</MenuItem>
                                    <MenuItem value="highestScore">Highest Score</MenuItem>
                                    <MenuItem value="unanswered">Unanswered</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Stack>
                </Box>

                {/* Filter Tags */}
                <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1, lineHeight: 2.5 }}>
                            Filter by tags:
                        </Typography>
                        {['general', 'study', 'flashcards', 'learning', 'tips'].map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant="outlined"
                                clickable
                                sx={{
                                    backgroundColor: "white",
                                    borderColor: "primary.200",
                                    "&:hover": {
                                        backgroundColor: "primary.50",
                                        borderColor: "primary.main"
                                    }
                                }}
                            />
                        ))}
                    </Stack>
                </Box>
            </Box>

            {/* Questions List - Stack Overflow Style */}
            <Box sx={{ mb: 4 }}>
                {currentDiscussions.length === 0 ? (
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        textAlign="center"
                        sx={{ py: 4 }}
                    >
                        No questions found.
                    </Typography>
                ) : (
                    <Stack spacing={0}>
                        {currentDiscussions.map((discussion) => (
                            <Card
                                key={discussion.id}
                                variant="outlined"
                                sx={{
                                    cursor: "pointer",
                                    "&:hover": { 
                                        bgcolor: "action.hover",
                                        borderColor: "primary.main"
                                    },
                                    transition: "all 0.2s",
                                    borderRadius: 0,
                                    borderBottom: discussion.id === currentDiscussions[currentDiscussions.length - 1].id ? undefined : "none",
                                }}
                                onClick={() => handleDiscussionClick(discussion.id)}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Stack direction="row" spacing={3}>
                                        {/* Stats Column - Stack Overflow Style */}
                                        <Box sx={{ 
                                            minWidth: { xs: "auto", sm: "120px" },
                                            display: "flex",
                                            flexDirection: { xs: "row", sm: "column" },
                                            gap: { xs: 3, sm: 2 },
                                            alignItems: "center",
                                            justifyContent: { xs: "space-around", sm: "center" },
                                            py: { xs: 1, sm: 2 }
                                        }}>
                                            {/* Votes */}
                                            <Stack alignItems="center" spacing={0.5}>
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        fontWeight: "bold",
                                                        color: discussion.score > 0 ? "success.main" : 
                                                               discussion.score < 0 ? "error.main" : "text.primary"
                                                    }}
                                                >
                                                    {discussion.score}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {Math.abs(discussion.score) === 1 ? "vote" : "votes"}
                                                </Typography>
                                            </Stack>

                                            {/* Answers */}
                                            <Stack alignItems="center" spacing={0.5}>
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ 
                                                        fontWeight: "bold",
                                                        color: discussion.answers.length > 0 ? "primary.main" : "text.primary",
                                                        backgroundColor: discussion.answers.length > 0 ? "primary.50" : "transparent",
                                                        px: discussion.answers.length > 0 ? 1 : 0,
                                                        borderRadius: discussion.answers.length > 0 ? 1 : 0
                                                    }}
                                                >
                                                    {discussion.answers.length}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {discussion.answers.length === 1 ? "answer" : "answers"}
                                                </Typography>
                                            </Stack>

                                            {/* Views */}
                                            <Stack alignItems="center" spacing={0.5}>
                                                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                                    {discussion.views}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {discussion.views === 1 ? "view" : "views"}
                                                </Typography>
                                            </Stack>
                                        </Box>

                                        {/* Question Content */}
                                        <Box sx={{ flex: 1 }}>
                                            <Stack spacing={2}>
                                                {/* Title */}
                                                <Typography
                                                    variant="h6"
                                                    component="h3"
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        color: "primary.main",
                                                        "&:hover": { color: "primary.dark" },
                                                        lineHeight: 1.3
                                                    }}
                                                >
                                                    {discussion.title}
                                                    {discussion.isEdited && (
                                                        <Chip
                                                            icon={<EditNote />}
                                                            label="Edited"
                                                            size="small"
                                                            color="secondary"
                                                            sx={{ ml: 1, fontSize: "0.7rem" }}
                                                        />
                                                    )}
                                                </Typography>

                                                {/* Content Preview */}
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: "vertical",
                                                        overflow: "hidden",
                                                        lineHeight: 1.5
                                                    }}
                                                >
                                                    {discussion.content}
                                                </Typography>

                                                {/* Tags and Metadata */}
                                                <Box>
                                                    <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap">
                                                        {/* Sample tags - these would come from the discussion data */}
                                                        {(discussion.tags || ['general', 'study']).map((tag) => (
                                                            <Chip
                                                                key={tag}
                                                                label={tag}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{
                                                                    backgroundColor: "#e8f4fd",
                                                                    borderColor: "#39739d",
                                                                    color: "#39739d",
                                                                    fontSize: "0.75rem",
                                                                    height: 24,
                                                                    "&:hover": {
                                                                        backgroundColor: "#d4e9f7"
                                                                    }
                                                                }}
                                                            />
                                                        ))}
                                                    </Stack>

                                                    {/* Author and Date */}
                                                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                                                        <Box sx={{ textAlign: "right" }}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                asked {formatDate(discussion.createdAt)}
                                                            </Typography>
                                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                    {discussion.authorName}
                                                                </Typography>
                                                            </Stack>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Box>

            {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(_, value) => setCurrentPage(value)}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}

        </Container>
    );
};

export default DiscussionHub;