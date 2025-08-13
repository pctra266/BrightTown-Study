import { useState, useEffect, useCallback } from "react";
import {
    Container,
    Typography,
    Box,
    Button,
    TextField,
    Chip,
    Stack,
    Pagination,
    Select,
    MenuItem,
    FormControl,
    Autocomplete,
} from "@mui/material";
import {
    CheckCircle,
} from "@mui/icons-material";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useThemeMode } from "../../../contexts/ThemeContext";
import { discussionService } from "../services/DiscussionService";
import type { Answer } from "../services/DiscussionService";
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
    answers: Answer[];
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
    const [tagInputValue, setTagInputValue] = useState("");
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
            {/* Header - Stack Overflow Style */}
            <Box sx={{ mb: 3 }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    sx={{ mb: 2 }}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            component="h1"
                            className="discussion-header"
                            sx={{
                                fontWeight: 700,
                                fontSize: "1.75rem",
                                color: actualTheme === 'dark' ? '#f8f9fa' : '#232629',
                                mb: 0.5
                            }}
                        >
                            All Questions
                        </Typography>
                        <Typography
                            variant="body2"
                            className="discussion-meta"
                            sx={{
                                color: actualTheme === 'dark' ? '#9199a1' : '#6a737c',
                                fontSize: "0.875rem",
                                fontWeight: 600
                            }}
                        >
                            {filteredDiscussions.length.toLocaleString()} question{filteredDiscussions.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                    {isAuthenticated && (
                        <Button
                            variant="contained"
                            onClick={handleCreateQuestion}
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

                {/* Search Bar - Moved to between header and filters */}
                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Search questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        sx={{
                            maxWidth: "500px",
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: actualTheme === 'dark' ? '#2d3139' : '#ffffff',
                                color: actualTheme === 'dark' ? '#f8f9fa' : '#232629',
                                fontSize: "0.875rem",
                                borderRadius: "3px",
                                "& fieldset": {
                                    borderColor: actualTheme === 'dark' ? '#3c4043' : '#babfc4',
                                },
                                "&:hover fieldset": {
                                    borderColor: actualTheme === 'dark' ? '#525860' : '#0074cc',
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: actualTheme === 'dark' ? '#0a95ff' : '#0074cc',
                                    borderWidth: "1px"
                                }
                            },
                            "& .MuiInputBase-input": {
                                color: actualTheme === 'dark' ? '#f8f9fa' : '#232629',
                                "&::placeholder": {
                                    color: actualTheme === 'dark' ? '#9199a1' : '#6a737c',
                                    opacity: 1
                                }
                            }
                        }}
                    />
                </Box>

                {!isAuthenticated && (
                    <Box sx={{
                        p: 3,
                        bgcolor: actualTheme === 'dark' ? "#2d3139" : "#fdf7e2",
                        borderRadius: "3px",
                        mb: 3,
                        border: actualTheme === 'dark' ? "1px solid #524c42" : "1px solid #e1cc85",
                        borderLeft: `4px solid ${actualTheme === 'dark' ? "#f2cc60" : "#d69e2e"}`
                    }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: actualTheme === 'dark' ? "#f2cc60" : "#744210",
                                fontSize: "0.875rem",
                                lineHeight: 1.4
                            }}
                        >
                            You must be logged in to ask questions and provide answers.
                        </Typography>
                    </Box>
                )}

                {/* Filter and Sort Section - Same Row Layout Updated */}
                <Box sx={{
                    mb: 2,
                    borderBottom: `1px solid ${actualTheme === 'dark' ? '#3c4043' : '#e3e6e8'}`,
                    pb: 2
                }}>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        alignItems={{ xs: "stretch", md: "center" }}
                        justifyContent="space-between"
                    >
                        {/* Filter by tags Section */}
                        <Box sx={{ flex: 1, maxWidth: { xs: "100%", md: "500px" } }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600,
                                        color: actualTheme === 'dark' ? '#f8f9fa' : '#232629',
                                        fontSize: "0.875rem",
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    Filter by tags:
                                </Typography>
                                {selectedTagFilter.length > 0 && (
                                    <Button
                                        size="small"
                                        onClick={() => setSelectedTagFilter([])}
                                        sx={{
                                            fontSize: "0.75rem",
                                            color: actualTheme === 'dark' ? '#0a95ff' : '#0074cc',
                                            textTransform: "none",
                                            fontWeight: 500,
                                            minWidth: "auto",
                                            px: 1,
                                            "&:hover": {
                                                backgroundColor: actualTheme === 'dark' ? '#3c4043' : '#f1f2f3'
                                            }
                                        }}
                                    >
                                        Clear all
                                    </Button>
                                )}
                            </Stack>

                            {/* Autocomplete Tag Input */}
                            <Autocomplete
                                multiple
                                id="tags-autocomplete"
                                options={PREDEFINED_TAGS}
                                value={selectedTagFilter}
                                onChange={(_, newValue) => {
                                    setSelectedTagFilter(newValue);
                                }}
                                inputValue={tagInputValue}
                                onInputChange={(_, newInputValue) => {
                                    setTagInputValue(newInputValue);
                                }}
                                filterSelectedOptions
                                renderTags={(tagValue, getTagProps) =>
                                    tagValue.map((option, index) => {
                                        const { key, ...tagProps } = getTagProps({ index });
                                        return (
                                            <Chip
                                                key={key}
                                                variant="filled"
                                                label={option}
                                                size="small"
                                                sx={{
                                                    backgroundColor: actualTheme === 'dark' ? '#0a95ff' : '#0074cc',
                                                    color: '#ffffff',
                                                    fontSize: "0.75rem",
                                                    height: "28px",
                                                    borderRadius: "14px",
                                                    fontWeight: 600,
                                                    "& .MuiChip-deleteIcon": {
                                                        color: '#ffffff',
                                                        "&:hover": {
                                                            color: '#e0e0e0'
                                                        }
                                                    }
                                                }}
                                                {...tagProps}
                                            />
                                        );
                                    })
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder={selectedTagFilter.length === 0 ? "Type to search tags..." : "Add more tags..."}
                                        size="small"
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                backgroundColor: actualTheme === 'dark' ? '#2d3139' : '#ffffff',
                                                color: actualTheme === 'dark' ? '#f8f9fa' : '#232629',
                                                fontSize: "0.875rem",
                                                borderRadius: "3px",
                                                "& fieldset": {
                                                    borderColor: actualTheme === 'dark' ? '#3c4043' : '#babfc4',
                                                },
                                                "&:hover fieldset": {
                                                    borderColor: actualTheme === 'dark' ? '#525860' : '#0074cc',
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor: actualTheme === 'dark' ? '#0a95ff' : '#0074cc',
                                                    borderWidth: "1px"
                                                }
                                            },
                                            "& .MuiInputBase-input": {
                                                color: actualTheme === 'dark' ? '#f8f9fa' : '#232629',
                                                "&::placeholder": {
                                                    color: actualTheme === 'dark' ? '#9199a1' : '#6a737c',
                                                    opacity: 1
                                                }
                                            }
                                        }}
                                    />
                                )}
                                renderOption={(props, option) => {
                                    const { key, ...optionProps } = props;
                                    return (
                                        <Box
                                            key={key}
                                            component="li"
                                            sx={{
                                                color: actualTheme === 'dark' ? '#f8f9fa' : '#232629',
                                                backgroundColor: actualTheme === 'dark' ? '#2d3139' : '#ffffff',
                                                fontSize: "0.875rem",
                                                "&:hover": {
                                                    backgroundColor: actualTheme === 'dark' ? '#3c4043' : '#f1f2f3'
                                                }
                                            }}
                                            {...optionProps}
                                        >
                                            {option}
                                        </Box>
                                    );
                                }}
                                ListboxProps={{
                                    sx: {
                                        backgroundColor: actualTheme === 'dark' ? '#2d3139' : '#ffffff',
                                        border: `1px solid ${actualTheme === 'dark' ? '#3c4043' : '#babfc4'}`,
                                        boxShadow: `0 8px 16px ${actualTheme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`,
                                        maxHeight: '200px'
                                    }
                                }}
                            />
                        </Box>

                        {/* Sort Dropdown */}
                        <Box sx={{ minWidth: { xs: "100%", md: "180px" } }}>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    displayEmpty
                                    sx={{
                                        backgroundColor: actualTheme === 'dark' ? '#2d3139' : '#ffffff',
                                        color: actualTheme === 'dark' ? '#f8f9fa' : '#232629',
                                        fontSize: "0.875rem",
                                        borderRadius: "3px",
                                        "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: actualTheme === 'dark' ? '#3c4043' : '#babfc4',
                                        },
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: actualTheme === 'dark' ? '#525860' : '#0074cc',
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: actualTheme === 'dark' ? '#0a95ff' : '#0074cc',
                                            borderWidth: "1px"
                                        },
                                        "& .MuiSelect-icon": {
                                            color: actualTheme === 'dark' ? '#9199a1' : '#6a737c',
                                        }
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: actualTheme === 'dark' ? '#2d3139' : '#ffffff',
                                                border: `1px solid ${actualTheme === 'dark' ? '#3c4043' : '#babfc4'}`,
                                                boxShadow: `0 8px 16px ${actualTheme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`,
                                                "& .MuiMenuItem-root": {
                                                    color: actualTheme === 'dark' ? '#f8f9fa' : '#232629',
                                                    fontSize: "0.875rem",
                                                    "&:hover": {
                                                        backgroundColor: actualTheme === 'dark' ? '#3c4043' : '#f1f2f3',
                                                    },
                                                    "&.Mui-selected": {
                                                        backgroundColor: actualTheme === 'dark' ? '#0a95ff' : '#e3f2fd',
                                                        "&:hover": {
                                                            backgroundColor: actualTheme === 'dark' ? '#0074cc' : '#bbdefb',
                                                        }
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
            </Box>

            {/* Questions List - Stack Overflow Style */}
            <Box>
                {currentDiscussions.length === 0 ? (
                    <Box sx={{
                        textAlign: "center",
                        py: 8,
                        color: actualTheme === 'dark' ? '#9199a1' : '#6a737c'
                    }}>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 400 }}>
                            No questions found
                        </Typography>
                        <Typography variant="body2">
                            Try adjusting your search or filter criteria
                        </Typography>
                    </Box>
                ) : (
                    <Box>
                        {currentDiscussions.map((discussion) => (
                            <Box
                                key={discussion.id}
                                sx={{
                                    borderBottom: `1px solid ${actualTheme === 'dark' ? '#3c4043' : '#e3e6e8'}`,
                                    py: 3,
                                    px: 2,
                                    cursor: "pointer",
                                    "&:hover": {
                                        backgroundColor: actualTheme === 'dark' ? '#2d3139' : '#f8f9fa'
                                    },
                                    "&:last-child": {
                                        borderBottom: "none"
                                    }
                                }}
                                onClick={() => handleDiscussionClick(discussion.id)}
                            >
                                <Stack direction="row" spacing={3} alignItems="flex-start">
                                    {/* Stats Column - Stack Overflow Style */}
                                    <Box sx={{
                                        minWidth: { xs: "auto", sm: "108px" },
                                        display: "flex",
                                        flexDirection: { xs: "column", sm: "column" },
                                        gap: { xs: 1, sm: 1.5 },
                                        alignItems: { xs: "flex-start", sm: "flex-end" },
                                        textAlign: { xs: "left", sm: "right" },
                                        fontSize: "0.875rem"
                                    }}>
                                        {/* Score */}
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: discussion.score !== 0 ? 700 : 600,
                                                    color: discussion.score > 0
                                                        ? (actualTheme === 'dark' ? '#48bb78' : '#38a169')
                                                        : discussion.score < 0
                                                            ? (actualTheme === 'dark' ? '#f56565' : '#e53e3e')
                                                            : (actualTheme === 'dark' ? '#9199a1' : '#6a737c'),
                                                    fontSize: "0.875rem"
                                                }}
                                            >
                                                {discussion.score}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{ color: actualTheme === 'dark' ? '#9199a1' : '#6a737c' }}
                                            >
                                                vote{Math.abs(discussion.score) !== 1 ? 's' : ''}
                                            </Typography>
                                        </Box>

                                        {/* Answers */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                ...(discussion.answers.some(answer => answer.isAccepted) && {
                                                    backgroundColor: actualTheme === 'dark' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.08)',
                                                    borderRadius: '4px',
                                                    px: 1,
                                                    py: 0.5,
                                                    border: `1px solid ${actualTheme === 'dark' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)'}`
                                                })
                                            }}
                                        >
                                            {discussion.answers.some(answer => answer.isAccepted) && (
                                                <CheckCircle
                                                    sx={{
                                                        fontSize: 14,
                                                        color: actualTheme === 'dark' ? '#4caf50' : '#388e3c',
                                                        mr: 0.3
                                                    }}
                                                />
                                            )}
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: discussion.answers.length > 0 ? 700 : 600,
                                                    color: discussion.answers.some(answer => answer.isAccepted)
                                                        ? (actualTheme === 'dark' ? '#4caf50' : '#388e3c')
                                                        : discussion.answers.length > 0
                                                            ? (actualTheme === 'dark' ? '#0a95ff' : '#0074cc')
                                                            : (actualTheme === 'dark' ? '#9199a1' : '#6a737c'),
                                                    fontSize: "0.875rem"
                                                }}
                                            >
                                                {discussion.answers.length}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: discussion.answers.some(answer => answer.isAccepted)
                                                        ? (actualTheme === 'dark' ? '#4caf50' : '#388e3c')
                                                        : (actualTheme === 'dark' ? '#9199a1' : '#6a737c')
                                                }}
                                            >
                                                answer{discussion.answers.length !== 1 ? 's' : ''}
                                            </Typography>
                                        </Box>

                                        {/* Views */}
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: actualTheme === 'dark' ? '#9199a1' : '#6a737c',
                                                    fontSize: "0.875rem"
                                                }}
                                            >
                                                {discussion.views}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{ color: actualTheme === 'dark' ? '#9199a1' : '#6a737c' }}
                                            >
                                                view{discussion.views !== 1 ? 's' : ''}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Question Content */}
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        {/* Title */}
                                        <Typography
                                            variant="h6"
                                            component="h3"
                                            className="discussion-title"
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: "1.0625rem",
                                                lineHeight: 1.35,
                                                color: actualTheme === 'dark' ? '#0a95ff' : '#0074cc',
                                                mb: 1,
                                                "&:hover": {
                                                    color: actualTheme === 'dark' ? '#379fff' : '#005ba3'
                                                },
                                                cursor: "pointer",
                                                wordBreak: "break-word"
                                            }}
                                        >
                                            {discussion.title}
                                        </Typography>

                                        {/* Content Preview */}
                                        <Typography
                                            variant="body2"
                                            className="discussion-text"
                                            sx={{
                                                color: actualTheme === 'dark' ? '#bdc3c7' : '#525960',
                                                fontSize: "0.875rem",
                                                fontWeight: 500,
                                                lineHeight: 1.4,
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                mb: 1.5,
                                                wordBreak: "break-word"
                                            }}
                                        >
                                            {discussion.content}
                                        </Typography>

                                        {/* Bottom section: Tags and Author */}
                                        <Stack
                                            direction={{ xs: "column", sm: "row" }}
                                            spacing={{ xs: 1, sm: 2 }}
                                            justifyContent="space-between"
                                            alignItems={{ xs: "flex-start", sm: "center" }}
                                        >
                                            {/* Tags */}
                                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                                {discussion.tags && discussion.tags.length > 0 ? (
                                                    discussion.tags.slice(0, 5).map((tag: string) => (
                                                        <Chip
                                                            key={tag}
                                                            label={tag}
                                                            size="small"
                                                            sx={{
                                                                height: "20px",
                                                                fontSize: "0.75rem",
                                                                backgroundColor: actualTheme === 'dark' ? '#2d4a5c' : '#e1ecf4',
                                                                color: actualTheme === 'dark' ? '#a5c9ea' : '#39739d',
                                                                border: 'none',
                                                                borderRadius: "3px",
                                                                fontWeight: 400,
                                                                "&:hover": {
                                                                    backgroundColor: actualTheme === 'dark' ? '#1e3a4b' : '#cee0ed'
                                                                }
                                                            }}
                                                        />
                                                    ))
                                                ) : (
                                                    <Chip
                                                        label="general"
                                                        size="small"
                                                        sx={{
                                                            height: "20px",
                                                            fontSize: "0.75rem",
                                                            backgroundColor: actualTheme === 'dark' ? '#2d4a5c' : '#e1ecf4',
                                                            color: actualTheme === 'dark' ? '#a5c9ea' : '#39739d',
                                                            border: 'none',
                                                            borderRadius: "3px",
                                                            fontWeight: 400
                                                        }}
                                                    />
                                                )}
                                            </Stack>

                                            {/* Username and Date */}
                                            <Box sx={{
                                                textAlign: { xs: "left", sm: "right" },
                                                minWidth: "fit-content"
                                            }}>
                                                <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: "flex-start", sm: "flex-end" }}>
                                                    {/* Username */}
                                                    <Link
                                                        to={`/user/${discussion.authorId}`}
                                                        style={{ textDecoration: 'none' }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                fontSize: "0.75rem",
                                                                fontWeight: 400,
                                                                color: actualTheme === 'dark' ? '#0a95ff' : '#0074cc',
                                                                '&:hover': {
                                                                    color: actualTheme === 'dark' ? '#379fff' : '#005ba3'
                                                                },
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            {discussion.authorName}
                                                        </Typography>
                                                    </Link>

                                                    {/* Date */}
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: actualTheme === 'dark' ? '#9199a1' : '#6a737c',
                                                            fontSize: "0.75rem"
                                                        }}
                                                    >
                                                        asked {formatDate(discussion.createdAt)}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 4,
                    pt: 3,
                    borderTop: `1px solid ${actualTheme === 'dark' ? '#3c4043' : '#e3e6e8'}`
                }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(_, value) => setCurrentPage(value)}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                        sx={{
                            "& .MuiPaginationItem-root": {
                                color: actualTheme === 'dark' ? '#9199a1' : '#6a737c',
                                borderColor: actualTheme === 'dark' ? '#3c4043' : '#babfc4',
                                "&:hover": {
                                    backgroundColor: actualTheme === 'dark' ? '#3c4043' : '#f1f2f3'
                                },
                                "&.Mui-selected": {
                                    backgroundColor: actualTheme === 'dark' ? '#0a95ff' : '#0074cc',
                                    color: '#ffffff',
                                    "&:hover": {
                                        backgroundColor: actualTheme === 'dark' ? '#0074cc' : '#005ba3'
                                    }
                                }
                            }
                        }}
                    />
                </Box>
            )}

        </Container>
    );
};

export default DiscussionHub;