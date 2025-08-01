import React, { type ChangeEvent, useEffect, useState } from "react";
import { Box, Button, Grid, IconButton, TextField, Typography } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import colorConfigs from "../configs/colorConfigs";

export enum BookMode {
  CREATE = "Create",
  EDIT = "Edit",
  VIEW = "View",
}

export type Book = {
  isbn: string;
  title: string;
  author: string;
  copies: number;
};

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
    isbn: "",
    title: "",
    author: "",
    copies: 0,
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
  }, [mode]);

  useEffect(() => {
    setNewBook({ ...book });
  }, [book]);

  const handleClear = () => {
    setNewBook((prevState) => ({
      ...prevState,
      isbn: mode === BookMode.EDIT ? prevState.isbn : "",
      title: "",
      author: "",
      copies: 0,
    }));
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
      bgcolor={colorConfigs.mainBg}
      sx={{ borderLeft: "2px solid white", color: "white", p: 2 }}
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
            mb: 3
          }}
        >
          {mode} Book
        </Typography>

        {/* ISBN Field */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              color: "white",
              fontWeight: "bold",
              mb: 0.5
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
                  padding: "8px 0"
                },
                "& .MuiInput-underline:before": { borderBottomColor: "white" },
                "& .MuiInput-underline:after": { borderBottomColor: "white" },
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
                height: "20px"
              },
            }}
            sx={{
              "& .MuiFormHelperText-root": {
                marginLeft: 0
              }
            }}
          />
          {mode === BookMode.VIEW && (
            <Typography
              sx={{ 
                color: "yellow", 
                mt: 0.5,
                fontStyle: "italic",
                fontSize: "0.875rem",
                height: "20px"
              }}
            >
              Read Only
            </Typography>
          )}
        </Box>

        {/* Title Field */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              color: "white",
              fontWeight: "bold",
              mb: 0.5
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
                  padding: "8px 0"
                },
                "& .MuiInput-underline:before": { borderBottomColor: "white" },
                "& .MuiInput-underline:after": { borderBottomColor: "white" },
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
                height: "20px"
              },
            }}
          />
          {mode === BookMode.VIEW && (
            <Typography
              sx={{ 
                color: "yellow", 
                mt: 0.5,
                fontStyle: "italic",
                fontSize: "0.875rem",
                height: "20px"
              }}
            >
              Read Only
            </Typography>
          )}
        </Box>

        {/* Author Field */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              color: "white",
              fontWeight: "bold",
              mb: 0.5
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
                  padding: "8px 0"
                },
                "& .MuiInput-underline:before": { borderBottomColor: "white" },
                "& .MuiInput-underline:after": { borderBottomColor: "white" },
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
                height: "20px"
              },
            }}
          />
          {mode === BookMode.VIEW && (
            <Typography
              sx={{ 
                color: "yellow", 
                mt: 0.5,
                fontStyle: "italic",
                fontSize: "0.875rem",
                height: "20px"
              }}
            >
              Read Only
            </Typography>
          )}
        </Box>

        {/* Copies Field */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              color: "white",
              fontWeight: "bold",
              mb: 0.5
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
                  padding: "8px 0"
                },
                "& .MuiInput-underline:before": { borderBottomColor: "white" },
                "& .MuiInput-underline:after": { borderBottomColor: "white" },
              },
            }}
            id="book-copies"
            fullWidth
            variant="standard"
            type="number"
            value={newBook.copies === 0 ? "" : newBook.copies}
            inputProps={{ min: "0", max: "50" }}
            onKeyDown={(event) => {
              if (
                event.key === "e" ||
                event.key === "-" ||
                event.key === "." ||
                event.key === "+" ||
                event.key === "E"
              ) {
                event.preventDefault();
              }
            }}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const { value } = event.target;
              if (value === "") {
                setNewBook((prevState) => ({
                  ...prevState,
                  copies: 0,
                }));
                setError((prevState) => ({
                  ...prevState,
                  copiesError: "Book copies are required",
                }));
              } else if (!isNaN(Number(value)) && Number(value) <= 50) {
                setNewBook((prevState) => ({
                  ...prevState,
                  copies: Number(value),
                }));
                setError((prevState) => ({
                  ...prevState,
                  copiesError: " ",
                }));
              }
            }}
            error={error.copiesError !== " "}
            helperText={error.copiesError !== " " ? error.copiesError : " "}
            FormHelperTextProps={{
              sx: { 
                color: "red", 
                marginLeft: 0,
                height: "20px"
              },
            }}
          />
          {mode === BookMode.VIEW && (
            <Typography
              sx={{ 
                color: "yellow", 
                mt: 0.5,
                fontStyle: "italic",
                fontSize: "0.875rem",
                height: "20px"
              }}
            >
              Read Only
            </Typography>
          )}
        </Box>
      </Box>

      {(mode === BookMode.CREATE || mode === BookMode.EDIT) && (
        <Box display="flex" justifyContent="flex-end" gap={2} pb={2} pt={4} pr={4}>
          <Button
            variant="contained"
            color="inherit"
            sx={{ fontWeight: "bold", minWidth: "100px" }}
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            sx={{ fontWeight: "bold", minWidth: "100px" }}
            onClick={handleAction}
          >
            {mode} Book
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CreateEditViewBook;