
import React, { type ChangeEvent, useEffect, useState } from "react";
import { Box, Button, IconButton, TextField, Typography } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";

export enum BookMode {
  CREATE = "Create",
  EDIT = "Edit",
  VIEW = "View",
}

interface Chapter {
  name: string;
  status: "pending" | "approved" | "rejected";
}

export interface Book {
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

export type BookAction = {
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onConfirm: (book: Book) => void;
};

type Props = {
  mode: BookMode;
  book: Book;
  action: BookAction;
};

const CreateEditViewBook: React.FC<Props> = ({ mode, book, action }) => {
  const [newBook, setNewBook] = useState<Book>({
    id: book.id,
    isbn: book.isbn || "",
    title: book.title || "",
    author: book.author || "",
    copies: book.copies || 0,
    chapters: book.chapters || [],
    content: book.content || {},
    userId: book.userId || "",
    status: book.status || "pending",
  });
  const [error, setError] = useState<{
    isbnError: string;
    titleError: string;
    authorError: string;
    copiesError: string;
  }>({
    isbnError: " ",
    titleError: " ",
    authorError: " ",
    copiesError: " ",
  });

  useEffect(() => {
    if (mode === BookMode.CREATE) {
      setTimeout(() => {
        document.getElementById("book-isbn")?.focus();
      }, 500);
    } else if (mode === BookMode.EDIT) {
      setTimeout(() => {
        document.getElementById("book-title")?.focus();
      }, 500);
    }
    setNewBook({
      id: book.id,
      isbn: book.isbn || "",
      title: book.title || "",
      author: book.author || "",
      copies: book.copies || 0,
      chapters: book.chapters || [],
      content: book.content || {},
      userId: book.userId || "",
      status: mode === BookMode.CREATE ? "pending" : book.status || "approved",
    });
  }, [book, mode]);

  const handleClear = () => {
    setNewBook({
      id: mode === BookMode.EDIT ? book.id : undefined,
      isbn: mode === BookMode.EDIT ? book.isbn : "",
      title: "",
      author: "",
      copies: 0,
      chapters: [],
      content: {},
      userId: "",
      status: "pending",
    });
    setError({
      isbnError: " ",
      titleError: " ",
      authorError: " ",
      copiesError: " ",
    });
  };

  const handleAction = () => {
    if (error.isbnError !== " ") {
      document.getElementById("book-isbn")?.focus();
      return;
    }
    if (error.titleError !== " ") {
      document.getElementById("book-title")?.focus();
      return;
    }
    if (error.authorError !== " ") {
      document.getElementById("book-author")?.focus();
      return;
    }
    if (error.copiesError !== " ") {
      document.getElementById("book-copies")?.focus();
      return;
    }
    if (!newBook.isbn || !newBook.title || !newBook.author || newBook.copies === 0) {
      if (newBook.copies === 0) {
        document.getElementById("book-copies")?.focus();
        setError((prevState) => ({
          ...prevState,
          copiesError: "Book copies are required",
        }));
      }
      if (!newBook.author) {
        document.getElementById("book-author")?.focus();
        setError((prevState) => ({
          ...prevState,
          authorError: "Book author is required",
        }));
      }
      if (!newBook.title) {
        document.getElementById("book-title")?.focus();
        setError((prevState) => ({
          ...prevState,
          titleError: "Book title is required",
        }));
      }
      if (!newBook.isbn) {
        document.getElementById("book-isbn")?.focus();
        setError((prevState) => ({
          ...prevState,
          isbnError: "Book isbn is required",
        }));
      }
      return;
    }
    action.onConfirm(newBook);
  };

  return (
    <Box
      position="relative"
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      bgcolor="#1976D2"
      sx={{ borderLeft: "2px solid #1976D2", color: "white", p: 2 }}
    >
      <Box position="absolute" top={12} right={5}>
        <IconButton onClick={() => action.setIsDrawerOpen(false)}>
          <CancelIcon sx={{ color: "white" }} />
        </IconButton>
      </Box>

      <Box sx={{ p: 2 }}>
        <Typography
          variant="h5"
          sx={{
            color: "white",
            fontWeight: "bold",
            textAlign: "left",
            mb: 3,
          }}
        >
          {mode} Book
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              color: "white",
              fontWeight: "bold",
              mb: 0.5,
            }}
          >
            Book ISBN
          </Typography>
          <TextField
            required
            InputProps={{
              readOnly: mode === BookMode.VIEW,
              sx: {
                color: "white",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                "& .MuiInputBase-input": {
                  color: "white",
                  padding: "8px 0",
                },
                "& .MuiInput-underline:before": { borderBottomColor: "#1976D2" },
                "& .MuiInput-underline:after": { borderBottomColor: "#1976D2" },
              },
            }}
            id="book-isbn"
            fullWidth
            variant="standard"
            value={newBook.isbn}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const { value } = event.target;
              if (value.trim() === "") {
                setError((prevState) => ({
                  ...prevState,
                  isbnError: "Book isbn is required",
                }));
              } else if (!/^\d{3}-\d-\d{2}-\d{6}-\d$/.test(value)) {
                setError((prevState) => ({
                  ...prevState,
                  isbnError: "Enter valid book isbn number",
                }));
              } else {
                setError((prevState) => ({
                  ...prevState,
                  isbnError: " ",
                }));
              }
              setNewBook((prevState) => ({
                ...prevState,
                isbn: value,
              }));
            }}
            error={error.isbnError !== " "}
            helperText={error.isbnError !== " " ? error.isbnError : " "}
            FormHelperTextProps={{
              sx: {
                color: "red",
                marginLeft: 0,
                height: "20px",
              },
            }}
          />
          {mode === BookMode.VIEW && (
            <Typography
              sx={{
                color: "#afe619",
                mt: 0.5,
                fontStyle: "italic",
                fontSize: "0.875rem",
                height: "20px",
              }}
            >
              Read Only
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              color: "white",
              fontWeight: "bold",
              mb: 0.5,
            }}
          >
            Book Title *
          </Typography>
          <TextField
            required
            InputProps={{
              readOnly: mode === BookMode.VIEW,
              sx: {
                color: "white",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                "& .MuiInputBase-input": {
                  color: "white",
                  padding: "8px 0",
                },
                "& .MuiInput-underline:before": { borderBottomColor: "#1976D2" },
                "& .MuiInput-underline:after": { borderBottomColor: "#1976D2" },
              },
            }}
            id="book-title"
            fullWidth
            variant="standard"
            value={newBook.title}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const { value } = event.target;
              if (value.trim() === "") {
                setError((prevState) => ({
                  ...prevState,
                  titleError: "Book title is required",
                }));
              } else if (!/^[A-Za-z][A-Za-z. ]+$/.test(value)) {
                setError((prevState) => ({
                  ...prevState,
                  titleError: "Enter valid book title",
                }));
              } else {
                setError((prevState) => ({
                  ...prevState,
                  titleError: " ",
                }));
              }
              setNewBook((prevState) => ({
                ...prevState,
                title: value,
              }));
            }}
            error={error.titleError !== " "}
            helperText={error.titleError !== " " ? error.titleError : " "}
            FormHelperTextProps={{
              sx: {
                color: "red",
                marginLeft: 0,
                height: "20px",
              },
            }}
          />
          {mode === BookMode.VIEW && (
            <Typography
              sx={{
                color: "#afe619",
                mt: 0.5,
                fontStyle: "italic",
                fontSize: "0.875rem",
                height: "20px",
              }}
            >
              Read Only
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              color: "white",
              fontWeight: "bold",
              mb: 0.5,
            }}
          >
            Book Author *
          </Typography>
          <TextField
            required
            InputProps={{
              readOnly: mode === BookMode.VIEW,
              sx: {
                color: "white",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                "& .MuiInputBase-input": {
                  color: "white",
                  padding: "8px 0",
                },
                "& .MuiInput-underline:before": { borderBottomColor: "#1976D2" },
                "& .MuiInput-underline:after": { borderBottomColor: "#1976D2" },
              },
            }}
            id="book-author"
            fullWidth
            variant="standard"
            value={newBook.author}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const { value } = event.target;
              if (value.trim() === "") {
                setError((prevState) => ({
                  ...prevState,
                  authorError: "Book author is required",
                }));
              } else if (!/^[A-Za-z][A-Za-z. ]+$/.test(value)) {
                setError((prevState) => ({
                  ...prevState,
                  authorError: "Enter valid book author",
                }));
              } else {
                setError((prevState) => ({
                  ...prevState,
                  authorError: " ",
                }));
              }
              setNewBook((prevState) => ({
                ...prevState,
                author: value,
              }));
            }}
            error={error.authorError !== " "}
            helperText={error.authorError !== " " ? error.authorError : " "}
            FormHelperTextProps={{
              sx: {
                color: "red",
                marginLeft: 0,
                height: "20px",
              },
            }}
          />
          {mode === BookMode.VIEW && (
            <Typography
              sx={{
                color: "#afe619",
                mt: 0.5,
                fontStyle: "italic",
                fontSize: "0.875rem",
                height: "20px",
              }}
            >
              Read Only
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              color: "white",
              fontWeight: "bold",
              mb: 0.5,
            }}
          >
            Book Copies *
          </Typography>
          <TextField
            required
            InputProps={{
              readOnly: mode === BookMode.VIEW,
              sx: {
                color: "white",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                "& .MuiInputBase-input": {
                  color: "white",
                  padding: "8px 0",
                },
                "& .MuiInput-underline:before": { borderBottomColor: "#1976D2" },
                "& .MuiInput-underline:after": { borderBottomColor: "#1976D2" },
              },
            }}
            id="book-copies"
            type="number"
            fullWidth
            variant="standard"
            value={newBook.copies}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const value = parseInt(event.target.value);
              if (isNaN(value) || value <= 0) {
                setError((prevState) => ({
                  ...prevState,
                  copiesError: "Enter valid number of book copies",
                }));
              } else {
                setError((prevState) => ({
                  ...prevState,
                  copiesError: " ",
                }));
              }
              setNewBook((prevState) => ({
                ...prevState,
                copies: value,
              }));
            }}
            error={error.copiesError !== " "}
            helperText={error.copiesError !== " " ? error.copiesError : " "}
            FormHelperTextProps={{
              sx: {
                color: "red",
                marginLeft: 0,
                height: "20px",
              },
            }}
          />
          {mode === BookMode.VIEW && (
            <Typography
              sx={{
                color: "#afe619",
                mt: 0.5,
                fontStyle: "italic",
                fontSize: "0.875rem",
                height: "20px",
              }}
            >
              Read Only
            </Typography>
          )}
        </Box>
      </Box>

      {mode !== BookMode.VIEW && (
        <Box sx={{ p: 2, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            sx={{
              flex: 1,
              fontWeight: "bold",
              background: "linear-gradient(135deg, #1976D2, #42A5F5)",
              "&:hover": { background: "linear-gradient(135deg, #1557a0, #42A5F5)" },
            }}
            onClick={handleAction}
          >
            {mode === BookMode.CREATE ? "Create" : "Update"}
          </Button>
          <Button
            variant="contained"
            sx={{
              flex: 1,
              fontWeight: "bold",
              background: "linear-gradient(135deg, #d32f2f, #ef5350)",
              "&:hover": { background: "linear-gradient(135deg, #b71c1c, #ef5350)" },
            }}
            onClick={handleClear}
          >
            Clear
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CreateEditViewBook;
