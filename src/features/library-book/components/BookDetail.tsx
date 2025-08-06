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

import api from "../../../api/api";
import Toast, { type ToastData } from "../components/Toast";
import { useAuth } from "../../../contexts/AuthContext";

interface Book {
  id?: string | number;
  isbn: string;
  title: string;
  author: string;
  copies: number;
  chapters?: string[];
  content?: { [key: string]: string } | string;
  userId?: string;
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
        const loadedBook = { ...response.data, id: String(response.data.id), userId: response.data.userId || "" };
        setBook(loadedBook);
        if (loadedBook.chapters && loadedBook.chapters.length > 0) {
          setSelectedChapter(loadedBook.chapters[0]);
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
    if (user?.id !== book.userId) {
      setToastConfig({
        open: true,
        message: "You do not have permission to modify this book",
        type: "error",
      });
      return;
    }

    try {
      const updatedChapters = editChapter
        ? (book.chapters || []).map((ch) => (ch === editChapter ? chapterName : ch))
        : [...(book.chapters || []), chapterName];

      if (!editChapter && book.chapters?.includes(chapterName)) {
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

      const updatedBook = {
        ...book,
        chapters: updatedChapters,
        content: updatedContent,
      };

      await api.put(`/books/${id}`, updatedBook);
      setBook(updatedBook);
      setSelectedChapter(chapterName);
      setOpenDrawer(false);
      setChapterName("");
      setChapterContent("");
      setEditChapter(null);
      setToastConfig({
        open: true,
        message: editChapter ? "Chapter updated successfully" : "Chapter added successfully",
        type: "success",
      });
    } catch (err: any) {
      console.error("Error updating book:", err.message, err.response?.data);
      setToastConfig({
        open: true,
        message: `Failed to update book: ${err.message}`,
        type: "error",
      });
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
    if (user?.id !== book.userId) {
      setToastConfig({
        open: true,
        message: "You do not have permission to delete this chapter",
        type: "error",
      });
      return;
    }

    try {
      const updatedChapters = (book.chapters || []).filter((ch) => ch !== chapter);
      const updatedContent = { ...(typeof book.content === "object" ? book.content : {}) };
      delete updatedContent[chapter];

      const updatedBook = {
        ...book,
        chapters: updatedChapters,
        content: updatedContent,
      };

      await api.put(`/books/${id}`, updatedBook);
      setBook(updatedBook);
      if (selectedChapter === chapter) {
        setSelectedChapter(updatedChapters.length > 0 ? updatedChapters[0] : null);
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
    }
  };

  const handleEditChapter = (chapter: string) => {
    if (typeof book?.content === "object") {
      setChapterName(chapter);
      setChapterContent(book.content[chapter] || "");
      setEditChapter(chapter);
      setOpenDrawer(true);
    }
  };

  const handleToastClose = () => {
    setToastConfig((prev) => ({ ...prev, open: false }));
  };

  const getChapterContent = () => {
    if (book?.content && typeof book.content === "object" && selectedChapter && book.chapters?.includes(selectedChapter)) {
      return (book.content as { [key: string]: string })[selectedChapter] || "No content available for this chapter";
    }
    return "No content available";
  };

  const handlePreviousChapter = () => {
    if (book?.chapters && selectedChapter) {
      const currentIndex = book.chapters.indexOf(selectedChapter);
      if (currentIndex > 0) {
        setSelectedChapter(book.chapters[currentIndex - 1]);
      }
    }
  };

  const handleNextChapter = () => {
    if (book?.chapters && selectedChapter) {
      const currentIndex = book.chapters.indexOf(selectedChapter);
      if (currentIndex < book.chapters.length - 1) {
        setSelectedChapter(book.chapters[currentIndex + 1]);
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
          sx={{ mt: 2, width: "fit-content", background: "linear-gradient(135deg, #1976D2, #42A5F5)", '&:hover': { background: "linear-gradient(135deg, #1557a0, #42A5F5)" } }}
        >
          Back to Manage Books
        </Button>
      </Box>
    );
  }

  return (
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
        {user?.id === book.userId && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setChapterName("");
              setChapterContent("");
              setEditChapter(null);
              setOpenDrawer(true);
            }}
            sx={{ fontWeight: "bold", background: "linear-gradient(135deg, #1976D2, #42A5F5)", '&:hover': { background: "linear-gradient(135deg, #1557a0, #42A5F5)" } }}
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
              book.chapters.map((chapter, index) => (
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
                      primary={`Chapter ${index + 1}: ${chapter}`}
                      primaryTypographyProps={{ fontSize: "0.9rem", color: "white" }}
                      onClick={() => setSelectedChapter(chapter)}
                    />
                    {user?.id === book.userId && (
                      <>
                        <IconButton
                          onClick={() => handleEditChapter(chapter)}
                          sx={{ color: "#fff", mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteChapter(chapter)}
                          sx={{ color: "#d32f2f" }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </ListItem>
                  {index < book.chapters!.length - 1 && <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.3)" }} />}
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
                  book.chapters.indexOf(selectedChapter) === 0
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
                  book.chapters.indexOf(selectedChapter) === book.chapters.length - 1
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
          bgcolor="linear-gradient(135deg, #1976D2, #42A5F5)"
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
            sx={{ fontWeight: "bold", background: "linear-gradient(135deg, #1976D2, #42A5F5)", '&:hover': { background: "linear-gradient(135deg, #1557a0, #42A5F5)" } }}
            disabled={!chapterName.trim() || !chapterContent.trim()}
          >
            {editChapter ? "Update Chapter" : "Add Chapter"}
          </Button>
        </Box>
      </Drawer>

      <Toast data={toastConfig} action={{ onClose: handleToastClose }} />
    </Box>
  );
};

export default BookDetails;