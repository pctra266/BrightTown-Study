import React, {type ChangeEvent, type SetStateAction, useEffect, useState} from "react";
import {Box, Button, Grid, IconButton, TextField, Typography} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";

export enum MemberMode {
    CREATE = "Create",
    EDIT = "Edit",
    VIEW = "View",
}

export type Member = {
    id: string | null;
    name: string;
    address: string;
    contact: string;
}

export type MemberAction = {
    setIsDrawerOpen: React.Dispatch<SetStateAction<boolean>>;
    onConfirm: (member: Member) => void;
}

type Props = {
    mode: MemberMode;
    member: Member;
    action: MemberAction;
}

type ErrorMsgType = {
    nameError: string;
    addressError: string;
    contactError: string;
}

const CreateEditViewMember = ({mode, member, action} : Props) => {
    const [newMember, setNewMember] = useState<Member>({
        id: null, name: "", address: "", contact: ""
    });
    const [error, setError] = useState<ErrorMsgType>({
        nameError: " ", addressError: " ", contactError: " "
    })

    useEffect(() => {
        if (mode === MemberMode.CREATE || mode === MemberMode.EDIT) {
            setTimeout(() => {
                // @ts-ignore
                document.getElementById("member-name").focus();
            }, 500)
        }
    }, [])

    useEffect(() => {
        setNewMember({...member});
    }, [member])

    const handleClear = () => {
        setNewMember((prevState: Member) => {
            return {...prevState, "id": (mode === MemberMode.EDIT) ? prevState.id : null, "name" : "", "address" : "", "contact" : ""}
        })
        setError((prevState) => {
            return {...prevState, "nameError": " ", "addressError": " ", "contactError": " "}
        })
    }

    const handleAction = () => {
        if (error.nameError !== " ") {
            // @ts-ignore
            document.getElementById("member-name").focus();
            return;
        }
        if (error.addressError !== " ") {
            // @ts-ignore
            document.getElementById("member-address").focus();
            return;
        }
        if (error.contactError !== " ") {
            // @ts-ignore
            document.getElementById("member-contact").focus();
            return;
        }
        if (!newMember.name || !newMember.address || !newMember.contact) {
            if (!newMember.contact) {
                // @ts-ignore
                document.getElementById("member-contact").focus();
                setError((prevState) => {
                    return {...prevState, "contactError": "Member contact number is required"}
                })
            }
            if (!newMember.address) {
                // @ts-ignore
                document.getElementById("member-address").focus();
                setError((prevState) => {
                    return {...prevState, "addressError": "Member address is required"}
                })
            }
            if (!newMember.name) {
                // @ts-ignore
                document.getElementById("member-name").focus();
                setError((prevState) => {
                    return {...prevState, "nameError": "Member name is required"}
                })
            }
            return;
        }
        action.onConfirm(newMember);
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
                        <Typography variant={"h5"} sx={{color: "white", fontWeight: "bold"}}>{mode.valueOf()} Member</Typography>
                    </Grid>
                    {
                        (mode === MemberMode.EDIT || mode === MemberMode.VIEW) &&
                        <Grid item xs={12}>
                            <TextField
                                required
                                InputProps={{
                                    readOnly: (mode === MemberMode.VIEW || mode === MemberMode.EDIT),
                                }}
                                id={"member-uuid"}
                                className={"lms-input-field"}
                                name={"member-uuid"}
                                label={"Member UUID"}
                                fullWidth
                                variant={"standard"}
                                value={newMember.id}
                                helperText={"Read Only"}
                            />
                        </Grid>
                    }
                    <Grid item xs={12}>
                        <TextField
                            required
                            InputProps={{
                                readOnly: (mode === MemberMode.VIEW),
                            }}
                            id={"member-name"}
                            className={"lms-input-field"}
                            name={"member-name"}
                            label={"Member Name"}
                            fullWidth
                            variant={"standard"}
                            value={newMember.name}
                            helperText={(mode === MemberMode.VIEW) ? "Read Only" : error.nameError}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                const {value} = event.target;
                                if (value.trim() === "") {
                                    setError((prevState: ErrorMsgType) => {
                                        return {...prevState, "nameError" : "Member name is required"}
                                    });
                                } else if (!/^[A-Za-z][A-Za-z. ]+$/.test(value)) {
                                    setError((prevState: ErrorMsgType) => {
                                        return {...prevState, "nameError" : "Enter valid member name"}
                                    })
                                } else {
                                    setError((prevState: ErrorMsgType) => {
                                        return {...prevState, "nameError": " "}
                                    })
                                }
                                setNewMember((prevState: Member) => {
                                    return {...prevState, "name" : value}
                                })
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            InputProps={{
                                readOnly: (mode === MemberMode.VIEW),
                            }}
                            id={"member-address"}
                            className={"lms-input-field"}
                            name={"member-address"}
                            label={"Member Address"}
                            fullWidth
                            variant={"standard"}
                            value={newMember.address}
                            helperText={(mode === MemberMode.VIEW) ? "Read Only" : error.addressError}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                const {value} = event.target;
                                if (value.trim() === "") {
                                    setError((prevState: ErrorMsgType) => {
                                        return {...prevState, "addressError" : "Member address is required"}
                                    });
                                } else if (!/^[A-Za-z\d][A-Za-z\d-|/# ,.:;\\]+$/.test(value)) {
                                    setError((prevState: ErrorMsgType) => {
                                        return {...prevState, "addressError" : "Enter valid member address"}
                                    })
                                } else {
                                    setError((prevState: ErrorMsgType) => {
                                        return {...prevState, "addressError": " "}
                                    })
                                }
                                setNewMember((prevState: Member) => {
                                    return {...prevState, "address" : value}
                                })
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            InputProps={{
                                readOnly: (mode === MemberMode.VIEW),
                            }}
                            id={"member-contact"}
                            className={"lms-input-field"}
                            name={"member-contact"}
                            label={"Member Contact"}
                            fullWidth
                            variant={"standard"}
                            value={newMember.contact}
                            helperText={(mode === MemberMode.VIEW) ? "Read Only" : error.contactError}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                const {value} = event.target;
                                if (value.trim() === "") {
                                    setError((prevState: ErrorMsgType) => {
                                        return {...prevState, "contactError" : "Member contact number is required"}
                                    });
                                } else if (!/^\d{3}-\d{7}$/.test(value)) {
                                    setError((prevState: ErrorMsgType) => {
                                        return {...prevState, "contactError" : "Enter valid member contact number"}
                                    })
                                } else {
                                    setError((prevState: ErrorMsgType) => {
                                        return {...prevState, "contactError": " "}
                                    })
                                }
                                setNewMember((prevState: Member) => {
                                    return {...prevState, "contact" : value}
                                })
                            }}
                        />
                    </Grid>
                </Grid>
                {
                    (mode === MemberMode.CREATE || mode === MemberMode.EDIT) &&
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
                            {mode.valueOf()} Member
                        </Button>
                    </Box>
                }
            </Box>
        </>
    );
}

export default CreateEditViewMember;