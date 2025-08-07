import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  CircularProgress,
  Button,
  Drawer,
  TextField,
  Tooltip,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ReplayIcon from "@mui/icons-material/Replay";

import api from "../../../api/api";
import Toast, { type ToastData } from "../components/Toast";
import { useAuth } from "../../../contexts/AuthContext";

interface Chapter {
  name: string;
  status: "pending" | "approved" | "rejected";
}

interface Book {
  id?: string | number;
  isbn: string;
  title: string;
  author: string;
  copies: number;
  chapters?: Chapter[];
  content?: { [key: string]: string };
  userId?: string;
  status?: "pending" | "approved" | "rejected";
  chapterStatuses?: { [key: string]: "pending" | "approved" | "rejected" };
}

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Error in component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <Typography variant="h6" color="error">Something went wrong. Please try again.</Typography>;
    }
    return this.props.children;
  }
}

const BookDetails = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastConfig, setToastConfig] = useState<ToastData>({
    open: false,
    message: "",
    type: "success",
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [chapterName, setChapterName] = useState<string>("");
  const [chapterContent, setChapterContent] = useState<string>("");
  const [editChapter, setEditChapter] = useState<string | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const normalizeBook = (data: any): Book => ({
    ...data,
    id: String(data.id),
    chapters: data.chapters
      ? data.chapters.map((ch: any) =>
          typeof ch === "string" ? { name: ch, status: data.chapterStatuses?.[ch] || "approved" } : ch
        )
      : [],
    content: data.content || {},
    chapterStatuses: data.chapterStatuses || {},
    userId: data.userId || "",
    status: data.status || "approved",
  });

  const loadBookDetails = async () => {
    if (!id) {
      setToastConfig({
        open: true,
        message: "Book ID is missing",
        type: "error",
      });
      setLoading(false);
      return;
    }

    try {
      console.log(`Fetching book with ID: ${id}`);
      const response = await api.get(`/books/${id}`);
      console.log("API response:", response.data);
      if (response.data) {
        const loadedBook = normalizeBook(response.data);
        setBook(loadedBook);
        if (loadedBook.chapters && loadedBook.chapters.length > 0) {
          setSelectedChapter(loadedBook.chapters[0].name);
        }
        setToastConfig({
          open: true,
          message: "Book details loaded successfully",
          type: "success",
        });
      } else {
        throw new Error("No data returned from server");
      }
    } catch (err: any) {
      console.error("Error loading book details:", err.message, err.response?.data);
      setToastConfig({
        open: true,
        message: `Failed to load book details: ${err.message}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookDetails();
  }, [id]);

  useEffect(() => {
    if (isPlaying && synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
    }
  }, [selectedChapter]);

  const handleAddOrUpdateChapter = async () => {
    if (!chapterName.trim()) {
      setToastConfig({
        open: true,
        message: "Chapter name is required",
        type: "error",
      });
      return;
    }
    if (!chapterContent.trim()) {
      setToastConfig({
        open: true,
        message: "Chapter content is required",
        type: "error",
      });
      return;
    }
    if (!book || !id) {
      setToastConfig({
        open: true,
        message: "Book data is missing",
        type: "error",
      });
      return;
    }
    if (user?.id !== book.userId && user?.role !== "1") {
      setToastConfig({
        open: true,
        message: "You do not have permission to modify this book",
        type: "error",
      });
      return;
    }
    if (book.status !== "approved") {
      setToastConfig({
        open: true,
        message: "Cannot modify chapters of a book that is not approved",
        type: "error",
      });
      return;
    }

    try {
      const updatedChapters = editChapter
        ? (book.chapters || []).map((ch) =>
            ch.name === editChapter ? { name: chapterName, status: ch.status } : ch
          )
        : [...(book.chapters || []), { name: chapterName, status: "pending" }];

      if (!editChapter && book.chapters?.some((ch) => ch.name === chapterName)) {
        setToastConfig({
          open: true,
          message: "Chapter name already exists",
          type: "error",
        });
        return;
      }

      const updatedContent = {
        ...(typeof book.content === "object" ? book.content : {}),
        [chapterName]: chapterContent,
      };
      if (editChapter && editChapter !== chapterName) {
        delete updatedContent[editChapter];
      }

      const updatedChapterStatuses = {
        ...(book.chapterStatuses || {}),
        [chapterName]: editChapter ? book.chapterStatuses?.[editChapter] || "approved" : "pending",
      };
      if (editChapter && editChapter !== chapterName) {
        delete updatedChapterStatuses[editChapter];
      }

      const updatedBook = {
        ...book,
        chapters: updatedChapters,
        content: updatedContent,
        chapterStatuses: updatedChapterStatuses,
      };

      await api.put(`/books/${id}`, updatedBook);
      const response = await api.get(`/books/${id}`);
      const loadedBook = normalizeBook(response.data);
      setBook(loadedBook);
      const newSelectedChapter = updatedChapters.some((ch) => ch.name === chapterName)
        ? chapterName
        : updatedChapters.length > 0
        ? updatedChapters[0].name
        : null;
      setSelectedChapter(newSelectedChapter);
      setOpenDrawer(false);
      setChapterName("");
      setChapterContent("");
      setEditChapter(null);
      setToastConfig({
        open: true,
        message: editChapter ? "Chapter updated successfully" : "Chapter submitted for approval",
        type: "success",
      });
    } catch (err: any) {
      console.error("Error updating book:", err.message, err.response?.data);
      setToastConfig({
        open: true,
        message: `Failed to update book: ${err.message}`,
        type: "error",
      });
      await loadBookDetails();
    }
  };

  const handleDeleteChapter = async (chapter: string) => {
    if (!book || !id) {
      setToastConfig({
        open: true,
        message: "Book data is missing",
        type: "error",
      });
      return;
    }
    if (user?.id !== book.userId && user?.role !== "1") {
      setToastConfig({
        open: true,
        message: "You do not have permission to delete this chapter",
        type: "error",
      });
      return;
    }
    if (book.status !== "approved") {
      setToastConfig({
        open: true,
        message: "Cannot delete chapters of a book that is not approved",
        type: "error",
      });
      return;
    }

    try {
      const chapterObj = book.chapters?.find((ch) => ch.name === chapter);
      if (chapterObj?.status !== "approved") {
        setToastConfig({
          open: true,
          message: "Only approved chapters can be deleted",
          type: "error",
        });
        return;
      }

      const updatedChapters = (book.chapters || []).filter((ch) => ch.name !== chapter);
      const updatedContent = { ...(typeof book.content === "object" ? book.content : {}) };
      delete updatedContent[chapter];
      const updatedChapterStatuses = { ...(book.chapterStatuses || {}) };
      delete updatedChapterStatuses[chapter];

      const updatedBook = {
        ...book,
        chapters: updatedChapters,
        content: updatedContent,
        chapterStatuses: updatedChapterStatuses,
      };

      await api.put(`/books/${id}`, updatedBook);
      const response = await api.get(`/books/${id}`);
      const loadedBook = normalizeBook(response.data);
      setBook(loadedBook);
      if (selectedChapter === chapter) {
        setSelectedChapter(updatedChapters.length > 0 ? updatedChapters[0].name : null);
      }
      setToastConfig({
        open: true,
        message: "Chapter deleted successfully",
        type: "success",
      });
    } catch (err: any) {
      console.error("Error deleting chapter:", err.message, err.response?.data);
      setToastConfig({
        open: true,
        message: `Failed to delete chapter: ${err.message}`,
        type: "error",
      });
      await loadBookDetails();
    }
  };

  const handleEditChapter = (chapter: string) => {
    if (!book) return;
    const chapterObj = book.chapters?.find((ch) => ch.name === chapter);
    if (chapterObj?.status !== "approved" && chapterObj?.status !== "rejected") {
      setToastConfig({
        open: true,
        message: "Only approved or rejected chapters can be edited",
        type: "error",
      });
      return;
    }
    if (typeof book.content === "object") {
      setChapterName(chapter);
      setChapterContent(book.content[chapter] || "");
      setEditChapter(chapter);
      setOpenDrawer(true);
    }
  };

  const handleApproveChapter = async (chapter: string) => {
    if (!book || !id) {
      setToastConfig({
        open: true,
        message: "Book data is missing",
        type: "error",
      });
      return;
    }
    if (!user || user.role !== "1") {
      setToastConfig({
        open: true,
        message: "Only admins can approve chapters",
        type: "error",
      });
      return;
    }

    try {
      const updatedChapterStatuses = {
        ...(book.chapterStatuses || {}),
        [chapter]: "approved",
      };
      const updatedBook = {
        ...book,
        chapterStatuses: updatedChapterStatuses,
        chapters: book.chapters?.map((ch) =>
          ch.name === chapter ? { ...ch, status: "approved" } : ch
        ),
      };

      await api.put(`/books/${id}`, updatedBook);
      const response = await api.get(`/books/${id}`);
      const loadedBook = normalizeBook(response.data);
      setBook(loadedBook);
      setToastConfig({
        open: true,
        message: "Chapter approved successfully",
        type: "success",
      });
    } catch (err: any) {
      console.error("Error approving chapter:", err);
      setToastConfig({
        open: true,
        message: `Failed to approve chapter: ${err.message}`,
        type: "error",
      });
      await loadBookDetails();
    }
  };

  const handleRejectChapter = async (chapter: string) => {
    if (!book || !id) {
      setToastConfig({
        open: true,
        message: "Book data is missing",
        type: "error",
      });
      return;
    }
    if (!user || user.role !== "1") {
      setToastConfig({
        open: true,
        message: "Only admins can reject chapters",
        type: "error",
      });
      return;
    }

    try {
      const updatedChapterStatuses = {
        ...(book.chapterStatuses || {}),
        [chapter]: "rejected",
      };
      const updatedBook = {
        ...book,
        chapterStatuses: updatedChapterStatuses,
        chapters: book.chapters?.map((ch) =>
          ch.name === chapter ? { ...ch, status: "rejected" } : ch
        ),
      };

      await api.put(`/books/${id}`, updatedBook);
      const response = await api.get(`/books/${id}`);
      const loadedBook = normalizeBook(response.data);
      setBook(loadedBook);
      setToastConfig({
        open: true,
        message: "Chapter rejected successfully",
        type: "success",
      });
    } catch (err: any) {
      console.error("Error rejecting chapter:", err);
      setToastConfig({
        open: true,
        message: `Failed to reject chapter: ${err.message}`,
        type: "error",
      });
      await loadBookDetails();
    }
  };

  const handleResubmitChapter = async (chapter: string) => {
    if (!book || !id) {
      setToastConfig({
        open: true,
        message: "Book data is missing",
        type: "error",
      });
      return;
    }
    if (!user || (user.id !== book.userId && user.role !== "1")) {
      setToastConfig({
        open: true,
        message: "You do not have permission to resubmit this chapter",
        type: "error",
      });
      return;
    }

    try {
      const updatedChapterStatuses = {
        ...(book.chapterStatuses || {}),
        [chapter]: "pending",
      };
      const updatedBook = {
        ...book,
        chapterStatuses: updatedChapterStatuses,
        chapters: book.chapters?.map((ch) =>
          ch.name === chapter ? { ...ch, status: "pending" } : ch
        ),
      };

      await api.put(`/books/${id}`, updatedBook);
      const response = await api.get(`/books/${id}`);
      const loadedBook = normalizeBook(response.data);
      setBook(loadedBook);
      setToastConfig({
        open: true,
        message: "Chapter resubmitted for approval",
        type: "success",
      });
    } catch (err: any) {
      console.error("Error resubmitting chapter:", err);
      setToastConfig({
        open: true,
        message: `Failed to resubmit chapter: ${err.message}`,
        type: "error",
      });
      await loadBookDetails();
    }
  };

  const handleToastClose = () => {
    setToastConfig((prev) => ({ ...prev, open: false }));
  };

  const getChapterContent = () => {
    if (
      book?.content &&
      typeof book.content === "object" &&
      selectedChapter &&
      book.chapters?.some((ch) => ch.name === selectedChapter)
    ) {
      return (
        (book.content as { [key: string]: string })[selectedChapter] ||
        "No content available for this chapter"
      );
    }
    return "No content available";
  };

  const handlePreviousChapter = () => {
    if (book?.chapters && selectedChapter) {
      const currentIndex = book.chapters.findIndex((ch) => ch.name === selectedChapter);
      if (currentIndex > 0) {
        setSelectedChapter(book.chapters[currentIndex - 1].name);
      }
    }
  };

  const handleNextChapter = () => {
    if (book?.chapters && selectedChapter) {
      const currentIndex = book.chapters.findIndex((ch) => ch.name === selectedChapter);
      if (currentIndex < book.chapters.length - 1) {
        setSelectedChapter(book.chapters[currentIndex + 1].name);
      }
    }
  };

  const handleListen = () => {
    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      if (isPlaying) {
        synthRef.current.cancel();
        setIsPlaying(false);
      } else {
        const content = getChapterContent();
        if (content !== "No content available") {
          utteranceRef.current = new SpeechSynthesisUtterance(content);
          utteranceRef.current.onend = () => setIsPlaying(false);
          synthRef.current.speak(utteranceRef.current);
          setIsPlaying(true);
        } else {
          setToastConfig({
            open: true,
            message: "No content available to read.",
            type: "warning",
          });
        }
      }
    } else {
      setToastConfig({
        open: true,
        message: "Text-to-speech is not supported in this browser.",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="linear-gradient(135deg, #1976D2, #42A5F5)"
      >
        <CircularProgress sx={{ color: "white" }} />
      </Box>
    );
  }

  if (!book) {
    return (
      <Box
        bgcolor="linear-gradient(135deg, #1976D2, #42A5F5)"
        minHeight="100vh"
        p={4}
        display="flex"
        flexDirection="column"
      >
        <Typography variant="h5" color="white">
          Book not found
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/manage-book")}
          sx={{
            mt: 2,
            width: "fit-content",
            background: "linear-gradient(135deg, #1976D2, #42A5F5)",
            "&:hover": { background: "linear-gradient(135deg, #1557a0, #42A5F5)" },
          }}
        >
          Back to Manage Books
        </Button>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box
        bgcolor="linear-gradient(135deg, #1976D2, #42A5F5)"
        minHeight="100vh"
        p={4}
        display="flex"
        flexDirection="column"
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4} sx={{ p: 2, borderRadius: "8px" }}>
          <Box display="flex" alignItems="center">
            <IconButton onClick={() => navigate("/manage-book")} sx={{ color: "#1976D2", mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h3" color="#1976D2" fontWeight="bold">
              {book.title}
            </Typography>
          </Box>
          {user && (user.id === book.userId || user.role === "1") && book.status === "approved" && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setChapterName("");
                setChapterContent("");
                setEditChapter(null);
                setOpenDrawer(true);
              }}
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(135deg, #1976D2, #42A5F5)",
                "&:hover": { background: "linear-gradient(135deg, #1557a0, #42A5F5)" },
              }}
            >
              Add Chapter
            </Button>
          )}
        </Box>

        <Box display="flex" flex={1} minHeight={0}>
          <Box
            sx={{
              width: "15%",
              bgcolor: "#1976D2",
              borderRadius: "12px",
              mr: 2,
              overflowY: "auto",
              maxHeight: "calc(100vh - 200px)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 6px 18px rgba(0, 0, 0, 0.3)",
                transform: "scale(1.02)",
              },
            }}
          >
            <List>
              {book.chapters && book.chapters.length > 0 ? (
                book.chapters
                  .filter((chapter) =>
                    user && (user.id === book.userId || user.role === "1")
                      ? true // Show all chapters (including rejected) for owner or admin
                      : chapter.status === "approved" // Show only approved chapters for others
                  )
                  .map((chapter, index) => (
                    <React.Fragment key={index}>
                      <ListItem
                        sx={{
                          "&.Mui-selected": {
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            borderRadius: "6px",
                          },
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            borderRadius: "6px",
                          },
                        }}
                      >
                        <ListItemText
                          primary={`Chapter ${index + 1}: ${chapter.name}`}
                          primaryTypographyProps={{ fontSize: "0.9rem", color: "white" }}
                          onClick={() => setSelectedChapter(chapter.name)}
                        />
                        {user && (user.id === book.userId || user.role === "1") && (
                          <>
                            {(chapter.status === "approved" || chapter.status === "rejected") && (
                              <>
                                <Tooltip title="Edit chapter">
                                  <IconButton
                                    onClick={() => handleEditChapter(chapter.name)}
                                    sx={{ color: "#fff", mr: 1 }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            {chapter.status === "approved" && (
                              <Tooltip title="Delete chapter">
                                <IconButton
                                  onClick={() => handleDeleteChapter(chapter.name)}
                                  sx={{ color: "#d32f2f", mr: 1 }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip
                              title={
                                chapter.status === "pending"
                                  ? "Pending approval"
                                  : chapter.status === "rejected"
                                  ? "Rejected"
                                  : "Approved"
                              }
                            >
                              <IconButton
                                sx={{
                                  color:
                                    chapter.status === "pending"
                                      ? "#ff9800"
                                      : chapter.status === "rejected"
                                      ? "#d32f2f"
                                      : "#4caf50",
                                  "&:hover": {
                                    backgroundColor:
                                      chapter.status === "pending"
                                        ? "rgba(255, 152, 0, 0.1)"
                                        : chapter.status === "rejected"
                                        ? "rgba(211, 47, 47, 0.1)"
                                        : "rgba(76, 175, 80, 0.1)",
                                  },
                                }}
                              >
                                {chapter.status === "pending" ? (
                                  <HourglassEmptyIcon />
                                ) : chapter.status === "rejected" ? (
                                  <CloseIcon />
                                ) : (
                                  <CheckIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                            {(user.id === book.userId || user.role === "1") && chapter.status === "rejected" && (
                              <Tooltip title="Resubmit chapter for approval">
                                <IconButton
                                  onClick={() => handleResubmitChapter(chapter.name)}
                                  sx={{
                                    color: "#d21919",
                                    "&:hover": {
                                      color: "#c71010",
                                      backgroundColor: "rgba(25, 118, 210, 0.1)",
                                    },
                                  }}
                                >
                                  <ReplayIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            {user && user.role === "1" && chapter.status === "pending" && (
                              <>
                                <Tooltip title="Approve chapter">
                                  <IconButton
                                    onClick={() => handleApproveChapter(chapter.name)}
                                    sx={{
                                      color: "#4caf50",
                                      "&:hover": {
                                        color: "#388e3c",
                                        backgroundColor: "rgba(76, 175, 80, 0.1)",
                                      },
                                    }}
                                  >
                                    <CheckIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject chapter">
                                  <IconButton
                                    onClick={() => handleRejectChapter(chapter.name)}
                                    sx={{
                                      color: "#d32f2f",
                                      "&:hover": {
                                        color: "#b71c1c",
                                        backgroundColor: "rgba(211, 47, 47, 0.1)",
                                      },
                                    }}
                                  >
                                    <CloseIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </>
                        )}
                      </ListItem>
                      {index < book.chapters!.filter((chapter) =>
                        user && (user.id === book.userId || user.role === "1")
                          ? true
                          : chapter.status === "approved"
                      ).length - 1 && (
                        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.3)" }} />
                      )}
                    </React.Fragment>
                  ))
              ) : (
                <ListItem>
                  <ListItemText primary="No chapters available" sx={{ color: "white" }} />
                </ListItem>
              )}
            </List>
          </Box>

          <Box
            sx={{
              flex: 1,
              bgcolor: "white",
              p: 2,
              borderRadius: "12px",
              overflowY: "auto",
              maxHeight: "calc(100vh - 200px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h5"
              color="text.primary"
              gutterBottom
              sx={{ textAlign: "center" }}
            >
              {selectedChapter || "No chapter selected"}
            </Typography>
            <Box flex={1} display="flex" flexDirection="column" justifyContent="space-between">
              <Typography variant="body1">
                {getChapterContent()}
              </Typography>
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <IconButton
                  onClick={handlePreviousChapter}
                  disabled={
                    !selectedChapter ||
                    !book.chapters ||
                    book.chapters.findIndex((ch) => ch.name === selectedChapter) === 0
                  }
                  sx={{ color: "#1976D2", mr: 2 }}
                >
                  <ArrowUpwardIcon />
                </IconButton>
                <IconButton
                  onClick={handleNextChapter}
                  disabled={
                    !selectedChapter ||
                    !book.chapters ||
                    book.chapters.findIndex((ch) => ch.name === selectedChapter) ===
                      book.chapters.length - 1
                  }
                  sx={{ color: "#1976D2", mr: 2 }}
                >
                  <ArrowDownwardIcon />
                </IconButton>
                <IconButton
                  onClick={handleListen}
                  sx={{ color: isPlaying ? "#d32f2f" : "#1976D2" }}
                >
                  <VolumeUpIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>

        <Drawer anchor="right" open={openDrawer} onClose={() => setOpenDrawer(false)}>
          <Box
            width={{ xs: "100vw", sm: 400 }}
            height="100vh"
            bgcolor="#1976D2"
            p={4}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" color="white" fontWeight="bold">
                {editChapter ? "Edit Chapter" : "Add Chapter"}
              </Typography>
              <IconButton onClick={() => setOpenDrawer(false)}>
                <CancelIcon sx={{ color: "white" }} />
              </IconButton>
            </Box>
            <TextField
              label="Chapter Name"
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
              fullWidth
              variant="standard"
              InputProps={{ sx: { color: "white" } }}
              InputLabelProps={{ sx: { color: "white" } }}
              sx={{ mb: 3 }}
            />
            <TextField
              label="Chapter Content"
              value={chapterContent}
              onChange={(e) => setChapterContent(e.target.value)}
              fullWidth
              variant="standard"
              multiline
              rows={10}
              InputProps={{ sx: { color: "white" } }}
              InputLabelProps={{ sx: { color: "white" } }}
              sx={{ mb: 3 }}
            />
            <Button
              variant="contained"
              onClick={handleAddOrUpdateChapter}
              fullWidth
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(135deg, #1976D2, #42A5F5)",
                "&:hover": { background: "linear-gradient(135deg, #1557a0, #42A5F5)" },
              }}
              disabled={!chapterName.trim() || !chapterContent.trim()}
            >
              {editChapter ? "Update Chapter" : "Add Chapter"}
            </Button>
          </Box>
        </Drawer>

        <Toast data={toastConfig} action={{ onClose: handleToastClose }} />
      </Box>
    </ErrorBoundary>
  );
};

export default BookDetails;