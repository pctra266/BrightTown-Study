import React, { type ChangeEvent, type SetStateAction, useEffect, useState} from "react";
import {Box, Button, Grid, IconButton, TextField, Typography} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";

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
}

export type BookAction = {
    setIsDrawerOpen: React.Dispatch<SetStateAction<boolean>>
    onConfirm: (book: Book) => void;
}

type Props = {
    mode: BookMode;
    book: Book;
    action: BookAction;
}

type ErrorMsgType = {
    isbnError: string;
    titleError: string;
    authorError: string;
    copiesError: string;
}

const CreateEditViewBook = ({mode, book, action} : Props) => {
    const [newBook, setNewBook] = useState<Book>({
        isbn: "", title: "", author: "", copies: 0
    });
    const [error, setError] = useState<ErrorMsgType>({
        isbnError: " ", titleError: " ", authorError: " ", copiesError: " "
    })

    useEffect(() => {
        if (mode === BookMode.CREATE) {
            setTimeout(() => {
                // @ts-ignore
                document.getElementById("book-isbn").focus();
            }, 500)
        } else if (mode === BookMode.EDIT) {
            setTimeout(() => {
                // @ts-ignore
                document.getElementById("book-title").focus();
            }, 500)
        }
    }, [])

    useEffect(() => {
        setNewBook({...book})
    }, [book])

    const handleClear = () => {
        setNewBook((prevState) => {
            return {...prevState, "isbn": (mode === BookMode.EDIT) ? prevState.isbn : "", "title": "", "author": "", "copies": 0}
        })
        setError((prevState) => {
            return {...prevState, "isbnError": " ", "titleError": " ", "authorError": " ", "copiesError": " "}
        })
    }

    const handleAction = () => {
        if (error.isbnError !== " ") {
            // @ts-ignore
            document.getElementById("book-isbn").focus();
            return;
        }
        if (error.titleError !== " ") {
            // @ts-ignore
            document.getElementById("book-title").focus();
            return;
        }
        if (error.authorError !== " ") {
            // @ts-ignore
            document.getElementById("book-author").focus();
            return;
        }
        if (error.copiesError !== " ") {
            // @ts-ignore
            document.getElementById("book-copies").focus();
            return;
        }
        if (!newBook.isbn || !newBook.title || !newBook.author || newBook.copies === 0) {
            if (newBook.copies === 0) {
                // @ts-ignore
                document.getElementById("book-copies").focus();
                setError((prevState) => {
                    return {...prevState, "copiesError": "Book copies are required"}
                })
            }
            if (!newBook.author) {
                // @ts-ignore
                document.getElementById("book-author").focus();
                setError((prevState) => {
                    return {...prevState, "authorError": "Book author is required"}
                })
            }
            if (!newBook.title) {
                // @ts-ignore
                document.getElementById("book-title").focus();
                setError((prevState) => {
                    return {...prevState, "titleError": "Book title is required"}
                })
            }
            if (!newBook.isbn) {
                // @ts-ignore
                document.getElementById("book-isbn").focus();
                setError((prevState) => {
                    return {...prevState, "isbnError": "Book isbn is required"}
                })
            }
            return;
        }
        action.onConfirm(newBook);
    }

    return (
        <>
            <Box
                position={"relative"}
                height={"100%"}
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"space-between"}
                borderLeft={"2px solid white"}
            >
                <Box
                    position={"absolute"}
                    top={12}
                    right={5}
                >
                    <IconButton
                        onClick={() => {action.setIsDrawerOpen(false)}}
                    >
                        <CancelIcon
                            sx={{color: "white"}}
                        />
                    </IconButton>
                </Box>
                <Grid
                    container
                    rowSpacing={3}
                    pt={2} pl={4} pr={4}
                >
                    <Grid item xs={12} pb={1}>
                        <Typography variant={"h5"} sx={{color: "white", fontWeight: "bold"}}>{mode.valueOf()} Book</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            InputProps={{
                                readOnly: (mode === BookMode.VIEW || mode === BookMode.EDIT),
                            }}
                            id={"book-isbn"}
                            className={"lms-input-field"}
                            name={"book-isbn"}
                            label={"Book ISBN"}
                            fullWidth
                            variant={"standard"}
                            value={newBook.isbn}
                            helperText={(mode === BookMode.VIEW || mode === BookMode.EDIT) ? "Read Only" : error.isbnError}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                const {value} = event.target;
                                if (value.trim() === "") {
                                    setError((prevState: ErrorMsgType) => {
                                        return {...prevState, "isbnError": "Book isbn is required"}
                                    })
                                } else if (!/^\d{3}-\d-\d{2}-\d{6}-\d$/.test(value)) {
                                    setError((prevState: ErrorMsgType) => {
                                        return {...prevState, "isbnError": "Enter valid book isbn number"}
                                    })
                                } else {
                                    setError((prevState) => {
                                        return {...prevState, "isbnError": " "}
                                    })
                                }
                                setNewBook((prevState: Book) => {
                                    return {...prevState, "isbn": value}
                                })
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            InputProps={{
                                readOnly: (mode === BookMode.VIEW),
                            }}
                            id={"book-title"}
                            className={"lms-input-field"}
                            name={"book-title"}
                            label={"Book Title"}
                            fullWidth
                            variant={"standard"}
                            value={newBook.title}
                            helperText={(mode === BookMode.VIEW) ? "Read Only" : error.titleError}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                const {value} = event.target;
                                if (value.trim() === "") {
                                    setError((prevState: ErrorMsgType) => {
                                        return {...prevState, "titleError": "Book title is required"}
                                    })
                                } else if (!/^[A-Za-z][A-Za-z. ]+$/.test(value)) {
                                    setError((prevState: ErrorMsgType) => {
                                        return {...prevState, "titleError": "Enter valid book title"}
                                    })
                                } else {
                                    setError((prevState) => {
                                        return {...prevState, "titleError": " "}
                                    })
                                }
                                setNewBook((prevState: Book) => {
                                    return {...prevState, "title": value}
                                })
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            InputProps={{
                                readOnly: (mode === BookMode.VIEW),
                            }}
                            id={"book-author"}
                            className={"lms-input-field"}
                            name={"book-author"}
                            label={"Book Author"}
                            fullWidth
                            variant={"standard"}
                            value={newBook.author}
                            helperText={(mode === BookMode.VIEW) ? "Read Only" : error.authorError}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                const {value} = event.target;
                                if (value.trim() === "") {
                                    setError((prevState: ErrorMsgType) => {
                                        return {...prevState, "authorError": "Book author is required"}
                                    })
                                } else if (!/^[A-Za-z][A-Za-z. ]+$/.test(value)) {
                                    setError((prevState: ErrorMsgType) => {
                                        return {...prevState, "authorError": "Enter valid book author"}
                                    })
                                } else {
                                    setError((prevState) => {
                                        return {...prevState, "authorError": " "}
                                    })
                                }
                                setNewBook((prevState: Book) => {
                                    return {...prevState, "author": value}
                                })
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            InputProps={{
                                readOnly: (mode === BookMode.VIEW),
                            }}
                            id={"book-copies"}
                            className={"lms-input-field"}
                            name={"book-copies"}
                            label={"Book Copies"}
                            fullWidth
                            variant={"standard"}
                            type={"number"}
                            value={(newBook.copies === 0) ? "" : newBook.copies}
                            inputProps={{min: "0", max: "50"}}
                            helperText={(mode === BookMode.VIEW) ? "Read Only" : error.copiesError}
                            onKeyDown={(event) => {
                                if (event.key === "e" || event.key === "-" || event.key === "." || event.key === "+" || event.key === "E") {
                                    event.preventDefault();
                                }
                            }}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                const {value} = event.target;
                                if (value === "") {
                                    setNewBook((prevState: Book) => {
                                        return {...prevState, "copies": 0}
                                    })
                                    setError((prevState) => {
                                        return {...prevState, "copiesError": "Book copies are required"}
                                    })
                                } else if (!isNaN(Number(value)) && Number(value) <= 50) {
                                    setNewBook((prevState: Book) => {
                                        return {...prevState, "copies": Number(value)}
                                    })
                                    setError((prevState) => {
                                        return {...prevState, "copiesError": " "}
                                    })
                                }
                            }}
                        />
                    </Grid>
                </Grid>
                {
                    (mode === BookMode.CREATE || mode === BookMode.EDIT) &&
                    <Box
                        display={"flex"}
                        justifyContent={"flex-end"}
                        gap={2}
                        pb={2} pt={2} pr={4}
                    >
                        <Button
                            variant={"contained"}
                            color={"inherit"}
                            sx={{
                                fontWeight: "bold"
                            }}
                            onClick={handleClear}
                        >
                            Clear
                        </Button>
                        <Button
                            variant={"contained"}
                            sx={{fontWeight: "bold"}}
                            onClick={handleAction}
                        >
                            {mode.valueOf()} Book
                        </Button>
                    </Box>
                }
            </Box>
        </>
    )
}

export default CreateEditViewBook;