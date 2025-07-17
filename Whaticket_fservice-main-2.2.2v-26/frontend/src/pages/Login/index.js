import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import LinkMaterial from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import ColorModeContext from "../../layout/themeContext";
import useSettings from "../../hooks/useSettings";
import IconButton from "@material-ui/core/IconButton";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import { Helmet } from "react-helmet";
import { nomeEmpresa } from "../../../package.json";
import { versionSystem } from "../../../package.json";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
    copyright: {
        color: theme.mode === "dark" ? "#FFFFFF" : "#000000",
        '& a': {
            color: theme.mode === "dark" ? "#FFFFFF !important" : "#000000 !important",
        }
    },
    root: {
        width: "100vw",
        height: "100vh",
        backgroundColor: theme.palette.primary.main,
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
    },
    paper: {
        background: theme.mode === "dark" ? "#000000" : "#FFFFFF",
        backdropFilter: "blur(10px)",
        boxShadow: theme.mode === "light" 
            ? "0 4px 6px rgba(0, 0, 0, 0.1)" 
            : "0 4px 6px rgba(255, 255, 255, 0.2)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "55px 30px",
        borderRadius: "12.5px",
        color: theme.mode === "dark" ? "#FFFFFF" : "#000000",
        '& .MuiTextField-root': {
            '& .MuiInputLabel-root': {
                color: theme.mode === "dark" ? "#FFFFFF" : "#000000",
            },
            '& .MuiOutlinedInput-root': {
                color: theme.mode === "dark" ? "#FFFFFF" : "#000000",
                '& fieldset': {
                    borderColor: theme.mode === "dark" ? "#FFFFFF" : "#000000",
                },
                '&:hover fieldset': {
                    borderColor: theme.mode === "dark" ? "#FFFFFF" : "#000000",
                },
            },
        },
        '& .MuiLink-root': {
            color: theme.mode === "dark" ? "#FFFFFF" : "#000000",
        },
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
    },
    form: {
        width: "100%",
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    logoImg: {
        width: "100%",
        maxWidth: "350px",
        height: "auto",
        maxHeight: "120px",
        margin: "0 auto",
        content: "url(" + (theme.mode === "light" ? theme.calculatedLogoLight() : theme.calculatedLogoDark()) + ")",
    },
    iconButton: {
        position: "absolute",
        top: 10,
        right: 10,
        color: theme.mode === "light" ? "#000000" : "#FFFFFF",
    },
    forgotPasswordLink: {
        color: theme.mode === "dark" ? "#FFFFFF" : "#000000",
        textDecoration: "none",
        "&:hover": {
            textDecoration: "underline",
        },
    },
}));

const Copyright = () => {
    const classes = useStyles();
    return (
        <Typography variant="body2" className={classes.copyright} align="center">
            {"Copyright "}
            <LinkMaterial href="https://www.firstin.com.br/" target="_blank">
                {nomeEmpresa} - v {versionSystem}
            </LinkMaterial>{" "}
            {new Date().getFullYear()}
            {"."}
        </Typography>
    );
};

const Login = () => {
    const classes = useStyles();
    const { colorMode } = useContext(ColorModeContext);
    const { appLogoFavicon, appName, mode } = colorMode;
    const [user, setUser] = useState({ email: "", password: "" });
    const { handleLogin } = useContext(AuthContext);

    const handleChangeInput = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleLogin(user);
    };

    return (
        <>
            <Helmet>
                <title>{appName || ""}</title>
                <link rel="icon" href={appLogoFavicon || "/default-favicon.ico"} />
            </Helmet>
            <div className={classes.root}>
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <div className={classes.paper}>
                        <IconButton className={classes.iconButton} onClick={colorMode.toggleColorMode}>
                            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                        <div>
                            <img className={classes.logoImg} alt="logo" />
                        </div>
                        <form className={classes.form} noValidate onSubmit={handleSubmit}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label={i18n.t("login.form.email")}
                                name="email"
                                value={user.email}
                                onChange={handleChangeInput}
                                autoComplete="email"
                                autoFocus
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label={i18n.t("login.form.password")}
                                type="password"
                                id="password"
                                value={user.password}
                                onChange={handleChangeInput}
                                autoComplete="current-password"
                            />
                            <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>
                                {i18n.t("login.buttons.submit")}
                            </Button>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <LinkMaterial component={RouterLink} to="/signup" variant="body2">
                                        Cadastre-se agora
                                    </LinkMaterial>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <LinkMaterial 
                                        component={RouterLink} 
                                        to="/forgot-password" 
                                        variant="body2"
                                        className={classes.forgotPasswordLink}
                                    >
                                        Esqueceu sua senha?
                                    </LinkMaterial>
                                </Grid>
                            </Grid>
                        </form>
                    </div>
                    <Box mt={8}>
                        <Copyright />
                    </Box>
                </Container>
            </div>
        </>
    );
};

export default Login;