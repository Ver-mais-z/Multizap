import React, { useContext, useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import { i18n } from "../../translate/i18n";
import { head } from "lodash";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import MessageVariablesPicker from "../MessageVariablesPicker";
import ButtonWithSpinner from "../ButtonWithSpinner";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexWrap: "wrap",
    },
    multFieldLine: {
        display: "flex",
        "& > *:not(:last-child)": {
            marginRight: theme.spacing(1),
        },
    },

    btnWrapper: {
        position: "relative",
    },

    buttonProgress: {
        color: green[500],
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    colorAdorment: {
        width: 20,
        height: 20,
    },
}));

const HubNotificaMeSchema = Yup.object().shape({
    token: Yup.string().required("Obrigatório"),
    tipo: Yup.string().oneOf(["Facebook", "Instagram"], "Tipo inválido").required("Obrigatório"),
});

const HubNotificaMeDialog = ({ open, onClose, hubnotificameId, reload }) => {

    const classes = useStyles();
    const { user } = useContext(AuthContext);
    const { profile } = user;


    const initialState = {
        nome: "",
        token: "",
        tipo: "",
    };

    const [hubnotificame, setHubNotificaMe] = useState(initialState);


    useEffect(() => {
        try {
            (async () => {
                if (!hubnotificameId) return;

                const { data } = await api.get(`/hub-notificame/${hubnotificameId}`);
                setHubNotificaMe({ nome: data.nome, token: data.token, tipo: data.tipo });
            })();
        } catch (err) {
            toastError(err);
        }
    }, [hubnotificameId, open]);

    const handleClose = () => {
        setHubNotificaMe(initialState);
        onClose();
    };

    const handleSaveHubNotificaMe = async (values) => {
        
        try {
            await api.post("/hub-notificame", values);
            toast.success("Registro criado com sucesso!");            
            handleClose();
        } catch (err) {
            toastError(err);
        }

        
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle>Adicionar Token</DialogTitle>
            <Formik
                initialValues={hubnotificame}
                enableReinitialize={true}
                validationSchema={HubNotificaMeSchema}
                onSubmit={handleSaveHubNotificaMe}
            >
                {({ values, touched, errors, isSubmitting }) => {
                    console.log("Valores do formulário em tempo real:", values); // Debug

                    return (
                        <Form>
                            <DialogContent dividers>

                                {/* Campo Nome */}
                                <Field
                                    as={TextField}
                                    label="Nome"
                                    name="nome"
                                    error={touched.token && Boolean(errors.token)}
                                    helperText={touched.token && errors.token}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                />

                                {/* Campo Token */}
                                <Field
                                    as={TextField}
                                    label="Token"
                                    name="token"
                                    error={touched.nome && Boolean(errors.nome)}
                                    helperText={touched.nome && errors.nome}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                />

                                {/* Select para escolher o tipo */}
                                <Field
                                    as={TextField}
                                    select
                                    label="Tipo"
                                    name="tipo"
                                    error={touched.tipo && Boolean(errors.tipo)}
                                    helperText={touched.tipo && errors.tipo}
                                    variant="outlined"
                                    margin="dense"
                                    fullWidth
                                >
                                    <MenuItem value="Facebook">Facebook</MenuItem>
                                    <MenuItem value="Instagram">Instagram</MenuItem>
                                </Field>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={handleClose}
                                    color="secondary"
                                    disabled={isSubmitting}
                                    variant="outlined"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    color="primary"
                                    disabled={isSubmitting}
                                    variant="contained"
                                    className={classes.btnWrapper}
                                >
                                    Adicionar
                                    {isSubmitting && (
                                        <CircularProgress size={24} className={classes.buttonProgress} />
                                    )}
                                </Button>
                            </DialogActions>
                        </Form>
                    );
                }}
            </Formik>
        </Dialog>
    );
};

export default HubNotificaMeDialog;