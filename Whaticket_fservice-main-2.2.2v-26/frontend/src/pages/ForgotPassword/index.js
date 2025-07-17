import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
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
import { Email } from "@material-ui/icons";
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

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Email inválido")
    .required("Obrigatório"),
});

const ForgotPassword = () => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    try {
      await api.post("/forgot-password", values);
      toast.success("Email de redefinição enviado com sucesso! Verifique sua caixa de entrada.");
      actions.setSubmitting(false);
      setLoading(false);
      setTimeout(() => {
        history.push("/login");
      }, 3000);
    } catch (err) {
      toastError(err);
      actions.setSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className={classes.root}>
      <Container component="main" maxWidth="xs">
        <Paper className={classes.paper} elevation={6}>
          <Typography component="h1" variant="h5">
            Esqueceu sua senha?
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" style={{ marginTop: 16 }}>
            Digite seu email para receber as instruções de redefinição de senha
          </Typography>
          <Formik
            initialValues={{ email: "" }}
            validationSchema={ForgotPasswordSchema}
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
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  error={touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
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
                    "Enviar instruções"
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

export default ForgotPassword;