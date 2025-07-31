import React, { type ChangeEvent, type SetStateAction, useEffect, useState } from "react";
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
    setIsDrawerOpen: React.Dispatch<SetStateAction<boolean>>;
    onConfirm: (book: Book) => void;
};

type Props = {
    mode: BookMode;
    book: Book;
    action: BookAction;
};

type ErrorMsgType = {
    isbnError: string;
    titleError: string;
    authorError: string;
    copiesError: string;
};

const CreateEditViewBook: React.FC<Props> = ({ mode, book, action }) => {
    const [newBook, setNewBook] = useState<Book>({
        isbn: "", title: "", author: "", copies: 0
    });
    const [error, setError] = useState<ErrorMsgType>({
        isbnError: " ", titleError: " ", authorError: " ", copiesError: " "
    });

    useEffect(() => {
        if (mode === BookMode.CREATE) {
            setTimeout(() => {
                // @ts-ignore
                document.getElementById("book-isbn")?.focus();
            }, 500);
        } else if (mode === BookMode.EDIT) {
            setTimeout(() => {
                // @ts-ignore
                document.getElementById("book-title")?.focus();
            }, 500);
        }
    }, []);

    useEffect(() => {
        setNewBook({ ...book });
    }, [book]);

    const handleClear = () => {
        setNewBook((prevState) => ({
            ...prevState,
            isbn: (mode === BookMode.EDIT) ? prevState.isbn : "",
            title: "",
            author: "",
            copies: 0
        }));
        setError({
            isbnError: " ",
            titleError: " ",
            authorError: " ",
            copiesError: " "
        });
    };

    const handleAction = () => {
        if (error.isbnError !== " ") {
            // @ts-ignore
            document.getElementById("book-isbn")?.focus();
            return;
        }
        if (error.titleError !== " ") {
            // @ts-ignore
            document.getElementById("book-title")?.focus();
            return;
        }
        if (error.authorError !== " ") {
            // @ts-ignore
            document.getElementById("book-author")?.focus();
            return;
        }
        if (error.copiesError !== " ") {
            // @ts-ignore
            document.getElementById("book-copies")?.focus();
            return;
        }
        if (!newBook.isbn || !newBook.title || !newBook.author || newBook.copies === 0) {
            if (newBook.copies === 0) {
                // @ts-ignore
                document.getElementById("book-copies")?.focus();
                setError((prevState) => ({
                    ...prevState,
                    copiesError: "Book copies are required"
                }));
            }
            if (!newBook.author) {
                // @ts-ignore
                document.getElementById("book-author")?.focus();
                setError((prevState) => ({
                    ...prevState,
                    authorError: "Book author is required"
                }));
            }
            if (!newBook.title) {
                // @ts-ignore
                document.getElementById("book-title")?.focus();
                setError((prevState) => ({
                    ...prevState,
                    titleError: "Book title is required"
                }));
            }
            if (!newBook.isbn) {
                // @ts-ignore
                document.getElementById("book-isbn")?.focus();
                setError((prevState) => ({
                    ...prevState,
                    isbnError: "Book isbn is required"
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
            <Box
                position="absolute"
                top={12}
                right={5}
            >
                <IconButton onClick={() => action.setIsDrawerOpen(false)}>
                    <CancelIcon sx={{ color: "white" }} />
                </IconButton>
            </Box>
            <Grid
                container
                rowSpacing={3}
                pt={2}
                pl={2}
                pr={2}
            >
                <Grid item xs={12} pb={2}>
                    <Typography variant="h5" sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                        {mode} Book
                    </Typography>
                </Grid>
                <Grid item xs={12} container alignItems="flex-start" spacing={2}>
                    <Grid item xs={3}>
                        <Typography sx={{ color: "white", fontWeight: "bold", textAlign: "right", minWidth: "120px", paddingTop: "8px" }}>Book ISBN *</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            required
                            InputProps={{
                                readOnly: (mode === BookMode.VIEW),
                                sx: {
                                    color: "white",
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    "& .MuiInputBase-input": { color: "white", paddingTop: "8px" },
                                    "& .MuiInput-underline:before": { borderBottomColor: "white" },
                                    "& .MuiInput-underline:after": { borderBottomColor: "white" },
                                },
                            }}
                            id="book-isbn"
                            className="lms-input-field"
                            name="book-isbn"
                            fullWidth
                            variant="standard"
                            value={newBook.isbn}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                const { value } = event.target;
                                if (value.trim() === "") {
                                    setError((prevState: ErrorMsgType) => ({
                                        ...prevState,
                                        isbnError: "Book isbn is required"
                                    }));
                                } else if (!/^\d{3}-\d-\d{2}-\d{6}-\d$/.test(value)) {
                                    setError((prevState: ErrorMsgType) => ({
                                        ...prevState,
                                        isbnError: "Enter valid book isbn number"
                                    }));
                                } else {
                                    setError((prevState) => ({
                                        ...prevState,
                                        isbnError: " "
                                    }));
                                }
                                setNewBook((prevState: Book) => ({
                                    ...prevState,
                                    isbn: value
                                }));
                            }}
                            InputLabelProps={{
                                sx: { color: "white" },
                            }}
                            error={error.isbnError !== " "}
                            helperText={error.isbnError !== " " ? error.isbnError : ""}
                            FormHelperTextProps={{
                                sx: { color: "red", marginLeft: 0, marginTop: 0, paddingTop: "4px" },
                            }}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        {mode === BookMode.VIEW && <Typography sx={{ color: "yellow", textAlign: "left", paddingTop: "8px" }}>Read Only</Typography>}
                    </Grid>
                </Grid>
                <Grid item xs={12} container alignItems="flex-start" spacing={2}>
                    <Grid item xs={3}>
                        <Typography sx={{ color: "white", fontWeight: "bold", textAlign: "right", minWidth: "120px", paddingTop: "8px" }}>Book Title *</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            required
                            InputProps={{
                                readOnly: (mode === BookMode.VIEW),
                                sx: {
                                    color: "white",
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    "& .MuiInputBase-input": { color: "white", paddingTop: "8px" },
                                    "& .MuiInput-underline:before": { borderBottomColor: "white" },
                                    "& .MuiInput-underline:after": { borderBottomColor: "white" },
                                },
                            }}
                            id="book-title"
                            className="lms-input-field"
                            name="book-title"
                            fullWidth
                            variant="standard"
                            value={newBook.title}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                const { value } = event.target;
                                if (value.trim() === "") {
                                    setError((prevState: ErrorMsgType) => ({
                                        ...prevState,
                                        titleError: "Book title is required"
                                    }));
                                } else if (!/^[A-Za-z][A-Za-z. ]+$/.test(value)) {
                                    setError((prevState: ErrorMsgType) => ({
                                        ...prevState,
                                        titleError: "Enter valid book title"
                                    }));
                                } else {
                                    setError((prevState) => ({
                                        ...prevState,
                                        titleError: " "
                                    }));
                                }
                                setNewBook((prevState: Book) => ({
                                    ...prevState,
                                    title: value
                                }));
                            }}
                            InputLabelProps={{
                                sx: { color: "white" },
                            }}
                            error={error.titleError !== " "}
                            helperText={error.titleError !== " " ? error.titleError : ""}
                            FormHelperTextProps={{
                                sx: { color: "red", marginLeft: 0, marginTop: 0, paddingTop: "4px" },
                            }}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        {mode === BookMode.VIEW && <Typography sx={{ color: "yellow", textAlign: "left", paddingTop: "8px" }}>Read Only</Typography>}
                    </Grid>
                </Grid>
                <Grid item xs={12} container alignItems="flex-start" spacing={2}>
                    <Grid item xs={3}>
                        <Typography sx={{ color: "white", fontWeight: "bold", textAlign: "right", minWidth: "120px", paddingTop: "8px" }}>Book Author *</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            required
                            InputProps={{
                                readOnly: (mode === BookMode.VIEW),
                                sx: {
                                    color: "white",
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    "& .MuiInputBase-input": { color: "white", paddingTop: "8px" },
                                    "& .MuiInput-underline:before": { borderBottomColor: "white" },
                                    "& .MuiInput-underline:after": { borderBottomColor: "white" },
                                },
                            }}
                            id="book-author"
                            className="lms-input-field"
                            name="book-author"
                            fullWidth
                            variant="standard"
                            value={newBook.author}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                const { value } = event.target;
                                if (value.trim() === "") {
                                    setError((prevState: ErrorMsgType) => ({
                                        ...prevState,
                                        authorError: "Book author is required"
                                    }));
                                } else if (!/^[A-Za-z][A-Za-z. ]+$/.test(value)) {
                                    setError((prevState: ErrorMsgType) => ({
                                        ...prevState,
                                        authorError: "Enter valid book author"
                                    }));
                                } else {
                                    setError((prevState) => ({
                                        ...prevState,
                                        authorError: " "
                                    }));
                                }
                                setNewBook((prevState: Book) => ({
                                    ...prevState,
                                    author: value
                                }));
                            }}
                            InputLabelProps={{
                                sx: { color: "white" },
                            }}
                            error={error.authorError !== " "}
                            helperText={error.authorError !== " " ? error.authorError : ""}
                            FormHelperTextProps={{
                                sx: { color: "red", marginLeft: 0, marginTop: 0, paddingTop: "4px" },
                            }}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        {mode === BookMode.VIEW && <Typography sx={{ color: "yellow", textAlign: "left", paddingTop: "8px" }}>Read Only</Typography>}
                    </Grid>
                </Grid>
                <Grid item xs={12} container alignItems="flex-start" spacing={2}>
                    <Grid item xs={3}>
                        <Typography sx={{ color: "white", fontWeight: "bold", textAlign: "right", minWidth: "120px", paddingTop: "8px" }}>Book Copies *</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            required
                            InputProps={{
                                readOnly: (mode === BookMode.VIEW),
                                sx: {
                                    color: "white",
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    "& .MuiInputBase-input": { color: "white", paddingTop: "8px" },
                                    "& .MuiInput-underline:before": { borderBottomColor: "white" },
                                    "& .MuiInput-underline:after": { borderBottomColor: "white" },
                                },
                            }}
                            id="book-copies"
                            className="lms-input-field"
                            name="book-copies"
                            fullWidth
                            variant="standard"
                            type="number"
                            value={newBook.copies === 0 ? "" : newBook.copies}
                            inputProps={{ min: "0", max: "50" }}
                            onKeyDown={(event) => {
                                if (event.key === "e" || event.key === "-" || event.key === "." || event.key === "+" || event.key === "E") {
                                    event.preventDefault();
                                }
                            }}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                const { value } = event.target;
                                if (value === "") {
                                    setNewBook((prevState: Book) => ({
                                        ...prevState,
                                        copies: 0
                                    }));
                                    setError((prevState) => ({
                                        ...prevState,
                                        copiesError: "Book copies are required"
                                    }));
                                } else if (!isNaN(Number(value)) && Number(value) <= 50) {
                                    setNewBook((prevState: Book) => ({
                                        ...prevState,
                                        copies: Number(value)
                                    }));
                                    setError((prevState) => ({
                                        ...prevState,
                                        copiesError: " "
                                    }));
                                }
                            }}
                            InputLabelProps={{
                                sx: { color: "white" },
                            }}
                            error={error.copiesError !== " "}
                            helperText={error.copiesError !== " " ? error.copiesError : ""}
                            FormHelperTextProps={{
                                sx: { color: "red", marginLeft: 0, marginTop: 0, paddingTop: "4px" },
                            }}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        {mode === BookMode.VIEW && <Typography sx={{ color: "yellow", textAlign: "left", paddingTop: "8px" }}>Read Only</Typography>}
                    </Grid>
                </Grid>
            </Grid>
            {(mode === BookMode.CREATE || mode === BookMode.EDIT) && (
                <Box
                    display="flex"
                    justifyContent="flex-end"
                    gap={2}
                    pb={2}
                    pt={4}
                    pr={4}
                >
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