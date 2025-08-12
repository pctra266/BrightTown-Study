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
            // Remove tag - this won't happen from Popular tags since they're disabled when selected
            onTagsChange(selectedTags.filter((t) => t !== tag));
        } else {
            // Add tag if under limit and not already selected
            // Add tag if under limit
            if (selectedTags.length < MAX_TAGS_PER_DISCUSSION) {
                onTagsChange([...selectedTags, tag]);
            }
        }
        setInputValue(''); // Clear input after selection
    };

    const handleAutocompleteChange = (_: React.SyntheticEvent, newValue: string[]) => {
        // Always allow removing tags, only restrict adding new ones when at limit
        if (newValue.length < selectedTags.length) {
            // Tag was removed, always allow
            onTagsChange(newValue);
        } else if (newValue.length <= MAX_TAGS_PER_DISCUSSION) {
            // Tag was added and we're under limit
            onTagsChange(newValue);
        }
        // If trying to add a tag when at limit, do nothing (silently ignore)
    };

    return (
        <Box>
            <Typography
                variant="h6"
                className="discussion-header"
                sx={{
                    mb: 1,
                    fontWeight: 700,
                    fontSize: "1.125rem"
                }}
            >
                Tags
            </Typography>
            <Typography
                variant="body2"
                className="discussion-text"
                color="text.secondary"
                sx={{ mb: 2, fontWeight: 500 }}
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
                getOptionDisabled={(option) => {
                    // Only disable if not already selected AND we're at max capacity
                    return !selectedTags.includes(option) && selectedTags.length >= MAX_TAGS_PER_DISCUSSION;
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
                                },
                                "& .MuiChip-deleteIcon": {
                                    color: actualTheme === 'dark' ? "#63b3ed" : "#39739d",
                                    "&:hover": {
                                        color: actualTheme === 'dark' ? "#fc8181" : "#e53e3e"
                                    }
                                }
                            }}
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={selectedTags.length === 0 ? "Type to search for tags..." :
                            selectedTags.length >= MAX_TAGS_PER_DISCUSSION ? "Remove a tag to add more..." :
                                "Add more tags..."}
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
                renderOption={(props, option) => {
                    const isSelected = selectedTags.includes(option);
                    const canAdd = selectedTags.length < MAX_TAGS_PER_DISCUSSION;
                    const isDisabled = !isSelected && !canAdd;

                    return (
                        <Box
                            component="li"
                            {...props}
                            sx={{
                                backgroundColor: actualTheme === 'dark' ? '#2d3748' : '#ffffff',
                                color: isDisabled
                                    ? (actualTheme === 'dark' ? '#4a5568' : '#a0aec0')
                                    : (actualTheme === 'dark' ? '#e2e8f0' : '#1a202c'),
                                "&:hover": {
                                    backgroundColor: !isDisabled ? (actualTheme === 'dark' ? '#4a5568' : '#f7fafc') : undefined,
                                },
                                opacity: isDisabled ? 0.6 : 1,
                                cursor: isDisabled ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {option} {isSelected && "✓"}
                        </Box>
                    );
                }}
                slotProps={{
                    paper: {
                        sx: {
                            backgroundColor: actualTheme === 'dark' ? '#2d3748' : '#ffffff',
                            border: actualTheme === 'dark' ? '1px solid #4a5568' : '1px solid #e2e8f0',
                        }
                    }
                }}
            />

            {/* Quick selection chips */}
            <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Popular tags:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                    {['general', 'study', 'flashcards', 'learning', 'tips'].map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        const isDisabled = isSelected; // Disable if tag is already selected

                        return (
                            <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant="outlined"
                                clickable={!isDisabled}
                                disabled={isDisabled}
                                onClick={() => !isDisabled && handleTagToggle(tag)}
                                sx={{
                                    backgroundColor: isSelected
                                        ? (actualTheme === 'dark' ? "#1e2a3a" : "#e8f4fd")
                                        : (actualTheme === 'dark' ? '#2d3748' : '#ffffff'),
                                    borderColor: isSelected
                                        ? (actualTheme === 'dark' ? "#3182ce" : "#39739d")
                                        : (actualTheme === 'dark' ? '#4a5568' : '#e2e8f0'),
                                    color: isSelected
                                        ? (actualTheme === 'dark' ? "#63b3ed" : "#39739d")
                                        : isDisabled
                                            ? (actualTheme === 'dark' ? '#4a5568' : '#a0aec0')
                                            : (actualTheme === 'dark' ? '#e2e8f0' : '#1a202c'),
                                    "&:hover": !isDisabled ? {
                                        backgroundColor: actualTheme === 'dark' ? '#4a5568' : '#edf2f7',
                                        borderColor: actualTheme === 'dark' ? '#63b3ed' : '#3182ce'
                                    } : {},
                                    mb: 1,
                                    opacity: isDisabled ? 0.5 : 1,
                                    cursor: isDisabled ? 'not-allowed' : 'pointer'
                                }}
                            />
                        );
                    })}
                </Stack>
            </Box>

            {selectedTags.length >= MAX_TAGS_PER_DISCUSSION && (
                <Alert severity="info" sx={{ mt: 2, fontSize: "0.875rem" }}>
                    You've reached the maximum of {MAX_TAGS_PER_DISCUSSION} tags. Click the X on any tag above or remove tags from the input field to add different ones.
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
