import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useThemeMode } from "../../../contexts/ThemeContext";
import { discussionService } from "../services/DiscussionService";
import StackOverflowLayout from "./StackOverflowLayout";
import DiscussionHeader from "./DiscussionHeader";
import DiscussionSidebar from "./DiscussionSidebar";
import QuestionList from "./QuestionList";

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
    const discussionsPerPage = 15;

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

    const handleDiscussionClick = (id: string) => {
        navigate(`/talk/${id}`);
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

    const handleClearTagFilter = () => {
        setSelectedTagFilter([]);
    };


    const totalPages = Math.ceil(filteredDiscussions.length / discussionsPerPage);
    const startIndex = (currentPage - 1) * discussionsPerPage;
    const currentDiscussions = filteredDiscussions.slice(
        startIndex,
        startIndex + discussionsPerPage
    );

    if (loading) {
        return (
            <StackOverflowLayout>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '400px',
                    color: actualTheme === 'dark' ? '#e6edf3' : '#1f2328'
                }}>
                    Loading...
                </div>
            </StackOverflowLayout>
        );
    }

    return (
        <StackOverflowLayout
            header={
                <DiscussionHeader
                    questionCount={filteredDiscussions.length}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />
            }
            sidebar={
                <DiscussionSidebar
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    selectedTagFilter={selectedTagFilter}
                    onTagFilter={handleTagFilter}
                    onClearTagFilter={handleClearTagFilter}
                    questionCount={discussions.length}
                />
            }
        >
            <QuestionList
                discussions={currentDiscussions}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onQuestionClick={handleDiscussionClick}
            />
        </StackOverflowLayout>
    );
};

export default DiscussionHub;