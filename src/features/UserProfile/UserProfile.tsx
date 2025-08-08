import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Container, Paper, Box, CircularProgress, Alert } from "@mui/material";

// Define interfaces locally to avoid import issues
interface User {
    id: string;
    username: string;
    role: string;
    status: boolean | null;
}

interface FlashcardSet {
    id: string;
    name: string;
    description: string;
    userId: string;
    flashcards: Array<{
        id: string;
        question: string;
        answer: string;
        image: { id: string; url: string; alt: string } | null;
    }>;
}

interface Discussion {
    id: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: string;
    upvotes: number;
    downvotes: number;
    score: number;
    views: number;
    answers: Array<{
        id: string;
        content: string;
        authorId: string;
        authorName: string;
        createdAt: string;
        upvotes: number;
        downvotes: number;
        score: number;
    }>;
}

interface Book {
    id: string;
    title: string;
    author: string;
    userId: string;
    status: "approved" | "pending" | "rejected";
    chapters: Array<{ name: string; status: string }> | string[];
}

interface UserStats {
    totalFlashcardSets: number;
    totalFlashcards: number;
    totalDiscussions: number;
    totalAnswers: number;
    totalBooks: number;
    totalDiscussionViews: number;
    averageDiscussionScore: number;
    joinDate: string;
}

interface UserProfileData {
    user: User;
    flashcardSets: FlashcardSet[];
    discussions: Discussion[];
    books: Book[];
    stats: UserStats;
}

// Service function to fetch user profile data
const getUserProfileData = async (userId: string): Promise<UserProfileData> => {
    try {
        // Fetch user data
        const userResponse = await fetch(`http://localhost:9000/account`);
        const allUsers: User[] = await userResponse.json();
        const user = allUsers.find(u => u.id === userId);
        
        if (!user) {
            throw new Error("User not found");
        }

        // Fetch flashcard sets
        const flashcardResponse = await fetch(`http://localhost:9000/flashcardSets`);
        const allFlashcardSets: FlashcardSet[] = await flashcardResponse.json();
        const flashcardSets = allFlashcardSets.filter(set => set.userId === userId);

        // Fetch discussions
        const discussionResponse = await fetch(`http://localhost:9000/discussions`);
        const allDiscussions: Discussion[] = await discussionResponse.json();
        const discussions = allDiscussions.filter(discussion => discussion.authorId === userId);

        // Fetch books
        const bookResponse = await fetch(`http://localhost:9000/books`);
        const allBooks: Book[] = await bookResponse.json();
        const books = allBooks.filter(book => book.userId === userId);

        // Calculate user answers in discussions
        const userAnswers = allDiscussions.reduce((count, discussion) => {
            return count + discussion.answers.filter(answer => answer.authorId === userId).length;
        }, 0);

        // Calculate total discussion views for user's discussions
        const totalDiscussionViews = discussions.reduce((total, discussion) => {
            return total + (discussion.views || 0);
        }, 0);

        // Calculate average discussion score
        const totalScore = discussions.reduce((total, discussion) => total + discussion.score, 0);
        const averageDiscussionScore = discussions.length > 0 ? totalScore / discussions.length : 0;

        // Calculate total flashcards
        const totalFlashcards = flashcardSets.reduce((total, set) => total + set.flashcards.length, 0);

        // Estimate join date (using the earliest created item or fallback)
        const joinDate = new Date().toISOString(); // Fallback to current date

        const stats: UserStats = {
            totalFlashcardSets: flashcardSets.length,
            totalFlashcards,
            totalDiscussions: discussions.length,
            totalAnswers: userAnswers,
            totalBooks: books.length,
            totalDiscussionViews,
            averageDiscussionScore,
            joinDate
        };

        return {
            user,
            flashcardSets,
            discussions,
            books,
            stats
        };
    } catch (error) {
        console.error("Error fetching user profile data:", error);
        throw error;
    }
};

