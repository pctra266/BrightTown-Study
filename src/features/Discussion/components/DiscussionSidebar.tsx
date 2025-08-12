import React from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Chip,
    Stack,
    Button,
    Divider,
    Card,
    CardContent
} from '@mui/material';
import {
    QuestionAnswer as QuestionsIcon,
    LocalOffer as TagsIcon,
    TrendingUp as TrendingIcon,
    Schedule as RecentIcon,
    Star as StarIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { useThemeMode } from '../../../contexts/ThemeContext';
import { PREDEFINED_TAGS } from '../constants/tags';

interface DiscussionSidebarProps {
    sortBy: string;
    onSortChange: (sortBy: string) => void;
    selectedTagFilter: string[];
    onTagFilter: (tag: string) => void;
    onClearTagFilter: () => void;
    questionCount: number;
}

const DiscussionSidebar: React.FC<DiscussionSidebarProps> = ({
    sortBy,
    onSortChange,
    selectedTagFilter,
    onTagFilter,
    onClearTagFilter,
    questionCount
}) => {
    const { actualTheme } = useThemeMode();

    const sortOptions = [
        { value: 'newest', label: 'Newest', icon: <RecentIcon /> },
        { value: 'oldest', label: 'Oldest', icon: <RecentIcon /> },
        { value: 'mostAnswers', label: 'Most Answers', icon: <QuestionsIcon /> },
        { value: 'mostViews', label: 'Most Views', icon: <TrendingIcon /> },
        { value: 'highestScore', label: 'Highest Score', icon: <StarIcon /> },
        { value: 'unanswered', label: 'Unanswered', icon: <QuestionsIcon /> }
    ];

    const cardSx = {
        backgroundColor: actualTheme === 'dark' ? '#161b22' : '#ffffff',
        border: `1px solid ${actualTheme === 'dark' ? '#30363d' : '#d1d9e0'}`,
        borderRadius: '6px',
        boxShadow: 'none'
    };

    return (
        <Stack spacing={3}>
            {/* Stats Card */}
            <Card sx={cardSx}>
                <CardContent sx={{ p: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: actualTheme === 'dark' ? '#e6edf3' : '#1f2328',
                            mb: 2
                        }}
                    >
                        Statistics
                    </Typography>
                    <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography
                                variant="body2"
                                sx={{ color: actualTheme === 'dark' ? '#7d8590' : '#656d76' }}
                            >
                                Total Questions
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 600,
                                    color: actualTheme === 'dark' ? '#e6edf3' : '#1f2328'
                                }}
                            >
                                {questionCount.toLocaleString()}
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {/* Sort Options */}
            <Card sx={cardSx}>
                <CardContent sx={{ p: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: actualTheme === 'dark' ? '#e6edf3' : '#1f2328',
                            mb: 2
                        }}
                    >
                        Sort Questions
                    </Typography>
                    <List dense sx={{ p: 0 }}>
                        {sortOptions.map((option) => (
                            <ListItem key={option.value} disablePadding>
                                <ListItemButton
                                    selected={sortBy === option.value}
                                    onClick={() => onSortChange(option.value)}
                                    sx={{
                                        borderRadius: '6px',
                                        mb: 0.5,
                                        '&.Mui-selected': {
                                            backgroundColor: actualTheme === 'dark' ? '#21262d' : '#f6f8fa',
                                            color: actualTheme === 'dark' ? '#4493f8' : '#0969da',
                                            '&:hover': {
                                                backgroundColor: actualTheme === 'dark' ? '#30363d' : '#eaeef2'
                                            }
                                        },
                                        '&:hover': {
                                            backgroundColor: actualTheme === 'dark' ? '#21262d' : '#f6f8fa'
                                        }
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 'auto',
                                            mr: 1.5,
                                            color: sortBy === option.value 
                                                ? (actualTheme === 'dark' ? '#4493f8' : '#0969da')
                                                : (actualTheme === 'dark' ? '#7d8590' : '#656d76')
                                        }}
                                    >
                                        {React.cloneElement(option.icon, { fontSize: 'small' })}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={option.label}
                                        primaryTypographyProps={{
                                            fontSize: '14px',
                                            fontWeight: sortBy === option.value ? 600 : 400,
                                            color: sortBy === option.value 
                                                ? (actualTheme === 'dark' ? '#4493f8' : '#0969da')
                                                : (actualTheme === 'dark' ? '#e6edf3' : '#1f2328')
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card sx={cardSx}>
                <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: actualTheme === 'dark' ? '#e6edf3' : '#1f2328'
                            }}
                        >
                            <TagsIcon sx={{ fontSize: '16px', mr: 0.5, verticalAlign: 'middle' }} />
                            Popular Tags
                        </Typography>
                        {selectedTagFilter.length > 0 && (
                            <Button
                                size="small"
                                startIcon={<ClearIcon fontSize="small" />}
                                onClick={onClearTagFilter}
                                sx={{
                                    fontSize: '12px',
                                    color: actualTheme === 'dark' ? '#f85149' : '#d1242f',
                                    '&:hover': {
                                        backgroundColor: actualTheme === 'dark' ? '#21262d' : '#f6f8fa'
                                    }
                                }}
                            >
                                Clear
                            </Button>
                        )}
                    </Stack>

                    {selectedTagFilter.length > 0 && (
                        <>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: actualTheme === 'dark' ? '#7d8590' : '#656d76',
                                    mb: 1,
                                    display: 'block'
                                }}
                            >
                                Active Filters ({selectedTagFilter.length})
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" spacing={0.5} sx={{ mb: 2 }}>
                                {selectedTagFilter.map((tag) => (
                                    <Chip
                                        key={tag}
                                        label={tag}
                                        size="small"
                                        onDelete={() => onTagFilter(tag)}
                                        sx={{
                                            backgroundColor: actualTheme === 'dark' ? '#1f6feb' : '#dbeafe',
                                            color: actualTheme === 'dark' ? '#ffffff' : '#1f2937',
                                            fontSize: '12px',
                                            height: '24px',
                                            '& .MuiChip-deleteIcon': {
                                                color: actualTheme === 'dark' ? '#ffffff' : '#1f2937',
                                                fontSize: '16px'
                                            }
                                        }}
                                    />
                                ))}
                            </Stack>
                            <Divider sx={{ mb: 2, borderColor: actualTheme === 'dark' ? '#30363d' : '#d1d9e0' }} />
                        </>
                    )}

                    <Stack direction="row" flexWrap="wrap" spacing={0.5}>
                        {PREDEFINED_TAGS.slice(0, 12).map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                clickable
                                variant={selectedTagFilter.includes(tag) ? 'filled' : 'outlined'}
                                onClick={() => onTagFilter(tag)}
                                sx={{
                                    fontSize: '12px',
                                    height: '24px',
                                    backgroundColor: selectedTagFilter.includes(tag)
                                        ? (actualTheme === 'dark' ? '#1f6feb' : '#0969da')
                                        : (actualTheme === 'dark' ? '#21262d' : '#f6f8fa'),
                                    color: selectedTagFilter.includes(tag)
                                        ? '#ffffff'
                                        : (actualTheme === 'dark' ? '#e6edf3' : '#1f2328'),
                                    borderColor: actualTheme === 'dark' ? '#30363d' : '#d1d9e0',
                                    '&:hover': {
                                        backgroundColor: selectedTagFilter.includes(tag)
                                            ? (actualTheme === 'dark' ? '#388bfd' : '#0550ae')
                                            : (actualTheme === 'dark' ? '#30363d' : '#eaeef2'),
                                        borderColor: actualTheme === 'dark' ? '#4493f8' : '#0969da'
                                    }
                                }}
                            />
                        ))}
                    </Stack>

                    {PREDEFINED_TAGS.length > 12 && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: actualTheme === 'dark' ? '#7d8590' : '#656d76',
                                mt: 1,
                                display: 'block',
                                textAlign: 'center'
                            }}
                        >
                            +{PREDEFINED_TAGS.length - 12} more tags available
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Stack>
    );
};

export default DiscussionSidebar;