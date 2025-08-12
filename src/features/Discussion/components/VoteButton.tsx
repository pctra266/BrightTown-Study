import React from "react";
import { IconButton, Typography, Box } from "@mui/material";
import { KeyboardArrowUp, KeyboardArrowDown, CheckCircle } from "@mui/icons-material";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "@mui/material/styles";

interface VoteButtonsProps {
    score: number;
    userVote?: "upvote" | "downvote";
    onUpvote: () => void;
    onDownvote: () => void;
    disabled?: boolean;
    isAccepted?: boolean;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({
    score,
    userVote,
    onUpvote,
    onDownvote,
    disabled = false,
    isAccepted = false,
}) => {
    const { isAuthenticated } = useAuth();
    const theme = useTheme();

    const canVote = isAuthenticated && !disabled;

    const getScoreColor = () => {
        if (score > 0) return theme.palette.success.main;
        if (score < 0) return theme.palette.error.main;
        return theme.palette.text.secondary;
    };

    const upvoteColor = userVote === "upvote" ? theme.palette.success.main : theme.palette.text.secondary;
    const downvoteColor = userVote === "downvote" ? theme.palette.error.main : theme.palette.text.secondary;

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 48,
                py: 1,
            }}
        >
            <IconButton
                onClick={onUpvote}
                disabled={!canVote}
                sx={{
                    p: 1,
                    borderRadius: "50%",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                        backgroundColor: canVote
                            ? theme.palette.mode === "dark"
                                ? "rgba(94, 186, 125, 0.08)"
                                : "rgba(94, 186, 125, 0.04)"
                            : "transparent",
                        transform: canVote ? "scale(1.1)" : "none",
                    },
                    "&:active": {
                        transform: canVote ? "scale(0.95)" : "none",
                    },
                }}
            >
                <KeyboardArrowUp
                    sx={{
                        fontSize: 28,
                        color: upvoteColor,
                        transition: "color 0.2s ease-in-out",
                        filter: userVote === "upvote" ? "drop-shadow(0 0 2px currentColor)" : "none",
                    }}
                />
            </IconButton>

            <Typography
                variant="h6"
                className="discussion-meta"
                sx={{
                    minHeight: 24,
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: getScoreColor(),
                    textShadow: score !== 0 ? "0 0 1px currentColor" : "none",
                    transition: "all 0.2s ease-in-out",
                    my: 0.5,
                }}
            >
                {score > 0 ? `+${score}` : score}
            </Typography>

            <IconButton
                onClick={onDownvote}
                disabled={!canVote}
                sx={{
                    p: 1,
                    borderRadius: "50%",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                        backgroundColor: canVote
                            ? theme.palette.mode === "dark"
                                ? "rgba(209, 56, 61, 0.08)"
                                : "rgba(209, 56, 61, 0.04)"
                            : "transparent",
                        transform: canVote ? "scale(1.1)" : "none",
                    },
                    "&:active": {
                        transform: canVote ? "scale(0.95)" : "none",
                    },
                }}
            >
                <KeyboardArrowDown
                    sx={{
                        fontSize: 28,
                        color: downvoteColor,
                        transition: "color 0.2s ease-in-out",
                        filter: userVote === "downvote" ? "drop-shadow(0 0 2px currentColor)" : "none",
                    }}
                />
            </IconButton>

            {/* Accepted Answer Checkmark */}
            {isAccepted && (
                <Box
                    sx={{
                        mt: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <CheckCircle
                        sx={{
                            fontSize: 24,
                            color: theme.palette.success.main,
                            filter: "drop-shadow(0 0 3px currentColor)",
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default VoteButtons;
