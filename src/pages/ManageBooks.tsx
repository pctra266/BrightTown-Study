import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from "@mui/material";
import { Link } from "react-router-dom";
import CancelIcon from "@mui/icons-material/Cancel";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Toast, { type ToastData } from "../features/library-book/components/Toast";
import CreateEditViewBook, { BookMode, type Book } from "../features/library-book/components/CreateEditViewBook";
import api from "../api/api";
import { useAuth } from "../contexts/AuthContext";

interface Chapter {
  name: string;
}

const ManageBooks = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBook, setSelectedBook] = useState<Book>({
    isbn: "",
    title: "",
    author: "",
    copies: 0,
    chapters: [],
    content: {},
  });
  const [openNewBook, setOpenNewBook] = useState<boolean>(false);
  const [openEditBook, setOpenEditBook] = useState<boolean>(false);
  const [openViewBook, setOpenViewBook] = useState<boolean>(false);
  const [toastConfig, setToastConfig] = useState<ToastData>({
    open: false,
    message: "",
    type: "success",
  });

  const normalizeBook = (book: any): Book => ({
    ...book,
    id: String(book.id),
    chapters: book.chapters ? book.chapters.map((ch: any) => ({ name: ch.name })) : [],
    content: book.content || {},
    userId: book.userId || "",
  });

  const columns: GridColDef[] = [
    {
      field: "isbn",
      headerName: "ISBN",
      type: "string",
      minWidth: 180,
      renderHeader: (params) => (
        <strong style={{ color: "white" }}>{params.colDef.headerName}</strong>
      ),
      headerAlign: "left",
      align: "left",
      sortable: true,
      disableColumnMenu: true,
      flex: 1.3,
      headerClassName: "author-header",
    },
    {
      field: "title",
      headerName: "Title",
      type: "string",
      minWidth: 300,
      renderHeader: (params) => (
        <strong style={{ color: "white" }}>{params.colDef.headerName}</strong>
      ),
      headerAlign: "left",
      align: "left",
      sortable: true,
      disableColumnMenu: true,
      flex: 2.5,
      renderCell: (params) => (
        <Link
          to={`/books/${params.row.id}`}
          style={{
            color: "#1976D2",
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {params.value}
        </Link>
      ),
      headerClassName: "author-header",
    },
    {
      field: "author",
      headerName: "Author",
      type: "string",
      minWidth: 220,
      renderHeader: (params) => (
        <strong style={{ color: "white" }}>{params.colDef.headerName}</strong>
      ),
      headerAlign: "left",
      align: "left",
      sortable: true,
      disableColumnMenu: true,
      flex: 1.8,
      headerClassName: "author-header",
    },
    {
      field: "copies",
      headerName: "Copies",
      type: "number",
      minWidth: 120,
      renderHeader: (params) => (
        <strong style={{ color: "white" }}>{params.colDef.headerName}</strong>
      ),
      headerAlign: "left",
      align: "left",
      sortable: true,
      disableColumnMenu: true,
      flex: 1,
      headerClassName: "author-header",
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      sortable: false,
      disableColumnMenu: true,
      minWidth: 180,
      renderHeader: (params) => (
        <strong style={{ color: "white" }}>{params.colDef.headerName}</strong>
      ),
      headerAlign: "center",
      align: "center",
      flex: 1.2,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="View book">
            <IconButton
              onClick={() => {
                setSelectedBook(params.row);
                setOpenViewBook(true);
              }}
              sx={{
                color: "#1976D2",
                "&:hover": {
                  color: "#1557a0",
                  backgroundColor: "rgba(25, 118, 210, 0.1)",
                },
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          {user && (user.id === params.row.userId || user.role === "1") && (
            <>
              <Tooltip title="Edit book">
                <IconButton
                  onClick={() => {
                    setSelectedBook(params.row);
                    setOpenEditBook(true);
                  }}
                  sx={{
                    color: "#1976D2",
                    "&:hover": {
                      color: "#1557a0",
                      backgroundColor: "rgba(25, 118, 210, 0.1)",
                    },
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete book">
                <IconButton
                  onClick={() => handleDelete(params.row.id)}
                  sx={{
                    color: "#d32f2f",
                    "&:hover": {
                      color: "#b71c1c",
                      backgroundColor: "rgba(211, 47, 47, 0.1)",
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      ),
      headerClassName: "author-header",
    },
  ];

  const loadBooks = async () => {
    try {
      const response = await api.get("/books");
      if (response.data && Array.isArray(response.data)) {
        const normalizedBooks = response.data.map((book: Book) => normalizeBook(book));
        setRows(normalizedBooks);
        setToastConfig({
          open: true,
          message: "Books loaded successfully",
          type: "success",
        });
      } else {
        setRows([]);
        throw new Error("Invalid data format from server");
      }
    } catch (err) {
      console.error("Error loading books:", err);
      setRows([]);
      setToastConfig({
        open: true,
        message: "Failed to load books. Please check json-server at http://localhost:9000.",
        type: "error",
      });
    }
  };

  const handleSearch = (query: string) => {
    try {
      if (query) {
        const filteredBooks = rows.filter(
          (book) =>
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.author.toLowerCase().includes(query.toLowerCase()) ||
            book.isbn.toLowerCase().includes(query.toLowerCase())
        );
        setRows(filteredBooks);
      } else {
        loadBooks();
      }
    } catch (err) {
      console.error("Error searching books:", err);
      setToastConfig({
        open: true,
        message: "Failed to search books",
        type: "error",
      });
    }
  };

  const handleCreate = async (book: Book) => {
    if (!user) {
      setToastConfig({
        open: true,
        message: "You must be logged in to add a book",
        type: "error",
      });
      return;
    }
    try {
      const response = await api.get(`/books?isbn=${book.isbn}`);
      if (response.data.length > 0) {
        throw new Error("ISBN already exists");
      }
      const newBookResponse = await api.post("/books", {
        ...book,
        id: undefined,
        userId: user.id,
        chapters: book.chapters || [],
        content: book.content || {},
      });
      const newBook = normalizeBook(newBookResponse.data);
      setRows((prevRows) => [...prevRows, newBook]);
      setToastConfig({
        open: true,
        message: "Book created successfully",
        type: "success",
      });
      setOpenNewBook(false);
    } catch (err: any) {
      console.error("Error creating book:", err);
      setToastConfig({
        open: true,
        message: err.message || "Failed to create book",
        type: "error",
      });
    }
  };

  const handleUpdate = async (book: Book) => {
    try {
      if (!book.id) {
        throw new Error("Missing book ID");
      }
      if (!user) {
        throw new Error("You must be logged in to edit a book");
      }
      if (user.id !== book.userId && user.role !== "1") {
        throw new Error("You do not have permission to edit this book");
      }
      await api.put(`/books/${String(book.id)}`, book);
      const response = await api.get(`/books/${String(book.id)}`);
      const normalizedBook = normalizeBook(response.data);
      setRows((prevRows) =>
        prevRows.map((row) =>
          String(row.id) === String(book.id) ? normalizedBook : row
        ) as Book[]
      );
      setToastConfig({
        open: true,
        message: "Book updated successfully",
        type: "success",
      });
      setOpenEditBook(false);
    } catch (err: any) {
      console.error("Error updating book:", err);
      setToastConfig({
        open: true,
        message: err.message || "Failed to update book",
        type: "error",
      });
      await loadBooks();
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      const idString = String(id);
      const book = rows.find((row) => String(row.id) === idString);
      if (!book) {
        throw new Error("Book not found");
      }
      if (!user) {
        throw new Error("You must be logged in to delete a book");
      }
      if (user.id !== book.userId && user.role !== "1") {
        throw new Error("You do not have permission to delete this book");
      }
      await api.delete(`/books/${idString}`);
      setRows((prevRows) => prevRows.filter((row) => String(row.id) !== idString));
      setToastConfig({
        open: true,
        message: "Book deleted successfully",
        type: "success",
      });
    } catch (err: any) {
      console.error("Error deleting book:", err);
      await loadBooks();
      setToastConfig({
        open: true,
        message: err.message || "Failed to delete book. Data reloaded to sync.",
        type: "error",
      });
    }
  };

  const handleToastClose = () => {
    setToastConfig((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <Box
      bgcolor="linear-gradient(135deg, #1976D2, #42A5F5)"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      sx={{
        paddingBottom: "60px",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Box py={4} display="flex" justifyContent="center" alignItems="center">
        <Grid container justifyContent="center" alignItems="center">
          <Grid item display="flex" alignItems="center">
            <AutoStoriesOutlinedIcon
              sx={{ color: "white", fontSize: "3rem", mr: 2 }}
            />
          </Grid>
        </Grid>
      </Box>

      <Box px={2} pb={2}>
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Grid item xs={12} sm={8} md={9}>
            <Box sx={{ p: 1, borderRadius: "8px" }}>
              <TextField
                fullWidth
                variant="standard"
                label="Search books"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon sx={{ color: "#1976D2" }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ sx: { color: "#1976D2" } }}
                sx={{
                  maxWidth: "400px",
                  "& .MuiInputBase-root": { color: "#1976D2" },
                }}
              />
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            sm={4}
            md={3}
            sx={{ textAlign: { xs: "left", sm: "right" } }}
          >
            {user && (
              <Button
                variant="contained"
                sx={{
                  height: "35px",
                  fontWeight: "bold",
                  width: { xs: "100%", sm: "auto" },
                  background: "linear-gradient(135deg, #1976D2, #42A5F5)",
                  "&:hover": { background: "linear-gradient(135deg, #1557a0, #42A5F5)" },
                }}
                onClick={() => {
                  setSelectedBook({
                    isbn: "",
                    title: "",
                    author: "",
                    copies: 0,
                    chapters: [],
                    content: {},
                  });
                  setOpenNewBook(true);
                }}
              >
                Add book
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>

      <Box
        flex={1}
        px={2}
        pb={2}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 220px)",
          overflow: "hidden",
        }}
      >
        <Box
          border="2px solid white"
          borderRadius="6px"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            backgroundColor: "white",
            height: "100%",
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 15]}
            disableRowSelectionOnClick
            sx={{
              height: "100%",
              "& .MuiDataGrid-cell": {
                display: "flex",
                alignItems: "center",
                padding: "16px",
                fontSize: "1rem",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "transparent",
                fontSize: "1rem",
              },
              "& .MuiDataGrid-row": {
                height: "70px",
                "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                "&:hover": { backgroundColor: "#f0f0f0" },
              },
              "& .MuiDataGrid-virtualScroller": {
                minHeight: "200px",
              },
              "& .author-header": {
                backgroundColor: "#1976D2",
                color: "white",
              },
            }}
          />
        </Box>
      </Box>

      <Drawer anchor="right" open={openNewBook} onClose={() => setOpenNewBook(false)}>
        <Box
          width={{ xs: "100vw", sm: 400 }}
          height="100vh"
          bgcolor="linear-gradient(135deg, #1976D2, #42A5F5)"
        >
          <CreateEditViewBook
            book={selectedBook}
            mode={BookMode.CREATE}
            action={{ setIsDrawerOpen: setOpenNewBook, onConfirm: handleCreate }}
          />
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={openViewBook}
        onClose={() => setOpenViewBook(false)}
      >
        <Box
          width={{ xs: "100vw", sm: 400 }}
          height="100vh"
          bgcolor="linear-gradient(135deg, #1976D2, #42A5F5)"
        >
          <CreateEditViewBook
            book={selectedBook}
            mode={BookMode.VIEW}
            action={{ setIsDrawerOpen: setOpenViewBook, onConfirm: () => {} }}
          />
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={openEditBook}
        onClose={() => setOpenEditBook(false)}
      >
        <Box
          width={{ xs: "100vw", sm: 400 }}
          height="100vh"
          bgcolor="linear-gradient(135deg, #1976D2, #42A5F5)"
        >
          <CreateEditViewBook
            book={selectedBook}
            mode={BookMode.EDIT}
            action={{ setIsDrawerOpen: setOpenEditBook, onConfirm: handleUpdate }}
          />
        </Box>
      </Drawer>

      <Toast data={toastConfig} action={{ onClose: handleToastClose }} />
    </Box>
  );
};

export default ManageBooks;