const UserProfile = () => {
    const { user, isAuthenticated } = useAuth();
    const [profileData, setProfileData] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user?.id) {
                setError("User not found");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await getUserProfileData(user.id);
                setProfileData(data);
            } catch (err) {
                setError("Failed to load profile data");
                console.error("Error fetching profile data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && user) {
            fetchProfileData();
        } else {
            setLoading(false);
        }
    }, [user, isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="warning">
                    Please log in to view your profile.
                </Alert>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error || !profileData) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">
                    {error || "Failed to load profile data"}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Profile Header */}
            <Paper elevation={3} sx={{ p: 4, mb: 4, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: '50%', 
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: 'bold'
                    }}>
                        {profileData.user.username.charAt(0).toUpperCase()}
                    </Box>
                    
                    <Box sx={{ flex: 1 }}>
                        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>
                            {profileData.user.username}
                        </h1>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1, mb: 2 }}>
                            <Box sx={{ 
                                px: 2, 
                                py: 0.5, 
                                bgcolor: profileData.user.role === "0" ? "#d32f2f" : profileData.user.role === "1" ? "#ed6c02" : "#2e7d32",
                                borderRadius: 1,
                                color: 'white',
                                fontSize: '0.875rem',
                                fontWeight: 'bold'
                            }}>
                                {profileData.user.role === "0" ? "Super Admin" : profileData.user.role === "1" ? "Admin" : "User"}
                            </Box>
                            <Box sx={{ 
                                px: 2, 
                                py: 0.5, 
                                bgcolor: profileData.user.status ? "#2e7d32" : "#d32f2f",
                                borderRadius: 1,
                                color: 'white',
                                fontSize: '0.875rem',
                                fontWeight: 'bold'
                            }}>
                                {profileData.user.status ? "Active" : "Inactive"}
                            </Box>
                        </Box>
                        <p style={{ margin: 0, opacity: 0.9 }}>
                            Member since {new Date(profileData.stats.joinDate).toLocaleDateString()}
                        </p>
                    </Box>

                    <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 4 }}>
                            <Box>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                                    {profileData.stats.totalFlashcardSets}
                                </div>
                                <div style={{ opacity: 0.8, fontSize: '0.875rem' }}>
                                    Flashcard Sets
                                </div>
                            </Box>
                            <Box>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                                    {profileData.stats.totalDiscussions}
                                </div>
                                <div style={{ opacity: 0.8, fontSize: '0.875rem' }}>
                                    Discussions
                                </div>
                            </Box>
                            <Box>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                                    {profileData.stats.totalBooks}
                                </div>
                                <div style={{ opacity: 0.8, fontSize: '0.875rem' }}>
                                    Books
                                </div>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Paper>
            
            {/* Activity Dashboard */}
            <Paper elevation={2} sx={{ p: 3 }}>
                <h2 style={{ marginBottom: '2rem', fontWeight: 'bold' }}>
                    Activity Dashboard
                </h2>

                {/* Statistics Cards */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                        <div style={{ fontSize: '2.5rem', color: '#1976d2', marginBottom: '0.5rem' }}>📚</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                            {profileData.stats.totalFlashcards}
                        </div>
                        <div style={{ color: '#666', fontSize: '0.875rem' }}>
                            Total Flashcards
                        </div>
                    </Paper>
                    
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e5f5' }}>
                        <div style={{ fontSize: '2.5rem', color: '#7b1fa2', marginBottom: '0.5rem' }}>💬</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                            {profileData.stats.totalAnswers}
                        </div>
                        <div style={{ color: '#666', fontSize: '0.875rem' }}>
                            Answers Given
                        </div>
                    </Paper>
                    
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e8' }}>
                        <div style={{ fontSize: '2.5rem', color: '#388e3c', marginBottom: '0.5rem' }}>👁️</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                            {profileData.stats.totalDiscussionViews}
                        </div>
                        <div style={{ color: '#666', fontSize: '0.875rem' }}>
                            Discussion Views
                        </div>
                    </Paper>
                    
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                        <div style={{ fontSize: '2.5rem', color: '#f57c00', marginBottom: '0.5rem' }}>📈</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                            {profileData.stats.averageDiscussionScore.toFixed(1)}
                        </div>
                        <div style={{ color: '#666', fontSize: '0.875rem' }}>
                            Avg Discussion Score
                        </div>
                    </Paper>
                </Box>

                {/* Activity Sections */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, gap: 4 }}>
                    {/* Flashcard Sets */}
                    <Paper sx={{ p: 3 }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📚 Recent Flashcard Sets
                        </h3>
                        {profileData.flashcardSets.length > 0 ? (
                            <Box>
                                {profileData.flashcardSets.slice(0, 5).map((set) => (
                                    <Box key={set.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                                        <div style={{ fontWeight: 'medium', marginBottom: '0.25rem' }}>
                                            {set.name}
                                        </div>
                                        <div style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                            {set.description}
                                        </div>
                                        <Box sx={{ 
                                            display: 'inline-block', 
                                            px: 1, 
                                            py: 0.25, 
                                            bgcolor: '#e3f2fd', 
                                            borderRadius: 1, 
                                            fontSize: '0.75rem',
                                            color: '#1976d2'
                                        }}>
                                            {set.flashcards.length} cards
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <div style={{ color: '#666', textAlign: 'center', padding: '1rem' }}>
                                No flashcard sets created yet
                            </div>
                        )}
                    </Paper>

                    {/* Discussions */}
                    <Paper sx={{ p: 3 }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            💬 Recent Discussions
                        </h3>
                        {profileData.discussions.length > 0 ? (
                            <Box>
                                {profileData.discussions.slice(0, 5).map((discussion) => (
                                    <Box key={discussion.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                                        <div style={{ fontWeight: 'medium', marginBottom: '0.25rem' }}>
                                            {discussion.title}
                                        </div>
                                        <div style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                            {discussion.content.length > 100 
                                                ? `${discussion.content.substring(0, 100)}...` 
                                                : discussion.content
                                            }
                                        </div>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Box sx={{ 
                                                display: 'inline-block', 
                                                px: 1, 
                                                py: 0.25, 
                                                bgcolor: discussion.score > 0 ? '#e8f5e8' : discussion.score < 0 ? '#ffebee' : '#f5f5f5',
                                                color: discussion.score > 0 ? '#2e7d32' : discussion.score < 0 ? '#d32f2f' : '#666',
                                                borderRadius: 1, 
                                                fontSize: '0.75rem'
                                            }}>
                                                Score: {discussion.score}
                                            </Box>
                                            <Box sx={{ 
                                                display: 'inline-block', 
                                                px: 1, 
                                                py: 0.25, 
                                                bgcolor: '#f5f5f5', 
                                                borderRadius: 1, 
                                                fontSize: '0.75rem',
                                                color: '#666'
                                            }}>
                                                {discussion.views} views
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <div style={{ color: '#666', textAlign: 'center', padding: '1rem' }}>
                                No discussions created yet
                            </div>
                        )}
                    </Paper>

                    {/* Books */}
                    <Paper sx={{ p: 3 }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📖 Recent Books
                        </h3>
                        {profileData.books.length > 0 ? (
                            <Box>
                                {profileData.books.slice(0, 5).map((book) => (
                                    <Box key={book.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                                        <div style={{ fontWeight: 'medium', marginBottom: '0.25rem' }}>
                                            {book.title}
                                        </div>
                                        <div style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                            by {book.author}
                                        </div>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Box sx={{ 
                                                display: 'inline-block', 
                                                px: 1, 
                                                py: 0.25, 
                                                bgcolor: book.status === "approved" ? '#e8f5e8' : book.status === "pending" ? '#fff3e0' : '#ffebee',
                                                color: book.status === "approved" ? '#2e7d32' : book.status === "pending" ? '#f57c00' : '#d32f2f',
                                                borderRadius: 1, 
                                                fontSize: '0.75rem'
                                            }}>
                                                {book.status}
                                            </Box>
                                            <Box sx={{ 
                                                display: 'inline-block', 
                                                px: 1, 
                                                py: 0.25, 
                                                bgcolor: '#f5f5f5', 
                                                borderRadius: 1, 
                                                fontSize: '0.75rem',
                                                color: '#666'
                                            }}>
                                                {Array.isArray(book.chapters) ? book.chapters.length : Object.keys(book.chapters || {}).length} chapters
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <div style={{ color: '#666', textAlign: 'center', padding: '1rem' }}>
                                No books contributed yet
                            </div>
                        )}
                    </Paper>
                </Box>
            </Paper>
        </Container>
    );
};

export default UserProfile;