import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import HubNotificaMeDialog from "../../components/HubNotificaMeDialog";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Grid } from "@material-ui/core";
import { isArray } from "lodash";
import { AuthContext } from "../../context/Auth/AuthContext";

/* ícones da Meta */
import FacebookIcon from "@material-ui/icons/Facebook";
import InstagramIcon from "@material-ui/icons/Instagram";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";


const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const HubNotificaMe = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [HubNotificaMe, setHubNotificaMe] = useState([]);
  const [selectedHubNotificaMe, setSelectedHubNotificaMe] = useState(null);
  const [HubNotificaMeModalOpen, setHubNotificaMeDialogOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingHubNotificaMe, setDeletingHubNotificaMe] = useState(null);
  const { user } = useContext(AuthContext);
  const { profile } = user;

  useEffect(() => {
    fetchHubNotificaMe();
  }, [searchParam]);

  const fetchHubNotificaMe = async () => {
    try {
      const companyId = localStorage.getItem("companyId");
      const { data } = await api.get("/hub-notificame/list", {
        params: { companyId, userId: user.id },
      });
      setHubNotificaMe(data);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenHubNotificaMeDialog = () => {
    setSelectedHubNotificaMe(null);
    setHubNotificaMeDialogOpen(true);
  };

  const handleCloseHubNotificaMeDialog = () => {
    setSelectedHubNotificaMe(null);
    setHubNotificaMeDialogOpen(false);
    fetchHubNotificaMe();
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditHubNotificaMe = (HubNotificaMe) => {
    setSelectedHubNotificaMe(HubNotificaMe);
    setHubNotificaMeDialogOpen(true);
  };

  const handleDeleteHubNotificaMe = async (HubNotificaMeId) => {
    try {
      await api.delete(`/hub-notificame/${HubNotificaMeId}`);
      toast.success("Token deletado com sucesso!");
      fetchHubNotificaMe();
    } catch (err) {
      toastError(err);
    }
    setDeletingHubNotificaMe(null);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={deletingHubNotificaMe && `${i18n.t("hubNotificaMe.confirmationModal.deleteTitle")} ${deletingHubNotificaMe.token}?`}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteHubNotificaMe(deletingHubNotificaMe.id)}
      >
        {i18n.t("hubNotificaMe.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <HubNotificaMeDialog
        open={HubNotificaMeModalOpen}
        onClose={handleCloseHubNotificaMeDialog}
        HubNotificaMeId={selectedHubNotificaMe?.id}
      />
      <MainHeader>
        <Grid container>
          <Grid xs={8} item>
            <Title>Conexões Meta</Title>
          </Grid>
          <Grid xs={4} item>
            <Button variant="contained" onClick={handleOpenHubNotificaMeDialog} color="primary">
              Adicionar
            </Button>
          </Grid>
        </Grid>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">Nome do Canal</TableCell>
              <TableCell align="center">Token do Canal - NotificaMe</TableCell>
              <TableCell align="center">Canal</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {HubNotificaMe.map((HubNotificaMe) => (
              <TableRow key={HubNotificaMe.id}>
                <TableCell align="center">{HubNotificaMe.nome}</TableCell>
                <TableCell align="center">{HubNotificaMe.token}</TableCell>
                <TableCell align="center">
                  {HubNotificaMe.tipo === "Facebook" ? <FacebookIcon /> : 
                   HubNotificaMe.tipo === "Instagram" ? <InstagramIcon /> : 
                   HubNotificaMe.tipo}
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleDeleteHubNotificaMe(HubNotificaMe.id)}>
                    <DeleteOutlineIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {loading && <TableRowSkeleton columns={3} />}
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default HubNotificaMe;