import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Stack,
    Pagination
} from '@mui/material';
import {
    EditNote,
    Visibility as VisibilityIcon,
    QuestionAnswer as AnswerIcon,
    ThumbUp as VoteIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useThemeMode } from '../../../contexts/ThemeContext';

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

interface QuestionListProps {
    discussions: Discussion[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onQuestionClick: (id: string) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
    discussions,
    currentPage,
    totalPages,
    onPageChange,
    onQuestionClick
}) => {
    const { actualTheme } = useThemeMode();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

        if (diffInMinutes < 60) {
            return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
        } else if (diffInDays < 7) {
            return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const getScoreColor = (score: number) => {
        if (score > 0) return actualTheme === 'dark' ? '#238636' : '#1a7f37';
        if (score < 0) return actualTheme === 'dark' ? '#da3633' : '#d1242f';
        return actualTheme === 'dark' ? '#7d8590' : '#656d76';
    };

    const getAnswerColor = (answerCount: number) => {
        if (answerCount > 0) return actualTheme === 'dark' ? '#1f6feb' : '#0969da';
        return actualTheme === 'dark' ? '#7d8590' : '#656d76';
    };

    if (discussions.length === 0) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 8,
                    textAlign: 'center'
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        color: actualTheme === 'dark' ? '#7d8590' : '#656d76',
                        mb: 1
                    }}
                >
                    No questions found
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        color: actualTheme === 'dark' ? '#7d8590' : '#656d76'
                    }}
                >
                    Try adjusting your search or filter criteria
                </Typography>
            </Box>
        );
    }

    return (
        <Stack spacing={0}>
            {/* Question Cards */}
            {discussions.map((discussion, index) => (
                <Card
                    key={discussion.id}
                    variant="outlined"
                    sx={{
                        cursor: 'pointer',
                        backgroundColor: actualTheme === 'dark' ? '#0d1117' : '#ffffff',
                        border: `1px solid ${actualTheme === 'dark' ? '#30363d' : '#d1d9e0'}`,
                        borderRadius: 0,
                        borderTopLeftRadius: index === 0 ? '6px' : 0,
                        borderTopRightRadius: index === 0 ? '6px' : 0,
                        borderBottomLeftRadius: index === discussions.length - 1 ? '6px' : 0,
                        borderBottomRightRadius: index === discussions.length - 1 ? '6px' : 0,
                        borderBottom: index === discussions.length - 1 ? undefined : 'none',
                        transition: 'all 0.2s',
                        '&:hover': {
                            backgroundColor: actualTheme === 'dark' ? '#161b22' : '#f6f8fa',
                            borderColor: actualTheme === 'dark' ? '#4493f8' : '#0969da'
                        }
                    }}
                    onClick={() => onQuestionClick(discussion.id)}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" spacing={3}>
                            {/* Stats Column */}
                            <Box
                                sx={{
                                    minWidth: { xs: 'auto', sm: '130px' },
                                    display: 'flex',
                                    flexDirection: { xs: 'row', sm: 'column' },
                                    gap: { xs: 3, sm: 2 },
                                    alignItems: 'center',
                                    justifyContent: { xs: 'space-around', sm: 'center' }
                                }}
                            >
                                {/* Votes */}
                                <Box sx={{ textAlign: 'center' }}>
                                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                                        <VoteIcon
                                            sx={{
                                                fontSize: '16px',
                                                color: getScoreColor(discussion.score)
                                            }}
                                        />
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: '16px',
                                                color: getScoreColor(discussion.score)
                                            }}
                                        >
                                            {discussion.score}
                                        </Typography>
                                    </Stack>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: actualTheme === 'dark' ? '#7d8590' : '#656d76',
                                            fontSize: '12px'
                                        }}
                                    >
                                        {Math.abs(discussion.score) === 1 ? 'vote' : 'votes'}
                                    </Typography>
                                </Box>

                                {/* Answers */}
                                <Box sx={{ textAlign: 'center' }}>
                                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                                        <AnswerIcon
                                            sx={{
                                                fontSize: '16px',
                                                color: getAnswerColor(discussion.answers.length)
                                            }}
                                        />
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: '16px',
                                                color: getAnswerColor(discussion.answers.length),
                                                backgroundColor: discussion.answers.length > 0 
                                                    ? (actualTheme === 'dark' ? 'rgba(31, 111, 235, 0.1)' : 'rgba(9, 105, 218, 0.1)')
                                                    : 'transparent',
                                                px: discussion.answers.length > 0 ? 1 : 0,
                                                py: discussion.answers.length > 0 ? 0.5 : 0,
                                                borderRadius: discussion.answers.length > 0 ? '4px' : 0
                                            }}
                                        >
                                            {discussion.answers.length}
                                        </Typography>
                                    </Stack>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: actualTheme === 'dark' ? '#7d8590' : '#656d76',
                                            fontSize: '12px'
                                        }}
                                    >
                                        {discussion.answers.length === 1 ? 'answer' : 'answers'}
                                    </Typography>
                                </Box>

                                {/* Views */}
                                <Box sx={{ textAlign: 'center' }}>
                                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                                        <VisibilityIcon
                                            sx={{
                                                fontSize: '16px',
                                                color: actualTheme === 'dark' ? '#7d8590' : '#656d76'
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: '16px',
                                                color: actualTheme === 'dark' ? '#e6edf3' : '#1f2328'
                                            }}
                                        >
                                            {discussion.views}
                                        </Typography>
                                    </Stack>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: actualTheme === 'dark' ? '#7d8590' : '#656d76',
                                            fontSize: '12px'
                                        }}
                                    >
                                        {discussion.views === 1 ? 'view' : 'views'}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Question Content */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack spacing={2}>
                                    {/* Title */}
                                    <Typography
                                        variant="h6"
                                        component="h3"
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: '18px',
                                            lineHeight: 1.3,
                                            color: actualTheme === 'dark' ? '#4493f8' : '#0969da',
                                            '&:hover': {
                                                color: actualTheme === 'dark' ? '#58a6ff' : '#0550ae'
                                            },
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                    >
                                        {discussion.title}
                                        {discussion.isEdited && (
                                            <Chip
                                                icon={<EditNote sx={{ fontSize: '14px' }} />}
                                                label="Edited"
                                                size="small"
                                                sx={{
                                                    fontSize: '11px',
                                                    height: '20px',
                                                    backgroundColor: actualTheme === 'dark' ? '#7c3aed' : '#8b5cf6',
                                                    color: '#ffffff',
                                                    fontWeight: 500
                                                }}
                                            />
                                        )}
                                    </Typography>

                                    {/* Content Preview */}
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: actualTheme === 'dark' ? '#7d8590' : '#656d76',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: 1.5,
                                            fontSize: '14px'
                                        }}
                                    >
                                        {discussion.content}
                                    </Typography>

                                    {/* Tags and Metadata */}
                                    <Box>
                                        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
                                            {discussion.tags && discussion.tags.length > 0 ? (
                                                discussion.tags.map((tag: string) => (
                                                    <Chip
                                                        key={tag}
                                                        label={tag}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: actualTheme === 'dark' ? '#21262d' : '#f6f8fa',
                                                            color: actualTheme === 'dark' ? '#4493f8' : '#0969da',
                                                            border: `1px solid ${actualTheme === 'dark' ? '#30363d' : '#d1d9e0'}`,
                                                            fontSize: '12px',
                                                            height: '24px',
                                                            fontWeight: 500,
                                                            '&:hover': {
                                                                backgroundColor: actualTheme === 'dark' ? '#30363d' : '#eaeef2',
                                                                borderColor: actualTheme === 'dark' ? '#4493f8' : '#0969da'
                                                            }
                                                        }}
                                                    />
                                                ))
                                            ) : (
                                                <Chip
                                                    label="general"
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: actualTheme === 'dark' ? '#21262d' : '#f6f8fa',
                                                        color: actualTheme === 'dark' ? '#4493f8' : '#0969da',
                                                        border: `1px solid ${actualTheme === 'dark' ? '#30363d' : '#d1d9e0'}`,
                                                        fontSize: '12px',
                                                        height: '24px',
                                                        fontWeight: 500
                                                    }}
                                                />
                                            )}
                                        </Stack>

                                        {/* Author and Date */}
                                        <Stack direction="row" justifyContent="flex-end">
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: actualTheme === 'dark' ? '#7d8590' : '#656d76',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    asked {formatDate(discussion.createdAt)}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }} justifyContent="flex-end">
                                                    <Link
                                                        to={`/user/${discussion.authorId}`}
                                                        style={{ textDecoration: 'none' }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontSize: '13px',
                                                                fontWeight: 500,
                                                                color: actualTheme === 'dark' ? '#4493f8' : '#0969da',
                                                                '&:hover': {
                                                                    color: actualTheme === 'dark' ? '#58a6ff' : '#0550ae',
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

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(_, value) => onPageChange(value)}
                        size="large"
                        showFirstButton
                        showLastButton
                        sx={{
                            '& .MuiPaginationItem-root': {
                                color: actualTheme === 'dark' ? '#e6edf3' : '#1f2328',
                                borderColor: actualTheme === 'dark' ? '#30363d' : '#d1d9e0',
                                '&:hover': {
                                    backgroundColor: actualTheme === 'dark' ? '#21262d' : '#f6f8fa',
                                    borderColor: actualTheme === 'dark' ? '#4493f8' : '#0969da'
                                },
                                '&.Mui-selected': {
                                    backgroundColor: actualTheme === 'dark' ? '#1f6feb' : '#0969da',
                                    color: '#ffffff',
                                    '&:hover': {
                                        backgroundColor: actualTheme === 'dark' ? '#388bfd' : '#0550ae'
                                    }
                                }
                            }
                        }}
                    />
                </Box>
            )}
        </Stack>
    );
};

export default QuestionList;