import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowBack, Person, School, Forum, LibraryBooks, TrendingUp } from '@mui/icons-material';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button,
  Stack,
  Chip,
  Divider,
  Grid,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton
} from '@mui/material';

interface UserProfileData {
  id: string;
  username: string;
  role: string;
  status: boolean;
  flashcardSetsCount: number;
  discussionsCount: number;
  booksCount: number;
}

interface UserActivityData {
  flashcardSets: Array<{
    id: string;
    name: string;
    description: string;
    flashcards: Array<{
      id: string;
      question: string;
      answer: string;
    }>;
  }>;
  discussions: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
    upvotes: number;
    downvotes: number;
    views: number;
    score: number;
  }>;
  books: Array<{
    id: string;
    title: string;
    author: string;
    status: string;
  }>;
}

const API_BASE = 'http://localhost:9000';

const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case '0':
      return 'Super Admin';
    case '1':
      return 'Admin';
    case '2':
      return 'User';
    default:
      return role;
  }
};

const getRoleColor = (role: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (role) {
    case '0':
      return 'error';
    case '1':
      return 'warning';
    case '2':
      return 'primary';
    default:
      return 'default';
  }
};

const fetchUserProfile = async (userId: string): Promise<UserProfileData> => {
  try {
    // Fetch user data
    const userResponse = await fetch(`${API_BASE}/account`);
    const users = await userResponse.json();
    const user = users.find((u: any) => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Count user's flashcard sets
    const flashcardResponse = await fetch(`${API_BASE}/flashcardSets`);
    const flashcardSets = await flashcardResponse.json();
    const userFlashcardSets = flashcardSets.filter((set: any) => set.userId === userId);

    // Count user's discussions
    const discussionResponse = await fetch(`${API_BASE}/discussions`);
    const discussions = await discussionResponse.json();
    const userDiscussions = discussions.filter((d: any) => d.authorId === userId);

    // Count user's books
    const booksResponse = await fetch(`${API_BASE}/books`);
    const books = await booksResponse.json();
    const userBooks = books.filter((b: any) => b.userId === userId);

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
      flashcardSetsCount: userFlashcardSets.length,
      discussionsCount: userDiscussions.length,
      booksCount: userBooks.length,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

const fetchUserActivity = async (userId: string): Promise<UserActivityData> => {
  try {
    // Fetch user's flashcard sets
    const flashcardResponse = await fetch(`${API_BASE}/flashcardSets`);
    const allFlashcardSets = await flashcardResponse.json();
    const flashcardSets = allFlashcardSets.filter((set: any) => set.userId === userId);

    // Fetch user's discussions
    const discussionResponse = await fetch(`${API_BASE}/discussions`);
    const allDiscussions = await discussionResponse.json();
    const discussions = allDiscussions.filter((d: any) => d.authorId === userId);

    // Fetch user's books
    const booksResponse = await fetch(`${API_BASE}/books`);
    const allBooks = await booksResponse.json();
    const books = allBooks.filter((b: any) => b.userId === userId);

    return {
      flashcardSets: flashcardSets.map((set: any) => ({
        id: set.id,
        name: set.name,
        description: set.description,
        flashcards: set.flashcards || [],
      })),
      discussions: discussions.map((d: any) => ({
        id: d.id,
        title: d.title,
        content: d.content,
        createdAt: d.createdAt,
        upvotes: d.upvotes || 0,
        downvotes: d.downvotes || 0,
        views: d.views || 0,
        score: d.score || 0,
      })),
      books: books.map((b: any) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        status: b.status,
      })),
    };
  } catch (error) {
    console.error('Error fetching user activity:', error);
    throw error;
  }
};

const UserProfileView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [activity, setActivity] = useState<UserActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (!id) {
        setError('User ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [profileData, activityData] = await Promise.all([
          fetchUserProfile(id),
          fetchUserActivity(id),
        ]);
        setProfile(profileData);
        setActivity(activityData);
      } catch (err) {
        setError('Failed to load user profile');
        console.error('Error loading user data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Skeleton variant="rectangular" height={200} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={300} />
            </Grid>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rectangular" height={300} />
            </Grid>
          </Grid>
        </Stack>
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Person sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              User Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {error || 'The user profile you are looking for does not exist.'}
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
        variant="outlined"
      >
        Back
      </Button>

      {/* Profile Header */}
      <Card sx={{ mb: 4, overflow: 'visible' }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          position: 'relative'
        }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: '2rem',
                border: '3px solid rgba(255,255,255,0.3)'
              }}
            >
              {profile.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {profile.username}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={getRoleDisplayName(profile.role)}
                  color={getRoleColor(profile.role)}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
                <Chip
                  label={profile.status ? 'Active' : 'Inactive'}
                  color={profile.status ? 'success' : 'error'}
                  sx={{ 
                    bgcolor: profile.status ? 'rgba(76,175,80,0.8)' : 'rgba(244,67,54,0.8)', 
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Activity Stats */}
        <CardContent>
          <Grid container spacing={3} sx={{ textAlign: 'center' }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, bgcolor: 'primary.50' }}>
                <School sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {profile.flashcardSetsCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Flashcard Sets
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, bgcolor: 'info.50' }}>
                <Forum sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {profile.discussionsCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Discussions
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, bgcolor: 'success.50' }}>
                <LibraryBooks sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {profile.booksCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Books
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Activity Details */}
      <Grid container spacing={4}>
        {/* Recent Discussions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Forum color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Recent Discussions
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              {activity?.discussions.length ? (
                <List>
                  {activity.discussions.slice(0, 5).map((discussion) => (
                    <ListItem
                      key={discussion.id}
                      component={Link}
                      to={`/talk/${discussion.id}`}
                      sx={{ 
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' },
                        textDecoration: 'none',
                        color: 'inherit',
                        p: 1,
                        mb: 1
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Forum />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" noWrap>
                            {discussion.title}
                          </Typography>
                        }
                        secondary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              icon={<TrendingUp />}
                              label={`Score: ${discussion.score}`}
                              size="small"
                              color={discussion.score > 0 ? 'success' : discussion.score < 0 ? 'error' : 'default'}
                            />
                            <Typography variant="caption">
                              {formatDate(discussion.createdAt)}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No discussions created yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Flashcard Sets */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <School color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Recent Flashcard Sets
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              
              {activity?.flashcardSets.length ? (
                <List>
                  {activity.flashcardSets.slice(0, 5).map((set) => (
                    <ListItem
                      key={set.id}
                      component={Link}
                      to={`/library/flashcard/${set.id}/play`}
                      sx={{ 
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' },
                        textDecoration: 'none',
                        color: 'inherit',
                        p: 1,
                        mb: 1
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          <School />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" noWrap>
                            {set.name}
                          </Typography>
                        }
                        secondary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={`${set.flashcards.length} cards`}
                              size="small"
                              color="primary"
                            />
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No flashcard sets created yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Books Section - Full Width if any books exist */}
      {activity?.books.length ? (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <LibraryBooks color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Books ({activity.books.length})
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              {activity.books.map((book) => (
                <Grid item xs={12} sm={6} md={4} key={book.id}>
                  <Paper sx={{ p: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                    <Typography variant="subtitle2" noWrap gutterBottom>
                      {book.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      by {book.author}
                    </Typography>
                    <Chip
                      label={book.status}
                      size="small"
                      color={
                        book.status === 'approved' ? 'success' :
                        book.status === 'pending' ? 'warning' : 'error'
                      }
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      ) : null}
    </Container>
  );
};

export default UserProfileView;