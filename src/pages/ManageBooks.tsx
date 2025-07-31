import { Box, Button, Drawer, Grid, IconButton, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import CancelIcon from "@mui/icons-material/Cancel";
import colorConfigs from "../features/library-book/configs/colorConfigs";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import Footer from "../features/library-book/components/Footer";
import { useEffect, useState } from "react";
import CreateEditViewBook, { type Book, BookMode } from "../features/library-book/components/CreateEditViewBook";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Toast, { type ToastData } from "../features/library-book/components/Toast";
import api from '../api/api';

const ManageBooks = () => {
  const [rows, setRows] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBook, setSelectedBook] = useState<Book>({ isbn: "", title: "", author: "", copies: 0 });
  const [openNewBook, setOpenNewBook] = useState<boolean>(false);
  const [openEditBook, setOpenEditBook] = useState<boolean>(false);
  const [openViewBook, setOpenViewBook] = useState<boolean>(false);
  const [toastConfig, setToastConfig] = useState<ToastData>({ open: false, message: "", type: "success" });

  const columns: GridColDef[] = [
    {
      field: "isbn",
      headerName: "ISBN",
      type: "string",
      minWidth: 180,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      headerAlign: "left",
      align: "left",
      sortable: true,
      disableColumnMenu: true,
      flex: 1.3,
    },
    {
      field: "title",
      headerName: "Title",
      type: "string",
      minWidth: 300,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      headerAlign: "left",
      align: "left",
      sortable: true,
      disableColumnMenu: true,
      flex: 2.5,
    },
    {
      field: "author",
      headerName: "Author",
      type: "string",
      minWidth: 220,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      headerAlign: "left",
      align: "left",
      sortable: true,
      disableColumnMenu: true,
      flex: 1.8,
    },
    {
      field: "copies",
      headerName: "Copies",
      type: "number",
      minWidth: 120,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      headerAlign: "left",
      align: "left",
      sortable: true,
      disableColumnMenu: true,
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      sortable: false,
      disableColumnMenu: true,
      minWidth: 180,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      headerAlign: "center",
      align: "center",
      flex: 1.2,
      renderCell: (params) => (
        <>
          <Tooltip title="View book">
            <IconButton
              onClick={() => {
                setSelectedBook(params.row);
                setOpenViewBook(true);
              }}
              sx={{
                color: "#1976d2",
                "&:hover": {
                  color: "#1557a0",
                  backgroundColor: "rgba(25, 118, 210, 0.1)",
                },
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit book">
            <IconButton
              onClick={() => {
                setSelectedBook(params.row);
                setOpenEditBook(true);
              }}
              sx={{
                color: "#1976d2",
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
              onClick={() => handleDelete(params.row.isbn)}
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
      ),
    },
  ];

  const loadBooks = async () => {
    try {
      const response = await api.get("/books");
      console.log("Books loaded:", response.data); // Log để kiểm tra
      setRows(response.data);
      setToastConfig({
        open: true,
        message: "Books loaded successfully",
        type: "success",
      });
    } catch (err: any) {
      console.error("Error loading books:", err.response || err);
      setToastConfig({
        open: true,
        message: err.response?.data?.message || err.message || "Failed to load books",
        type: "error",
      });
    }
  };

  const handleSearch = async (query: string) => {
    try {
      const response = await api.get(query ? `/books?q=${encodeURIComponent(query)}` : "/books");
      console.log("Search results:", response.data); // Log để kiểm tra
      setRows(response.data);
    } catch (err: any) {
      console.error("Error searching books:", err.response || err);
      setToastConfig({
        open: true,
        message: err.response?.data?.message || err.message || "Failed to search books",
        type: "error",
      });
    }
  };

  const handleCreate = async (book: Book) => {
    try {
      const response = await api.post("/books", book);
      console.log("Book created:", response.data); // Log để kiểm tra
      setRows((prevRows) => [...prevRows, response.data]);
      setToastConfig({
        open: true,
        message: "New book added successfully",
        type: "success",
      });
      setOpenNewBook(false);
    } catch (err: any) {
      console.error("Error creating book:", err.response || err);
      setToastConfig({
        open: true,
        message: err.response?.data?.message || err.message || "Failed to add new book",
        type: "error",
      });
    }
  };

  const handleUpdate = async (book: Book) => {
    try {
      const response = await api.put(`/books/${book.isbn}`, book);
      console.log("Book updated:", response.data); // Log để kiểm tra
      setRows((prevRows) =>
        prevRows.map((row) => (row.isbn === book.isbn ? response.data : row))
      );
      setToastConfig({
        open: true,
        message: "Book updated successfully",
        type: "success",
      });
      setOpenEditBook(false);
    } catch (err: any) {
      console.error("Error updating book:", err.response || err);
      setToastConfig({
        open: true,
        message: err.response?.data?.message || err.message || "Failed to update book",
        type: "error",
      });
    }
  };

  const handleDelete = async (isbn: string) => {
    try {
      await api.delete(`/books/${isbn}`);
      console.log("Book deleted:", isbn); // Log để kiểm tra
      setRows((prevRows) => prevRows.filter((row) => row.isbn !== isbn));
      setToastConfig({
        open: true,
        message: "Book deleted successfully",
        type: "success",
      });
    } catch (err: any) {
      console.error("Error deleting book:", err.response || err);
      setToastConfig({
        open: true,
        message: err.response?.data?.message || err.message || "Failed to delete book",
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
    <>
      <Box position="fixed" top={12} right={5}>
        <Link to="/">
          <IconButton>
            <CancelIcon sx={{ color: "white" }} />
          </IconButton>
        </Link>
      </Box>

      <Box
        bgcolor={colorConfigs.mainBg}
        minHeight="100vh"
        display="flex"
        flexDirection="column"
        sx={{
          paddingBottom: "60px",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box py={4} display="flex" justifyContent="center" alignItems="center">
          <Grid container justifyContent="center" alignItems="center">
            <Grid item display="flex" alignItems="center">
              <AutoStoriesOutlinedIcon sx={{ color: "white", fontSize: "3rem", mr: 2 }} />
              <Typography variant="h3" color="white" fontWeight="bold">
                Manage Books
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Search and Add Book */}
        <Box px={2} pb={2}>
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            <Grid item xs={12} sm={8} md={9}>
              <TextField
                fullWidth
                variant="standard"
                label="Search books"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon sx={{ color: "white" }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ sx: { color: "white" } }}
                sx={{
                  maxWidth: "600px",
                  "& .MuiInputBase-root": { color: "white" },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={3} sx={{ textAlign: { xs: "left", sm: "right" } }}>
              <Button
                variant="contained"
                sx={{ height: "35px", fontWeight: "bold", width: { xs: "100%", sm: "auto" } }}
                onClick={() => {
                  setSelectedBook({ isbn: "", title: "", author: "", copies: 0 });
                  setOpenNewBook(true);
                }}
              >
                Add Book
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Book Table */}
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
              getRowId={(row) => row.isbn}
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
                  backgroundColor: "#f5f5f5",
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
              }}
            />
          </Box>
        </Box>
      </Box>

      <Footer />

      {/* Book Form Drawers */}
      <Drawer anchor="right" open={openNewBook} onClose={() => setOpenNewBook(false)}>
        <Box width={{ xs: "100vw", sm: 400 }} height="100vh" bgcolor={colorConfigs.mainBg}>
          <CreateEditViewBook
            book={selectedBook}
            mode={BookMode.CREATE}
            action={{ setIsDrawerOpen: setOpenNewBook, onConfirm: handleCreate }}
          />
        </Box>
      </Drawer>

      <Drawer anchor="right" open={openViewBook} onClose={() => setOpenViewBook(false)}>
        <Box width={{ xs: "100vw", sm: 400 }} height="100vh" bgcolor={colorConfigs.mainBg}>
          <CreateEditViewBook
            book={selectedBook}
            mode={BookMode.VIEW}
            action={{ setIsDrawerOpen: setOpenViewBook, onConfirm: () => {} }}
          />
        </Box>
      </Drawer>

      <Drawer anchor="right" open={openEditBook} onClose={() => setOpenEditBook(false)}>
        <Box width={{ xs: "100vw", sm: 400 }} height="100vh" bgcolor={colorConfigs.mainBg}>
          <CreateEditViewBook
            book={selectedBook}
            mode={BookMode.EDIT}
            action={{ setIsDrawerOpen: setOpenEditBook, onConfirm: handleUpdate }}
          />
        </Box>
      </Drawer>

      <Toast data={toastConfig} action={{ onClose: handleToastClose }} />
    </>
  );
};

export default ManageBooks;