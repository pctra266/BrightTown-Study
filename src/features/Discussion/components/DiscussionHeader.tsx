import React from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Stack,
    Breadcrumbs,
    Link as MuiLink
} from '@mui/material';
import {
    Add as AddIcon,
    Home as HomeIcon,
    QuestionAnswer as QuestionAnswerIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useThemeMode } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';

interface DiscussionHeaderProps {
    questionCount: number;
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

const DiscussionHeader: React.FC<DiscussionHeaderProps> = ({
    questionCount,
    searchTerm,
    onSearchChange
}) => {
    const { actualTheme } = useThemeMode();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleCreateQuestion = () => {
        navigate('/talk/new');
    };

    return (
        <Box sx={{ py: 3 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs
                separator="/"
                sx={{
                    mb: 3,
                    '& .MuiBreadcrumbs-separator': {
                        color: actualTheme === 'dark' ? '#7d8590' : '#656d76'
                    }
                }}
            >
                <Link
                    to="/"
                    style={{
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    <MuiLink
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: actualTheme === 'dark' ? '#4493f8' : '#0969da',
                            '&:hover': {
                                color: actualTheme === 'dark' ? '#58a6ff' : '#0550ae',
                                textDecoration: 'none'
                            }
                        }}
                    >
                        <HomeIcon fontSize="small" />
                        Home
                    </MuiLink>
                </Link>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: actualTheme === 'dark' ? '#e6edf3' : '#1f2328'
                    }}
                >
                    <QuestionAnswerIcon fontSize="small" />
                    Questions
                </Box>
            </Breadcrumbs>

            {/* Header Content */}
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', md: 'flex-start' }}
                spacing={3}
            >
                {/* Title and Stats */}
                <Box sx={{ flex: 1 }}>
                    <Typography
                        variant="h3"
                        component="h1"
                        sx={{
                            fontWeight: 600,
                            fontSize: { xs: '1.75rem', md: '2.125rem' },
                            color: actualTheme === 'dark' ? '#e6edf3' : '#1f2328',
                            mb: 1
                        }}
                    >
                        All Questions
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: actualTheme === 'dark' ? '#7d8590' : '#656d76',
                            mb: 3
                        }}
                    >
                        {questionCount.toLocaleString()} question{questionCount !== 1 ? 's' : ''}
                    </Typography>

                    {/* Search Bar */}
                    <Box sx={{ maxWidth: { xs: '100%', md: '500px' } }}>
                        <TextField
                            fullWidth
                            placeholder="Search for questions, answers, and tags..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            size="medium"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: actualTheme === 'dark' ? '#21262d' : '#ffffff',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    '& fieldset': {
                                        borderColor: actualTheme === 'dark' ? '#30363d' : '#d1d9e0',
                                        borderWidth: '1px'
                                    },
                                    '&:hover fieldset': {
                                        borderColor: actualTheme === 'dark' ? '#4493f8' : '#0969da'
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: actualTheme === 'dark' ? '#4493f8' : '#0969da',
                                        borderWidth: '1px'
                                    }
                                },
                                '& .MuiInputBase-input': {
                                    color: actualTheme === 'dark' ? '#e6edf3' : '#1f2328',
                                    '&::placeholder': {
                                        color: actualTheme === 'dark' ? '#7d8590' : '#656d76',
                                        opacity: 1
                                    }
                                }
                            }}
                        />
                    </Box>
                </Box>

                {/* Ask Question Button */}
                {isAuthenticated && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateQuestion}
                        sx={{
                            alignSelf: { xs: 'stretch', md: 'flex-start' },
                            backgroundColor: actualTheme === 'dark' ? '#238636' : '#1f883d',
                            color: '#ffffff',
                            fontWeight: 600,
                            px: 3,
                            py: 1.5,
                            borderRadius: '6px',
                            textTransform: 'none',
                            fontSize: '14px',
                            '&:hover': {
                                backgroundColor: actualTheme === 'dark' ? '#2ea043' : '#1a7f37'
                            }
                        }}
                    >
                        Ask Question
                    </Button>
                )}
            </Stack>

            {/* Login Notice */}
            {!isAuthenticated && (
                <Box
                    sx={{
                        mt: 3,
                        p: 2,
                        backgroundColor: actualTheme === 'dark' ? '#0d2818' : '#dafbe1',
                        border: `1px solid ${actualTheme === 'dark' ? '#1a7f37' : '#2da44e'}`,
                        borderRadius: '6px'
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: actualTheme === 'dark' ? '#2ea043' : '#1a7f37',
                            fontWeight: 500
                        }}
                    >
                        You need to log in to ask questions and answer questions.
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default DiscussionHeader;