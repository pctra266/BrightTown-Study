import { useState, useEffect, useCallback } from "react";
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
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useThemeMode } from "../../../contexts/ThemeContext";
import { discussionService } from "../services/DiscussionService";
import { PREDEFINED_TAGS } from "../constants/tags";

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
    answers: unknown[];
    tags?: string[];
}

const DiscussionHub = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { actualTheme } = useThemeMode();
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [filteredDiscussions, setFilteredDiscussions] = useState<Discussion[]>(
        []
    );
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [selectedTagFilter, setSelectedTagFilter] = useState<string[]>([]);
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

    const filterAndSortDiscussions = useCallback(() => {
        let filtered = discussions.filter((discussion) => {
            // Text search filter
            const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                discussion.content.toLowerCase().includes(searchTerm.toLowerCase());

            // Tag filter
            const matchesTag = selectedTagFilter.length === 0 ||
                (discussion.tags && discussion.tags.some(tag => selectedTagFilter.includes(tag)));

            return matchesSearch && matchesTag;
        });

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
    }, [discussions, searchTerm, sortBy, selectedTagFilter]);

    useEffect(() => {
        filterAndSortDiscussions();
    }, [filterAndSortDiscussions]);

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

    const handleTagFilter = (tag: string) => {
        if (selectedTagFilter.includes(tag)) {
            // Remove tag from filter
            setSelectedTagFilter(selectedTagFilter.filter(t => t !== tag));
        } else {
            // Add tag to filter
            setSelectedTagFilter([...selectedTagFilter, tag]);
        }
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
                <Typography sx={{ color: actualTheme === 'dark' ? '#e2e8f0' : '#1a202c' }}>Loading...</Typography>
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
                    <Box sx={{
                        p: 2,
                        bgcolor: actualTheme === 'dark' ? "#1e2a3a" : "#e8f4fd",
                        borderRadius: 1,
                        mb: 3,
                        border: actualTheme === 'dark' ? "1px solid #3182ce" : "1px solid #39739d"
                    }}>
                        <Typography variant="body2" sx={{ color: actualTheme === 'dark' ? "#63b3ed" : "#39739d" }}>
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
                                        backgroundColor: actualTheme === 'dark' ? '#2d3748' : '#ffffff',
                                        color: actualTheme === 'dark' ? '#e2e8f0' : '#1a202c',
                                        "&:hover": {
                                            backgroundColor: actualTheme === 'dark' ? '#4a5568' : '#f7fafc',
                                        },
                                        "& fieldset": {
                                            borderColor: actualTheme === 'dark' ? '#4a5568' : '#e2e8f0',
                                        },
                                        "&:hover fieldset": {
                                            borderColor: actualTheme === 'dark' ? '#718096' : '#cbd5e0',
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: actualTheme === 'dark' ? '#63b3ed' : '#3182ce',
                                        }
                                    },
                                    "& .MuiInputBase-input": {
                                        color: actualTheme === 'dark' ? '#e2e8f0' : '#1a202c',
                                        "&::placeholder": {
                                            color: actualTheme === 'dark' ? '#a0aec0' : '#718096',
                                            opacity: 1
                                        }
                                    }
                                }}
                            />
                        </Box>
                        <Box sx={{ minWidth: { xs: "100%", md: "200px" } }}>
                            <FormControl fullWidth size="small">
                                <InputLabel sx={{ color: actualTheme === 'dark' ? '#a0aec0' : '#718096' }}>Sort by</InputLabel>
                                <Select
                                    value={sortBy}
                                    label="Sort by"
                                    onChange={(e) => setSortBy(e.target.value)}
                                    sx={{
                                        backgroundColor: actualTheme === 'dark' ? '#2d3748' : '#ffffff',
                                        color: actualTheme === 'dark' ? '#e2e8f0' : '#1a202c',
                                        "&:hover": {
                                            backgroundColor: actualTheme === 'dark' ? '#4a5568' : '#f7fafc',
                                        },
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: actualTheme === 'dark' ? '#4a5568' : '#e2e8f0',
                                        },
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: actualTheme === 'dark' ? '#718096' : '#cbd5e0',
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: actualTheme === 'dark' ? '#63b3ed' : '#3182ce',
                                        },
                                        "& .MuiSelect-icon": {
                                            color: actualTheme === 'dark' ? '#a0aec0' : '#718096',
                                        }
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: actualTheme === 'dark' ? '#2d3748' : '#ffffff',
                                                "& .MuiMenuItem-root": {
                                                    color: actualTheme === 'dark' ? '#e2e8f0' : '#1a202c',
                                                    "&:hover": {
                                                        backgroundColor: actualTheme === 'dark' ? '#4a5568' : '#f7fafc',
                                                    }
                                                }
                                            }
                                        }
                                    }}
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
                    <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1, lineHeight: 2.5 }}>
                            Filter by tags: {selectedTagFilter.length > 0 && `(${selectedTagFilter.length} selected)`}
                        </Typography>
                        <Chip
                            label="All"
                            size="small"
                            variant={selectedTagFilter.length === 0 ? "filled" : "outlined"}
                            clickable
                            onClick={() => setSelectedTagFilter([])}
                            sx={{
                                backgroundColor: selectedTagFilter.length === 0
                                    ? (actualTheme === 'dark' ? '#3182ce' : '#39739d')
                                    : (actualTheme === 'dark' ? '#2d3748' : '#ffffff'),
                                borderColor: actualTheme === 'dark' ? '#4a5568' : '#e2e8f0',
                                color: selectedTagFilter.length === 0
                                    ? '#ffffff'
                                    : (actualTheme === 'dark' ? '#e2e8f0' : '#1a202c'),
                                "&:hover": {
                                    backgroundColor: selectedTagFilter.length === 0
                                        ? (actualTheme === 'dark' ? '#2c5aa0' : '#2d5aa0')
                                        : (actualTheme === 'dark' ? '#4a5568' : '#edf2f7'),
                                    borderColor: actualTheme === 'dark' ? '#63b3ed' : '#3182ce'
                                }
                            }}
                        />
                        {PREDEFINED_TAGS.slice(0, 8).map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant={selectedTagFilter.includes(tag) ? "filled" : "outlined"}
                                clickable
                                onClick={() => handleTagFilter(tag)}
                                sx={{
                                    backgroundColor: selectedTagFilter.includes(tag)
                                        ? (actualTheme === 'dark' ? '#3182ce' : '#39739d')
                                        : (actualTheme === 'dark' ? '#2d3748' : '#ffffff'),
                                    borderColor: actualTheme === 'dark' ? '#4a5568' : '#e2e8f0',
                                    color: selectedTagFilter.includes(tag)
                                        ? '#ffffff'
                                        : (actualTheme === 'dark' ? '#e2e8f0' : '#1a202c'),
                                    "&:hover": {
                                        backgroundColor: selectedTagFilter.includes(tag)
                                            ? (actualTheme === 'dark' ? '#2c5aa0' : '#2d5aa0')
                                            : (actualTheme === 'dark' ? '#4a5568' : '#edf2f7'),
                                        borderColor: actualTheme === 'dark' ? '#63b3ed' : '#3182ce'
                                    }
                                }}
                            />
                        ))}
                        {selectedTagFilter.length > 0 && (
                            <Button
                                size="small"
                                onClick={() => setSelectedTagFilter([])}
                                sx={{
                                    ml: 1,
                                    fontSize: "0.75rem",
                                    color: actualTheme === 'dark' ? '#63b3ed' : '#3182ce'
                                }}
                            >
                                Clear All
                            </Button>
                        )}
                    </Stack>
                </Box>
            </Box>

            {/* Questions List - Stack Overflow Style */}
            <Box sx={{ mb: 4 }}>
                {currentDiscussions.length === 0 ? (
                    <Typography
                        variant="body1"
                        sx={{
                            color: actualTheme === 'dark' ? '#a0aec0' : '#718096',
                            textAlign: "center",
                            py: 4
                        }}
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
                                        bgcolor: actualTheme === 'dark' ? '#2d3748' : '#f7fafc',
                                        borderColor: actualTheme === 'dark' ? '#63b3ed' : '#3182ce'
                                    },
                                    transition: "all 0.2s",
                                    borderRadius: 0,
                                    borderBottom: discussion.id === currentDiscussions[currentDiscussions.length - 1].id ? undefined : "none",
                                    backgroundColor: actualTheme === 'dark' ? '#1a202c' : '#ffffff',
                                    borderColor: actualTheme === 'dark' ? '#2d3748' : '#e2e8f0'
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
                                                        color: discussion.score > 0 ? (actualTheme === 'dark' ? '#68d391' : '#38a169') :
                                                            discussion.score < 0 ? (actualTheme === 'dark' ? '#fc8181' : '#e53e3e') : (actualTheme === 'dark' ? '#e2e8f0' : '#1a202c')
                                                    }}
                                                >
                                                    {discussion.score}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: actualTheme === 'dark' ? '#a0aec0' : '#718096' }}>
                                                    {Math.abs(discussion.score) === 1 ? "vote" : "votes"}
                                                </Typography>
                                            </Stack>

                                            {/* Answers */}
                                            <Stack alignItems="center" spacing={0.5}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: discussion.answers.length > 0 ? (actualTheme === 'dark' ? '#63b3ed' : '#3182ce') : (actualTheme === 'dark' ? '#e2e8f0' : '#1a202c'),
                                                        backgroundColor: discussion.answers.length > 0 ? (actualTheme === 'dark' ? 'rgba(99, 179, 237, 0.1)' : 'rgba(49, 130, 206, 0.1)') : "transparent",
                                                        px: discussion.answers.length > 0 ? 1 : 0,
                                                        borderRadius: discussion.answers.length > 0 ? 1 : 0
                                                    }}
                                                >
                                                    {discussion.answers.length}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: actualTheme === 'dark' ? '#a0aec0' : '#718096' }}>
                                                    {discussion.answers.length === 1 ? "answer" : "answers"}
                                                </Typography>
                                            </Stack>

                                            {/* Views */}
                                            <Stack alignItems="center" spacing={0.5}>
                                                <Typography variant="body2" sx={{ fontWeight: "bold", color: actualTheme === 'dark' ? '#e2e8f0' : '#1a202c' }}>
                                                    {discussion.views}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: actualTheme === 'dark' ? '#a0aec0' : '#718096' }}>
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
                                                        color: actualTheme === 'dark' ? '#63b3ed' : '#3182ce',
                                                        "&:hover": { color: actualTheme === 'dark' ? '#90cdf4' : '#2c5aa0' },
                                                        lineHeight: 1.3
                                                    }}
                                                >
                                                    {discussion.title}
                                                    {discussion.isEdited && (
                                                        <Chip
                                                            icon={<EditNote />}
                                                            label="Edited"
                                                            size="small"
                                                            sx={{
                                                                ml: 1,
                                                                fontSize: "0.7rem",
                                                                backgroundColor: actualTheme === 'dark' ? '#fd8500' : '#fb8500',
                                                                color: '#ffffff',
                                                                border: 'none',
                                                                fontWeight: 'bold'
                                                            }}
                                                        />
                                                    )}
                                                </Typography>

                                                {/* Content Preview */}
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: actualTheme === 'dark' ? '#a0aec0' : '#718096',
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
                                                        {discussion.tags && discussion.tags.length > 0 ? (
                                                            discussion.tags.map((tag: string) => (
                                                                <Chip
                                                                    key={tag}
                                                                    label={tag}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{
                                                                        backgroundColor: actualTheme === 'dark' ? "#1e2a3a" : "#e8f4fd",
                                                                        borderColor: actualTheme === 'dark' ? "#3182ce" : "#39739d",
                                                                        color: actualTheme === 'dark' ? "#63b3ed" : "#39739d",
                                                                        fontSize: "0.75rem",
                                                                        height: 24,
                                                                        "&:hover": {
                                                                            backgroundColor: actualTheme === 'dark' ? "#2a4055" : "#d4e9f7"
                                                                        }
                                                                    }}
                                                                />
                                                            ))
                                                        ) : (
                                                            <Chip
                                                                label="general"
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{
                                                                    backgroundColor: actualTheme === 'dark' ? "#1e2a3a" : "#e8f4fd",
                                                                    borderColor: actualTheme === 'dark' ? "#3182ce" : "#39739d",
                                                                    color: actualTheme === 'dark' ? "#63b3ed" : "#39739d",
                                                                    fontSize: "0.75rem",
                                                                    height: 24,
                                                                    "&:hover": {
                                                                        backgroundColor: actualTheme === 'dark' ? "#2a4055" : "#d4e9f7"
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    </Stack>

                                                    {/* Author and Date */}
                                                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                                                        <Box sx={{ textAlign: "right" }}>
                                                            <Typography variant="caption" sx={{ color: actualTheme === 'dark' ? '#a0aec0' : '#718096' }}>
                                                                asked {formatDate(discussion.createdAt)}
                                                            </Typography>
                                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                                <Link
                                                                    to={`/user/${discussion.authorId}`}
                                                                    style={{ textDecoration: 'none' }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{
                                                                            fontWeight: 500,
                                                                            color: actualTheme === 'dark' ? '#63b3ed' : '#3182ce',
                                                                            '&:hover': {
                                                                                color: actualTheme === 'dark' ? '#90cdf4' : '#2c5aa0',
                                                                                textDecoration: 'underline'
                                                                            },
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    >
                                                                        {discussion.authorName}
                                                                    </Typography>
                                                                </Link>
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