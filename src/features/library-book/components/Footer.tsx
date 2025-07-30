import {Box, Link, Typography} from "@mui/material";
import colorConfigs from "../configs/colorConfigs";

const Footer = () => {
    return (
        <>
            <Box
                sx={{
                    borderTop: "2px solid white",
                    position: "fixed",
                    width: "100%",
                    bottom: 0,
                    backgroundColor: colorConfigs.mainBg,
                    textAlign: "center",
                    color: "white",
                    paddingTop: "5px",
                    paddingBottom: "5px"
                }}
            >
                <Typography
                    variant={"body2"}
                >
                    Library Management System - v1.0.0 | Copyright &copy; 2023&nbsp;
                    <Link
                        sx={{
                            color: "yellow"
                        }}
                        href={"https://www.linkedin.com/in/pubudujanith/"}
                    >
                        PubuduJ.
                    </Link>
                    &nbsp;All rights reserved.
                </Typography>
            </Box>
        </>
    );
}

export default Footer;