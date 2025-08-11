import React, { useState } from 'react';
import {
    Box,
    Typography,
    Chip,
    Stack,
    TextField,
    Autocomplete,
    Alert,
} from '@mui/material';
import { PREDEFINED_TAGS, MAX_TAGS_PER_DISCUSSION } from '../constants/tags';
import { useThemeMode } from '../../../contexts/ThemeContext';

interface TagSelectorProps {
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    error?: string;
}

const TagSelector: React.FC<TagSelectorProps> = ({
    selectedTags,
    onTagsChange,
    error,
}) => {
    const { actualTheme } = useThemeMode();
    const [inputValue, setInputValue] = useState('');

    const handleTagToggle = (tag: string) => {
        if (selectedTags.includes(tag)) {
            // Remove tag
            onTagsChange(selectedTags.filter((t) => t !== tag));
        } else {
            // Add tag if under limit
            if (selectedTags.length < MAX_TAGS_PER_DISCUSSION) {
                onTagsChange([...selectedTags, tag]);
            }
        }
        setInputValue(''); // Clear input after selection
    };

    const handleAutocompleteChange = (_: React.SyntheticEvent, newValue: string[]) => {
        if (newValue.length <= MAX_TAGS_PER_DISCUSSION) {
            onTagsChange(newValue);
        }
    };

    return (
        <Box>
            <Typography
                variant="h6"
                sx={{
                    mb: 1,
                    fontWeight: 600,
                    fontSize: "1.125rem"
                }}
            >
                Tags
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
            >
                Add up to {MAX_TAGS_PER_DISCUSSION} tags to describe what your question is about. Start typing to see suggestions.
            </Typography>

            {/* Autocomplete for tag selection */}
            <Autocomplete
                multiple
                id="tags-autocomplete"
                options={[...PREDEFINED_TAGS] as string[]}
                value={selectedTags}
                onChange={handleAutocompleteChange}
                inputValue={inputValue}
                onInputChange={(_, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                filterSelectedOptions
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            variant="outlined"
                            label={option}
                            {...getTagProps({ index })}
                            key={option}
                            sx={{
                                backgroundColor: actualTheme === 'dark' ? "#1e2a3a" : "#e8f4fd",
                                borderColor: actualTheme === 'dark' ? "#3182ce" : "#39739d",
                                color: actualTheme === 'dark' ? "#63b3ed" : "#39739d",
                                "&:hover": {
                                    backgroundColor: actualTheme === 'dark' ? "#2a4055" : "#d4e9f7"
                                }
                            }}
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={selectedTags.length === 0 ? "Type to search for tags..." : ""}
                        error={Boolean(error)}
                        helperText={error || `${selectedTags.length}/${MAX_TAGS_PER_DISCUSSION} tags selected`}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: actualTheme === 'dark' ? '#2d3748' : '#ffffff',
                                color: actualTheme === 'dark' ? '#e2e8f0' : '#1a202c',
                                "&:hover fieldset": {
                                    borderColor: actualTheme === 'dark' ? '#718096' : '#cbd5e0',
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: actualTheme === 'dark' ? '#63b3ed' : '#3182ce',
                                    borderWidth: "2px",
                                },
                                "& fieldset": {
                                    borderColor: actualTheme === 'dark' ? '#4a5568' : '#e2e8f0',
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
                )}
                renderOption={(props, option) => (
                    <Box
                        component="li"
                        {...props}
                        sx={{
                            backgroundColor: actualTheme === 'dark' ? '#2d3748' : '#ffffff',
                            color: actualTheme === 'dark' ? '#e2e8f0' : '#1a202c',
                            "&:hover": {
                                backgroundColor: actualTheme === 'dark' ? '#4a5568' : '#f7fafc',
                            }
                        }}
                    >
                        {option}
                    </Box>
                )}
                slotProps={{
                    paper: {
                        sx: {
                            backgroundColor: actualTheme === 'dark' ? '#2d3748' : '#ffffff',
                            border: actualTheme === 'dark' ? '1px solid #4a5568' : '1px solid #e2e8f0',
                        }
                    }
                }}
                disabled={selectedTags.length >= MAX_TAGS_PER_DISCUSSION && inputValue === ''}
            />

            {/* Quick selection chips */}
            {selectedTags.length < MAX_TAGS_PER_DISCUSSION && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Popular tags:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {['general', 'study', 'flashcards', 'learning', 'tips'].map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant="outlined"
                                clickable
                                disabled={selectedTags.includes(tag)}
                                onClick={() => handleTagToggle(tag)}
                                sx={{
                                    backgroundColor: selectedTags.includes(tag)
                                        ? (actualTheme === 'dark' ? "#1e2a3a" : "#e8f4fd")
                                        : (actualTheme === 'dark' ? '#2d3748' : '#ffffff'),
                                    borderColor: selectedTags.includes(tag)
                                        ? (actualTheme === 'dark' ? "#3182ce" : "#39739d")
                                        : (actualTheme === 'dark' ? '#4a5568' : '#e2e8f0'),
                                    color: selectedTags.includes(tag)
                                        ? (actualTheme === 'dark' ? "#63b3ed" : "#39739d")
                                        : (actualTheme === 'dark' ? '#e2e8f0' : '#1a202c'),
                                    "&:hover": {
                                        backgroundColor: actualTheme === 'dark' ? '#4a5568' : '#edf2f7',
                                        borderColor: actualTheme === 'dark' ? '#63b3ed' : '#3182ce'
                                    },
                                    mb: 1
                                }}
                            />
                        ))}
                    </Stack>
                </Box>
            )}

            {selectedTags.length >= MAX_TAGS_PER_DISCUSSION && (
                <Alert severity="info" sx={{ mt: 2, fontSize: "0.875rem" }}>
                    You've reached the maximum of {MAX_TAGS_PER_DISCUSSION} tags. Remove a tag to add a new one.
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mt: 1, fontSize: "0.875rem" }}>
                    {error}
                </Alert>
            )}
        </Box>
    );
};

export default TagSelector;
