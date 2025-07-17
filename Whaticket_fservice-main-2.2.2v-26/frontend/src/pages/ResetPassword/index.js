import React, { useState, useEffect } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Box,
  InputAdornment,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Lock, Visibility, VisibilityOff } from "@material-ui/icons";
import { toast } from "react-toastify";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100vw",
    height: "100vh",
    background: "linear-gradient(to right, #667eea 0%, #764ba2 100%)",
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
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "55px 30px",
    borderRadius: "12.5px",
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    "&.MuiButton-root": {
      margin: theme.spacing(3, 0, 2),
    },
  },
  powered: {
    color: "white",
    marginTop: theme.spacing(2),
  },
}));

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .required("Obrigatório"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Senhas devem ser iguais")
    .required("Obrigatório"),
});

const ResetPassword = () => {
  const classes = useStyles();
  const history = useHistory();
  const { token } = useParams();
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const { data } = await api.get(`/validate-reset-token/${token}`);
        setValidToken(true);
        setUserEmail(data.email);
      } catch (err) {
        toast.error("Token inválido ou expirado!");
        setTimeout(() => {
          history.push("/login");
        }, 3000);
      }
    };

    if (token) {
      validateToken();
    }
  }, [token, history]);

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    try {
      await api.post("/reset-password", {
        token,
        password: values.password,
      });
      toast.success("Senha redefinida com sucesso!");
      actions.setSubmitting(false);
      setLoading(false);
      setTimeout(() => {
        history.push("/login");
      }, 2000);
    } catch (err) {
      toastError(err);
      actions.setSubmitting(false);
      setLoading(false);
    }
  };

  if (!validToken) {
    return (
      <div className={classes.root}>
        <Container component="main" maxWidth="xs">
          <Paper className={classes.paper} elevation={6}>
            <CircularProgress />
            <Typography variant="h6" style={{ marginTop: 16 }}>
              Validando token...
            </Typography>
          </Paper>
        </Container>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <Container component="main" maxWidth="xs">
        <Paper className={classes.paper} elevation={6}>
          <Typography component="h1" variant="h5">
            Redefinir Senha
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" style={{ marginTop: 16 }}>
            Digite sua nova senha para: {userEmail}
          </Typography>
          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validationSchema={ResetPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className={classes.form}>
                <Field
                  as={TextField}
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Nova Senha"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="new-password"
                  error={touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ minWidth: "auto", padding: 8 }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
                <Field
                  as={TextField}
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirmar Nova Senha"
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  autoComplete="new-password"
                  error={touched.confirmPassword && !!errors.confirmPassword}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{ minWidth: "auto", padding: 8 }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  disabled={isSubmitting || loading}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Redefinir Senha"
                  )}
                </Button>
                <Box mt={2}>
                  <Link to="/login" style={{ textDecoration: "none" }}>
                    <Button color="primary">
                      Voltar para o login
                    </Button>
                  </Link>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>
      </Container>
      <Box mt={8} className={classes.powered}>
        <Typography variant="body2">
          Powered by Whaticket
        </Typography>
      </Box>
    </div>
  );
};

export default ResetPassword;