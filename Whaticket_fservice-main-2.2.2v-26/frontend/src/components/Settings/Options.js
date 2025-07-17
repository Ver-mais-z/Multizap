import React, { useEffect, useState, useContext } from "react";

import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import FormHelperText from "@material-ui/core/FormHelperText";

import useSettings from "../../hooks/useSettings";
import { ToastContainer, toast } from 'react-toastify';
import { makeStyles } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";

import { Tab, Tabs, TextField } from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import useCompanySettings from "../../hooks/useSettings/companySettings";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  mainContainer: {
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    padding: theme.spacing(3),
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    border: "1px solid #e9ecef",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: "2px solid #f1f3f4",
  },
  sectionIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing(2),
    fontSize: "24px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#2c3e50",
    margin: 0,
  },
  sectionSubtitle: {
    fontSize: "14px",
    color: "#6c757d",
    margin: "4px 0 0 0",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      backgroundColor: "#ffffff",
    },
    "& .MuiInputLabel-outlined": {
      fontWeight: "500",
    },
  },
  modernSelect: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#007bff",
      },
    },
  },
  tab: {
    backgroundColor: "transparent",
    borderRadius: 8,
    width: "100%",
    "& .MuiTabs-flexContainer": {
      justifyContent: "center"
    },
    "& .MuiTab-root": {
      textTransform: "none",
      fontWeight: "600",
      fontSize: "16px",
      color: "#495057",
    },
    "& .Mui-selected": {
      color: "#007bff !important",
    },
    "& .MuiTabs-indicator": {
      backgroundColor: "#007bff",
      height: "3px",
      borderRadius: "3px",
    },
  },
  configGrid: {
    "& .MuiGrid-item": {
      paddingBottom: theme.spacing(2),
    },
  },
  premiumFeature: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#ffffff",
    "& .MuiInputLabel-root": {
      color: "#ffffff !important",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "rgba(255,255,255,0.3)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(255,255,255,0.5)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#ffffff",
      },
    },
    "& .MuiSelect-icon": {
      color: "#ffffff",
    },
  },
  infoBox: {
    padding: theme.spacing(2),
    backgroundColor: "#e8f4fd",
    border: "1px solid #bee5eb",
    borderRadius: "8px",
    marginTop: theme.spacing(2),
  },
  warningBox: {
    padding: theme.spacing(2),
    backgroundColor: "#fff3cd",
    border: "1px solid #ffeaa7",
    borderRadius: "8px",
    marginTop: theme.spacing(2),
  },
}));

export default function Options(props) {
  const { oldSettings, settings, scheduleTypeChanged, user } = props;

  const classes = useStyles();
  const [userRating, setUserRating] = useState("disabled");
  const [scheduleType, setScheduleType] = useState("disabled");
  const [chatBotType, setChatBotType] = useState("text");

  const [loadingUserRating, setLoadingUserRating] = useState(false);
  const [loadingScheduleType, setLoadingScheduleType] = useState(false);

  const [userCreation, setUserCreation] = useState("disabled");
  const [loadingUserCreation, setLoadingUserCreation] = useState(false);

  const [SendGreetingAccepted, setSendGreetingAccepted] = useState("enabled");
  const [loadingSendGreetingAccepted, setLoadingSendGreetingAccepted] = useState(false);

  const [UserRandom, setUserRandom] = useState("enabled");
  const [loadingUserRandom, setLoadingUserRandom] = useState(false);

  const [SettingsTransfTicket, setSettingsTransfTicket] = useState("enabled");
  const [loadingSettingsTransfTicket, setLoadingSettingsTransfTicket] = useState(false);

  const [AcceptCallWhatsapp, setAcceptCallWhatsapp] = useState("enabled");
  const [loadingAcceptCallWhatsapp, setLoadingAcceptCallWhatsapp] = useState(false);

  const [sendSignMessage, setSendSignMessage] = useState("enabled");
  const [loadingSendSignMessage, setLoadingSendSignMessage] = useState(false);

  const [sendGreetingMessageOneQueues, setSendGreetingMessageOneQueues] = useState("enabled");
  const [loadingSendGreetingMessageOneQueues, setLoadingSendGreetingMessageOneQueues] = useState(false);

  const [sendQueuePosition, setSendQueuePosition] = useState("enabled");
  const [loadingSendQueuePosition, setLoadingSendQueuePosition] = useState(false);

  const [sendFarewellWaitingTicket, setSendFarewellWaitingTicket] = useState("enabled");
  const [loadingSendFarewellWaitingTicket, setLoadingSendFarewellWaitingTicket] = useState(false);

  const [acceptAudioMessageContact, setAcceptAudioMessageContact] = useState("enabled");
  const [loadingAcceptAudioMessageContact, setLoadingAcceptAudioMessageContact] = useState(false);

  //PAYMENT METHODS - MERCADO PAGO
  const [mpaccesstokenType, setmpaccesstokenType] = useState('');
  const [loadingmpaccesstokenType, setLoadingmpaccesstokenType] = useState(false);

  //OPENAI API KEY TRANSCRIÇÃO DE ÁUDIO
  const [openaitokenType, setopenaitokenType] = useState('');
  const [loadingopenaitokenType, setLoadingopenaitokenType] = useState(false);

  //LGPD
  const [enableLGPD, setEnableLGPD] = useState("disabled");
  const [loadingEnableLGPD, setLoadingEnableLGPD] = useState(false);

  const [lgpdMessage, setLGPDMessage] = useState("");
  const [loadinglgpdMessage, setLoadingLGPDMessage] = useState(false);

  const [lgpdLink, setLGPDLink] = useState("");
  const [loadingLGPDLink, setLoadingLGPDLink] = useState(false);

  const [lgpdDeleteMessage, setLGPDDeleteMessage] = useState("disabled");
  const [loadingLGPDDeleteMessage, setLoadingLGPDDeleteMessage] = useState(false);

  //LIMITAR DOWNLOAD
  const [downloadLimit, setdownloadLimit] = useState("64");
  const [loadingDownloadLimit, setLoadingdownloadLimit] = useState(false);

  const [lgpdConsent, setLGPDConsent] = useState("disabled");
  const [loadingLGPDConsent, setLoadingLGPDConsent] = useState(false);

  const [lgpdHideNumber, setLGPDHideNumber] = useState("disabled");
  const [loadingLGPDHideNumber, setLoadingLGPDHideNumber] = useState(false);

  // Tag obrigatoria
  const [requiredTag, setRequiredTag] = useState("enabled")
  const [loadingRequiredTag, setLoadingRequiredTag] = useState(false)

  // Fechar ticket ao transferir para outro setor
  const [closeTicketOnTransfer, setCloseTicketOnTransfer] = useState(false)
  const [loadingCloseTicketOnTransfer, setLoadingCloseTicketOnTransfer] = useState(false)

  // Usar carteira de clientes
  const [directTicketsToWallets, setDirectTicketsToWallets] = useState(false)
  const [loadingDirectTicketsToWallets, setLoadingDirectTicketsToWallets] = useState(false)

  //MENSAGENS CUSTOMIZADAS
  const [transferMessage, setTransferMessage] = useState("");
  const [loadingTransferMessage, setLoadingTransferMessage] = useState(false);

  const [greetingAcceptedMessage, setGreetingAcceptedMessage] = useState("");
  const [loadingGreetingAcceptedMessage, setLoadingGreetingAcceptedMessage] = useState(false);
  
  const [AcceptCallWhatsappMessage, setAcceptCallWhatsappMessage] = useState("");
  const [loadingAcceptCallWhatsappMessage, setLoadingAcceptCallWhatsappMessage] = useState(false);

  const [sendQueuePositionMessage, setSendQueuePositionMessage] = useState("");
  const [loadingSendQueuePositionMessage, setLoadingSendQueuePositionMessage] = useState(false);

  const [showNotificationPending, setShowNotificationPending] = useState(false);
  const [loadingShowNotificationPending, setLoadingShowNotificationPending] = useState(false);

  const { update: updateUserCreation, getAll } = useSettings();
  const { update: updatedownloadLimit } = useSettings();
  const { update: updatempaccesstoken } = useSettings();
  const { update: updateopenaitoken } = useSettings();
  const { update } = useCompanySettings();

  const isSuper = () => {
    return user.super;
  };


  useEffect(() => {

    if (Array.isArray(oldSettings) && oldSettings.length) {

      const userPar = oldSettings.find((s) => s.key === "userCreation");

      if (userPar) {
        setUserCreation(userPar.value);
      }

      const downloadLimit = oldSettings.find((s) => s.key === "downloadLimit");

      if (downloadLimit) {
       setdownloadLimit(downloadLimit.value);
      }



      const mpaccesstokenType = oldSettings.find((s) => s.key === 'mpaccesstoken');
      if (mpaccesstokenType) {
        setmpaccesstokenType(mpaccesstokenType.value);
      }



      const openaitokenType = oldSettings.find(
        (s) => s.key === 'openaikeyaudio'
      );
      if (openaitokenType) {
        setopenaitokenType(openaitokenType.value);
      }
    }
  }, [oldSettings])


  useEffect(() => {
    for (const [key, value] of Object.entries(settings)) {
      if (key === "userRating") setUserRating(value);
      if (key === "scheduleType") setScheduleType(value);
      if (key === "chatBotType") setChatBotType(value);
      if (key === "acceptCallWhatsapp") setAcceptCallWhatsapp(value);
      if (key === "userRandom") setUserRandom(value);
      if (key === "sendGreetingMessageOneQueues") setSendGreetingMessageOneQueues(value);
      if (key === "sendSignMessage") setSendSignMessage(value);
      if (key === "sendFarewellWaitingTicket") setSendFarewellWaitingTicket(value);
      if (key === "sendGreetingAccepted") setSendGreetingAccepted(value);
      if (key === "sendQueuePosition") setSendQueuePosition(value);
      if (key === "acceptAudioMessageContact") setAcceptAudioMessageContact(value);
      if (key === "enableLGPD") setEnableLGPD(value);
      if (key === "requiredTag") setRequiredTag(value);
      if (key === "lgpdDeleteMessage") setLGPDDeleteMessage(value)
      if (key === "lgpdHideNumber") setLGPDHideNumber(value);
      if (key === "lgpdConsent") setLGPDConsent(value);
      if (key === "lgpdMessage") setLGPDMessage(value);
      if (key === "sendMsgTransfTicket") setSettingsTransfTicket(value);
      if (key === "lgpdLink") setLGPDLink(value);
      if (key === "DirectTicketsToWallets") setDirectTicketsToWallets(value);
      if (key === "closeTicketOnTransfer") setCloseTicketOnTransfer(value);
      if (key === "transferMessage") setTransferMessage(value);
      if (key === "greetingAcceptedMessage") setGreetingAcceptedMessage(value);
      if (key === "AcceptCallWhatsappMessage") setAcceptCallWhatsappMessage(value);
      if (key === "sendQueuePositionMessage") setSendQueuePositionMessage(value);
      if (key === "showNotificationPending") setShowNotificationPending(value);

    }
  }, [settings]);

  async function handleChangeUserCreation(value) {
    setUserCreation(value);
    setLoadingUserCreation(true);
    await updateUserCreation({
      key: "userCreation",
      value,
    });
    setLoadingUserCreation(false);
  }

  async function handleDownloadLimit(value) {
    setdownloadLimit(value);
    setLoadingdownloadLimit(true);
    await updatedownloadLimit({
      key: "downloadLimit",
      value,
    });
    setLoadingdownloadLimit(false);
  }



  async function handleChangempaccesstoken(value) {
    setmpaccesstokenType(value);
    setLoadingmpaccesstokenType(true);
    await updatempaccesstoken({
      key: 'mpaccesstoken',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingmpaccesstokenType(false);
  }



  async function handleChangeopenaitoken(value) {
    setopenaitokenType(value);
    setLoadingopenaitokenType(true);
    await updateopenaitoken({
      key: 'openaikeyaudio',
      value,
    });
    toast.success('Operação atualizada com sucesso.');
    setLoadingopenaitokenType(false);
  }

  async function handleChangeUserRating(value) {
    setUserRating(value);
    setLoadingUserRating(true);
    await update({
      column: "userRating",
      data: value
    });
    setLoadingUserRating(false);
  }

  async function handleScheduleType(value) {
    setScheduleType(value);
    setLoadingScheduleType(true);
    await update({
      column: "scheduleType",
      data: value
    });
    setLoadingScheduleType(false);
    if (typeof scheduleTypeChanged === "function") {
      scheduleTypeChanged(value);
    }
  }

  async function handleChatBotType(value) {
    setChatBotType(value);
    await update({
      column: "chatBotType",
      data: value
    });
    if (typeof scheduleTypeChanged === "function") {
      setChatBotType(value);
    }
  }

  async function handleLGPDMessage(value) {
    setLGPDMessage(value);
    setLoadingLGPDMessage(true);
    await update({
      column: "lgpdMessage",
      data: value
    });
    setLoadingLGPDMessage(false);
  }

  async function handletransferMessage(value) {
    setTransferMessage(value);
    setLoadingTransferMessage(true);
    await update({
      column: "transferMessage",
      data: value
    });
    setLoadingTransferMessage(false);
  }

  async function handleGreetingAcceptedMessage(value) {
    setGreetingAcceptedMessage(value);
    setLoadingGreetingAcceptedMessage(true);
    await update({
      column: "greetingAcceptedMessage",
      data: value
    });
    setLoadingGreetingAcceptedMessage(false);
  }

  async function handleAcceptCallWhatsappMessage(value) {
    setAcceptCallWhatsappMessage(value);
    setLoadingAcceptCallWhatsappMessage(true);
    await update({
      column: "AcceptCallWhatsappMessage",
      data: value
    });
    setLoadingAcceptCallWhatsappMessage(false);
  }

  async function handlesendQueuePositionMessage(value) {
    setSendQueuePositionMessage(value);
    setLoadingSendQueuePositionMessage(true);
    await update({
      column: "sendQueuePositionMessage",
      data: value
    });
    setLoadingSendQueuePositionMessage(false);
  }

  async function handleShowNotificationPending(value) {
    setShowNotificationPending(value);
    setLoadingShowNotificationPending(true);
    await update({
      column: "showNotificationPending",
      data: value
    });
    setLoadingShowNotificationPending(false);
  }

  async function handleLGPDLink(value) {
    setLGPDLink(value);
    setLoadingLGPDLink(true);
    await update({
      column: "lgpdLink",
      data: value
    });
    setLoadingLGPDLink(false);
  }

  async function handleLGPDDeleteMessage(value) {
    setLGPDDeleteMessage(value);
    setLoadingLGPDDeleteMessage(true);
    await update({
      column: "lgpdDeleteMessage",
      data: value
    });
    setLoadingLGPDDeleteMessage(false);
  }

  async function handleLGPDConsent(value) {
    setLGPDConsent(value);
    setLoadingLGPDConsent(true);
    await update({
      column: "lgpdConsent",
      data: value
    });
    setLoadingLGPDConsent(false);
  }

  async function handleLGPDHideNumber(value) {
    setLGPDHideNumber(value);
    setLoadingLGPDHideNumber(true);
    await update({
      column: "lgpdHideNumber",
      data: value
    });
    setLoadingLGPDHideNumber(false);
  }

  async function handleSendGreetingAccepted(value) {
    setSendGreetingAccepted(value);
    setLoadingSendGreetingAccepted(true);
    await update({
      column: "sendGreetingAccepted",
      data: value
    });
    setLoadingSendGreetingAccepted(false);
  }

  async function handleUserRandom(value) {
    setUserRandom(value);
    setLoadingUserRandom(true);
    await update({
      column: "userRandom",
      data: value
    });
    setLoadingUserRandom(false);
  }

  async function handleSettingsTransfTicket(value) {
    setSettingsTransfTicket(value);
    setLoadingSettingsTransfTicket(true);
    await update({
      column: "sendMsgTransfTicket",
      data: value
    });
    setLoadingSettingsTransfTicket(false);
  }

  async function handleAcceptCallWhatsapp(value) {
    setAcceptCallWhatsapp(value);
    setLoadingAcceptCallWhatsapp(true);
    await update({
      column: "acceptCallWhatsapp",
      data: value
    });
    setLoadingAcceptCallWhatsapp(false);
  }

  async function handleSendSignMessage(value) {
    setSendSignMessage(value);
    setLoadingSendSignMessage(true);
    await update({
      column: "sendSignMessage",
      data: value
    });
    localStorage.setItem("sendSignMessage", value === "enabled" ? true : false); //atualiza localstorage para sessão
    setLoadingSendSignMessage(false);
  }

  async function handleSendGreetingMessageOneQueues(value) {
    setSendGreetingMessageOneQueues(value);
    setLoadingSendGreetingMessageOneQueues(true);
    await update({
      column: "sendGreetingMessageOneQueues",
      data: value
    });
    setLoadingSendGreetingMessageOneQueues(false);
  }

  async function handleSendQueuePosition(value) {
    setSendQueuePosition(value);
    setLoadingSendQueuePosition(true);
    await update({
      column: "sendQueuePosition",
      data: value
    });
    setLoadingSendQueuePosition(false);
  }

  async function handleSendFarewellWaitingTicket(value) {
    setSendFarewellWaitingTicket(value);
    setLoadingSendFarewellWaitingTicket(true);
    await update({
      column: "sendFarewellWaitingTicket",
      data: value
    });
    setLoadingSendFarewellWaitingTicket(false);
  }

  async function handleAcceptAudioMessageContact(value) {
    setAcceptAudioMessageContact(value);
    setLoadingAcceptAudioMessageContact(true);
    await update({
      column: "acceptAudioMessageContact",
      data: value
    });
    setLoadingAcceptAudioMessageContact(false);
  }

  async function handleEnableLGPD(value) {
    setEnableLGPD(value);
    setLoadingEnableLGPD(true);
    await update({
      column: "enableLGPD",
      data: value
    });
    setLoadingEnableLGPD(false);
  }

  async function handleRequiredTag(value) {
    setRequiredTag(value);
    setLoadingRequiredTag(true);
    await update({
      column: "requiredTag",
      data: value,
    });
    setLoadingRequiredTag(false);
  }

  async function handleCloseTicketOnTransfer(value) {
    setCloseTicketOnTransfer(value);
    setLoadingCloseTicketOnTransfer(true);
    await update({
      column: "closeTicketOnTransfer",
      data: value,
    });
    setLoadingCloseTicketOnTransfer(false);
  }

  async function handleDirectTicketsToWallets(value) {
    setDirectTicketsToWallets(value);
    setLoadingDirectTicketsToWallets(true);
    await update({
      column: "DirectTicketsToWallets",
      data: value,
    });
    setLoadingDirectTicketsToWallets(false);
  }

  return (
    <div className={classes.mainContainer}>
      {/* SEÇÃO PRINCIPAL DE CONFIGURAÇÕES */}
      <div className={classes.sectionCard}>
        <div className={classes.sectionHeader}>
          <div className={classes.sectionIcon} style={{ background: "linear-gradient(135deg, #007bff, #0056b3)" }}>
            ⚙️
          </div>
          <div>
            <h2 className={classes.sectionTitle}>Configurações Gerais</h2>
            <p className={classes.sectionSubtitle}>Configurações básicas do sistema e funcionalidades principais</p>
          </div>
        </div>

        <Grid spacing={3} container className={classes.configGrid}>
          {/* CRIAÇÃO DE COMPANY/USERS */}
          {isSuper() && (
            <Grid xs={12} sm={6} md={4} item>
              <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
                <InputLabel id="UserCreation-label">
                  {i18n.t("settings.settings.options.creationCompanyUser")}
                </InputLabel>
                <Select
                  labelId="UserCreation-label"
                  value={userCreation}
                  onChange={async (e) => {
                    handleChangeUserCreation(e.target.value);
                  }}
                >
                  <MenuItem value={"disabled"}>
                    {i18n.t("settings.settings.options.disabled")}
                  </MenuItem>
                  <MenuItem value={"enabled"}>
                    {i18n.t("settings.settings.options.enabled")}
                  </MenuItem>
                </Select>
                <FormHelperText>
                  {loadingUserCreation &&
                    i18n.t("settings.settings.options.updating")}
                </FormHelperText>
              </FormControl>
            </Grid>
          )}

          {/* LIMITAR DOWNLOAD */}
          {isSuper() && (
            <Grid xs={12} sm={6} md={4} item>
              <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
                <InputLabel id="downloadLimit-label">
                  Limite de Download (MB)
                </InputLabel>
                <Select
                  labelId="downloadLimit-label"
                  value={downloadLimit}
                  onChange={async (e) => {
                    handleDownloadLimit(e.target.value);
                  }}
                >
                  <MenuItem value={"32"}>32 MB</MenuItem>
                  <MenuItem value={"64"}>64 MB</MenuItem>
                  <MenuItem value={"128"}>128 MB</MenuItem>
                  <MenuItem value={"256"}>256 MB</MenuItem>
                  <MenuItem value={"512"}>512 MB</MenuItem>
                  <MenuItem value={"1024"}>1 GB</MenuItem>
                  <MenuItem value={"2048"}>2 GB</MenuItem>
                </Select>
                <FormHelperText>
                  {loadingDownloadLimit && "Atualizando..."}
                </FormHelperText>
              </FormControl>
            </Grid>
          )}

          {/* AVALIAÇÕES */}
          <Grid xs={12} sm={6} md={4} item>
            <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
              <InputLabel id="ratings-label">{i18n.t("settings.settings.options.evaluations")}</InputLabel>
              <Select
                labelId="ratings-label"
                value={userRating}
                onChange={async (e) => {
                  handleChangeUserRating(e.target.value);
                }}
              >
                <MenuItem value={"disabled"}>
                  {i18n.t("settings.settings.options.disabled")}
                </MenuItem>
                <MenuItem value={"enabled"}>
                  {i18n.t("settings.settings.options.enabled")}
                </MenuItem>
              </Select>
              <FormHelperText>
                {loadingUserRating && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* AGENDAMENTO DE EXPEDIENTE */}
          <Grid xs={12} sm={6} md={4} item>
            <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
              <InputLabel id="schedule-type-label">
                {i18n.t("settings.settings.options.officeScheduling")}
              </InputLabel>
              <Select
                labelId="schedule-type-label"
                value={scheduleType}
                onChange={async (e) => {
                  handleScheduleType(e.target.value);
                }}
              >
                <MenuItem value={"disabled"}>{i18n.t("settings.settings.options.disabled")}</MenuItem>
                <MenuItem value={"queue"}>{i18n.t("settings.settings.options.queueManagement")}</MenuItem>
                <MenuItem value={"company"}>{i18n.t("settings.settings.options.companyManagement")}</MenuItem>
                <MenuItem value={"connection"}>{i18n.t("settings.settings.options.connectionManagement")}</MenuItem>
              </Select>
              <FormHelperText>
                {loadingScheduleType && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* TAG OBRIGATÓRIA */}
          <Grid xs={12} sm={6} md={4} item>
            <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
              <InputLabel id="requiredTag-label">{i18n.t("settings.settings.options.requiredTag")}</InputLabel>
              <Select
                labelId="requiredTag-label"
                value={requiredTag}
                onChange={async (e) => {
                  handleRequiredTag(e.target.value);
                }}
              >
                <MenuItem value={"disabled"}>{i18n.t("settings.settings.options.disabled")}</MenuItem>
                <MenuItem value={"enabled"}>{i18n.t("settings.settings.options.enabled")}</MenuItem>
              </Select>
              <FormHelperText>
                {loadingRequiredTag && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* FECHAR TICKET AO TRANSFERIR */}
          <Grid xs={12} sm={6} md={4} item>
            <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
              <InputLabel id="closeTicketOnTransfer-label">{i18n.t("settings.settings.options.closeTicketOnTransfer")}</InputLabel>
              <Select
                labelId="closeTicketOnTransfer-label"
                value={closeTicketOnTransfer}
                onChange={async (e) => {
                  handleCloseTicketOnTransfer(e.target.value);
                }}
              >
                <MenuItem value={false}>{i18n.t("settings.settings.options.disabled")}</MenuItem>
                <MenuItem value={true}>{i18n.t("settings.settings.options.enabled")}</MenuItem>
              </Select>
              <FormHelperText>
                {loadingCloseTicketOnTransfer && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </div>

      {/* SEÇÃO DE ATENDIMENTO E CHATBOT */}
      <div className={classes.sectionCard}>
        <div className={classes.sectionHeader}>
          <div className={classes.sectionIcon} style={{ background: "linear-gradient(135deg, #28a745, #20c997)" }}>
            💬
          </div>
          <div>
            <h2 className={classes.sectionTitle}>Atendimento & ChatBot</h2>
            <p className={classes.sectionSubtitle}>Configurações de atendimento automático e interação com clientes</p>
          </div>
        </div>

        <Grid spacing={3} container className={classes.configGrid}>

          {/* TIPO DO BOT */}
          <Grid xs={12} sm={6} md={4} item>
            <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
              <InputLabel id="chatBot-type-label">{i18n.t("settings.settings.options.chatBotType")}</InputLabel>
              <Select
                labelId="chatBot-type-label"
                value={chatBotType}
                onChange={async (e) => {
                  handleChatBotType(e.target.value);
                }}
              >
                <MenuItem value={"text"}>📝 Texto</MenuItem>
                <MenuItem value={"list"}>📋 Lista</MenuItem>
                <MenuItem value={"button"}>🔘 {i18n.t("settings.settings.options.buttons")}</MenuItem>
              </Select>
              <FormHelperText>
                {loadingScheduleType && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* SAUDAÇÃO AO ACEITAR */}
          <Grid xs={12} sm={6} md={4} item>
            <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
              <InputLabel id="sendGreetingAccepted-label">
                {i18n.t("settings.settings.options.sendGreetingAccepted")}
              </InputLabel>
              <Select
                labelId="sendGreetingAccepted-label"
                value={SendGreetingAccepted}
                onChange={async (e) => {
                  handleSendGreetingAccepted(e.target.value);
                }}
              >
                <MenuItem value={"disabled"}>
                  {i18n.t("settings.settings.options.disabled")}
                </MenuItem>
                <MenuItem value={"enabled"}>
                  {i18n.t("settings.settings.options.enabled")}
                </MenuItem>
              </Select>
              <FormHelperText>
                {loadingSendGreetingAccepted && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* OPERADOR ALEATÓRIO */}
          <Grid xs={12} sm={6} md={4} item>
            <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
              <InputLabel id="userRandom-label">
                {i18n.t("settings.settings.options.userRandom")}
              </InputLabel>
              <Select
                labelId="userRandom-label"
                value={UserRandom}
                onChange={async (e) => {
                  handleUserRandom(e.target.value);
                }}
              >
                <MenuItem value={"disabled"}>
                  {i18n.t("settings.settings.options.disabled")}
                </MenuItem>
                <MenuItem value={"enabled"}>
                  {i18n.t("settings.settings.options.enabled")}
                </MenuItem>
              </Select>
              <FormHelperText>
                {loadingUserRandom && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* MENSAGEM DE TRANSFERÊNCIA */}
          <Grid xs={12} sm={6} md={4} item>
            <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
              <InputLabel id="sendMsgTransfTicket-label">
                {i18n.t("settings.settings.options.sendMsgTransfTicket")}
              </InputLabel>
              <Select
                labelId="sendMsgTransfTicket-label"
                value={SettingsTransfTicket}
                onChange={async (e) => {
                  handleSettingsTransfTicket(e.target.value);
                }}
              >
                <MenuItem value={"disabled"}>
                  {i18n.t("settings.settings.options.disabled")}
                </MenuItem>
                <MenuItem value={"enabled"}>
                  {i18n.t("settings.settings.options.enabled")}
                </MenuItem>
              </Select>
              <FormHelperText>
                {loadingSettingsTransfTicket && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* SAUDAÇÃO UMA FILA */}
          <Grid xs={12} sm={6} md={4} item>
            <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
              <InputLabel id="sendGreetingMessageOneQueues-label">
                {i18n.t("settings.settings.options.sendGreetingMessageOneQueues")}
              </InputLabel>
              <Select
                labelId="sendGreetingMessageOneQueues-label"
                value={sendGreetingMessageOneQueues}
                onChange={async (e) => {
                  handleSendGreetingMessageOneQueues(e.target.value);
                }}
              >
                <MenuItem value={"disabled"}>
                  {i18n.t("settings.settings.options.disabled")}
                </MenuItem>
                <MenuItem value={"enabled"}>
                  {i18n.t("settings.settings.options.enabled")}
                </MenuItem>
              </Select>
              <FormHelperText>
                {loadingSendGreetingMessageOneQueues && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* POSIÇÃO NA FILA */}
          <Grid xs={12} sm={6} md={4} item>
            <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
              <InputLabel id="sendQueuePosition-label">
                {i18n.t("settings.settings.options.sendQueuePosition")}
              </InputLabel>
              <Select
                labelId="sendQueuePosition-label"
                value={sendQueuePosition}
                onChange={async (e) => {
                  handleSendQueuePosition(e.target.value);
                }}
              >
                <MenuItem value={"disabled"}>
                  {i18n.t("settings.settings.options.disabled")}
                </MenuItem>
                <MenuItem value={"enabled"}>
                  {i18n.t("settings.settings.options.enabled")}
                </MenuItem>
              </Select>
              <FormHelperText>
                {loadingSendQueuePosition && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </div>

      {/* SEÇÃO DE WHATSAPP E COMUNICAÇÃO */}
      <div className={classes.sectionCard}>
        <div className={classes.sectionHeader}>
          <div className={classes.sectionIcon} style={{ background: "linear-gradient(135deg, #25d366, #128c7e)" }}>
            📱
          </div>
          <div>
            <h2 className={classes.sectionTitle}>WhatsApp & Comunicação</h2>
            <p className={classes.sectionSubtitle}>Configurações específicas para WhatsApp e funcionalidades de comunicação</p>
          </div>
        </div>

        <Grid spacing={3} container className={classes.configGrid}>
          {/* LIGAÇÕES WHATSAPP */}
          <Grid xs={12} sm={6} md={4} item>
            <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
              <InputLabel id="acceptCallWhatsapp-label">
                {i18n.t("settings.settings.options.acceptCallWhatsapp")}
              </InputLabel>
              <Select
                labelId="acceptCallWhatsapp-label"
                value={AcceptCallWhatsapp}
                onChange={async (e) => {
                  handleAcceptCallWhatsapp(e.target.value);
                }}
              >
                <MenuItem value={"disabled"}>
                  {i18n.t("settings.settings.options.disabled")}
                </MenuItem>
                <MenuItem value={"enabled"}>
                  {i18n.t("settings.settings.options.enabled")}
                </MenuItem>
              </Select>
              <FormHelperText>
                {loadingAcceptCallWhatsapp && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* RETIRAR ASSINATURA */}
          <Grid xs={12} sm={6} md={4} item>
            <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
              <InputLabel id="sendSignMessage-label">
                {i18n.t("settings.settings.options.sendSignMessage")}
              </InputLabel>
              <Select
                labelId="sendSignMessage-label"
                value={sendSignMessage}
                onChange={async (e) => {
                  handleSendSignMessage(e.target.value);
                }}
              >
                <MenuItem value={"disabled"}>
                  {i18n.t("settings.settings.options.disabled")}
                </MenuItem>
                <MenuItem value={"enabled"}>
                  {i18n.t("settings.settings.options.enabled")}
                </MenuItem>
              </Select>
              <FormHelperText>
                {loadingSendSignMessage && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* DESPEDIDA AGUARDANDO */}
          <Grid xs={12} sm={6} md={4} item>
            <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
              <InputLabel id="sendFarewellWaitingTicket-label">
                {i18n.t("settings.settings.options.sendFarewellWaitingTicket")}
              </InputLabel>
              <Select
                labelId="sendFarewellWaitingTicket-label"
                value={sendFarewellWaitingTicket}
                onChange={async (e) => {
                  handleSendFarewellWaitingTicket(e.target.value);
                }}
              >
                <MenuItem value={"disabled"}>
                  {i18n.t("settings.settings.options.disabled")}
                </MenuItem>
                <MenuItem value={"enabled"}>
                  {i18n.t("settings.settings.options.enabled")}
                </MenuItem>
              </Select>
              <FormHelperText>
                {loadingSendFarewellWaitingTicket && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* ACEITAR ÁUDIO */}
          <Grid xs={12} sm={6} md={4} item>
            <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
              <InputLabel id="acceptAudioMessageContact-label">
                {i18n.t("settings.settings.options.acceptAudioMessageContact")}
              </InputLabel>
              <Select
                labelId="acceptAudioMessageContact-label"
                value={acceptAudioMessageContact}
                onChange={async (e) => {
                  handleAcceptAudioMessageContact(e.target.value);
                }}
              >
                <MenuItem value={"disabled"}>
                  {i18n.t("settings.settings.options.disabled")}
                </MenuItem>
                <MenuItem value={"enabled"}>
                  {i18n.t("settings.settings.options.enabled")}
                </MenuItem>
              </Select>
              <FormHelperText>
                {loadingAcceptAudioMessageContact && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* NOTIFICAÇÕES PENDENTES */}
          <Grid xs={12} sm={6} md={4} item>
            <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
              <InputLabel id="showNotificationPending-label">{i18n.t("settings.settings.options.showNotificationPending")}</InputLabel>
              <Select
                labelId="showNotificationPending-label"
                value={showNotificationPending}
                onChange={async (e) => {
                  handleShowNotificationPending(e.target.value);
                }}
              >
                <MenuItem value={false}>{i18n.t("settings.settings.options.disabled")}</MenuItem>
                <MenuItem value={true}>{i18n.t("settings.settings.options.enabled")}</MenuItem>
              </Select>
              <FormHelperText>
                {loadingShowNotificationPending && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* HABILITAR LGPD */}
          <Grid xs={12} sm={6} md={4} item>
            <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
              <InputLabel id="enableLGPD-label">{i18n.t("settings.settings.options.enableLGPD")}</InputLabel>
              <Select
                labelId="enableLGPD-label"
                value={enableLGPD}
                onChange={async (e) => {
                  handleEnableLGPD(e.target.value);
                }}
              >
                <MenuItem value={"disabled"}>{i18n.t("settings.settings.options.disabled")}</MenuItem>
                <MenuItem value={"enabled"}>{i18n.t("settings.settings.options.enabled")}</MenuItem>
              </Select>
              <FormHelperText>
                {loadingEnableLGPD && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </div>
      {/* SEÇÃO LGPD */}
      {enableLGPD === "enabled" && (
        <div className={classes.sectionCard}>
          <div className={classes.sectionHeader}>
            <div className={classes.sectionIcon} style={{ background: "linear-gradient(135deg, #6f42c1, #495057)" }}>
              🔒
            </div>
            <div>
              <h2 className={classes.sectionTitle}>{i18n.t("settings.settings.LGPD.title")}</h2>
              <p className={classes.sectionSubtitle}>Configurações de privacidade e proteção de dados</p>
            </div>
          </div>

          <Grid spacing={3} container className={classes.configGrid}>
            <Grid xs={12} item>
              <FormControl className={classes.selectContainer}>
                <TextField
                  id="lgpdMessage"
                  name="lgpdMessage"
                  margin="dense"
                  multiline
                  rows={3}
                  label={i18n.t("settings.settings.LGPD.welcome")}
                  variant="outlined"
                  value={lgpdMessage}
                  onChange={async (e) => {
                    handleLGPDMessage(e.target.value);
                  }}
                />
                <FormHelperText>
                  {loadinglgpdMessage && i18n.t("settings.settings.options.updating")}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid xs={12} item>
              <FormControl className={classes.selectContainer}>
                <TextField
                  id="lgpdLink"
                  name="lgpdLink"
                  margin="dense"
                  label={i18n.t("settings.settings.LGPD.linkLGPD")}
                  variant="outlined"
                  value={lgpdLink}
                  onChange={async (e) => {
                    handleLGPDLink(e.target.value);
                  }}
                />
                <FormHelperText>
                  {loadingLGPDLink && i18n.t("settings.settings.options.updating")}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6} md={4} item>
              <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
                <InputLabel id="lgpdDeleteMessage-label">{i18n.t("settings.settings.LGPD.obfuscateMessageDelete")}</InputLabel>
                <Select
                  labelId="lgpdDeleteMessage-label"
                  value={lgpdDeleteMessage}
                  onChange={async (e) => {
                    handleLGPDDeleteMessage(e.target.value);
                  }}
                >
                  <MenuItem value={"disabled"}>{i18n.t("settings.settings.LGPD.disabled")}</MenuItem>
                  <MenuItem value={"enabled"}>{i18n.t("settings.settings.LGPD.enabled")}</MenuItem>
                </Select>
                <FormHelperText>
                  {loadingLGPDDeleteMessage && i18n.t("settings.settings.options.updating")}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6} md={4} item>
              <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
                <InputLabel id="lgpdConsent-label">
                  {i18n.t("settings.settings.LGPD.alwaysConsent")}
                </InputLabel>
                <Select
                  labelId="lgpdConsent-label"
                  value={lgpdConsent}
                  onChange={async (e) => {
                    handleLGPDConsent(e.target.value);
                  }}
                >
                  <MenuItem value={"disabled"}>{i18n.t("settings.settings.LGPD.disabled")}</MenuItem>
                  <MenuItem value={"enabled"}>{i18n.t("settings.settings.LGPD.enabled")}</MenuItem>
                </Select>
                <FormHelperText>
                  {loadingLGPDConsent && i18n.t("settings.settings.options.updating")}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6} md={4} item>
              <FormControl className={`${classes.selectContainer} ${classes.modernSelect}`}>
                <InputLabel id="lgpdHideNumber-label">
                  {i18n.t("settings.settings.LGPD.obfuscatePhoneUser")}
                </InputLabel>
                <Select
                  labelId="lgpdHideNumber-label"
                  value={lgpdHideNumber}
                  onChange={async (e) => {
                    handleLGPDHideNumber(e.target.value);
                  }}
                >
                  <MenuItem value={"disabled"}>{i18n.t("settings.settings.LGPD.disabled")}</MenuItem>
                  <MenuItem value={"enabled"}>{i18n.t("settings.settings.LGPD.enabled")}</MenuItem>
                </Select>
                <FormHelperText>
                  {loadingLGPDHideNumber && i18n.t("settings.settings.options.updating")}
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </div>
      )}

      {/* SEÇÃO DE CONFIGURAÇÕES DE PAGAMENTO E APIs */}
      {isSuper() && (
        <>
          {/* MERCADO PAGO */}
          <div className={classes.sectionCard}>
            <div className={classes.sectionHeader}>
              <div className={classes.sectionIcon} style={{ background: "linear-gradient(135deg, #009ee3, #0080cc)" }}>
                💳
              </div>
              <div>
                <h2 className={classes.sectionTitle}>Mercado Pago</h2>
                <p className={classes.sectionSubtitle}>Principal gateway de pagamento da América Latina</p>
              </div>
            </div>

            <Grid spacing={3} container className={classes.configGrid}>
              <Grid xs={12} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id='mpaccesstoken'
                    name='mpaccesstoken'
                    margin='dense'
                    label='🔑 Access Token'
                    variant='outlined'
                    value={mpaccesstokenType}
                    placeholder="APP_USR-1234567890123456..."
                    onChange={async (e) => {
                      handleChangempaccesstoken(e.target.value);
                    }}
                    InputProps={{
                      style: { 
                        fontSize: "14px",
                        backgroundColor: "#ffffff",
                        borderRadius: "8px"
                      }
                    }}
                  />
                  <FormHelperText style={{ 
                    color: loadingmpaccesstokenType ? "#f39c12" : "#666", 
                    fontSize: "12px",
                    marginTop: "8px",
                    padding: "8px 12px",
                    backgroundColor: "#ffffff",
                    borderRadius: "6px",
                    border: "1px solid #e9ecef"
                  }}>
                    {loadingmpaccesstokenType ? 
                      '🔄 Atualizando configurações...' : 
                      '📝 Obtenha seu token em: Mercado Pago > Suas Integrações > Credenciais'
                    }
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid xs={12} item>
                <div className={classes.infoBox}>
                  <h4 style={{ 
                    margin: "0 0 10px 0", 
                    color: "#0c5460", 
                    fontSize: "14px",
                    fontWeight: "600"
                  }}>
                    💡 Como configurar:
                  </h4>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: "20px", 
                    color: "#0c5460", 
                    fontSize: "13px",
                    lineHeight: "1.6"
                  }}>
                    <li>Acesse sua conta do Mercado Pago</li>
                    <li>Vá para "Suas integrações" → "Credenciais"</li>
                    <li>Copie o "Access Token" de produção ou teste</li>
                    <li>Cole o token no campo acima</li>
                  </ul>
                </div>
              </Grid>
            </Grid>
          </div>

          {/* OPENAI */}
          <div className={classes.sectionCard}>
            <div className={classes.sectionHeader}>
              <div className={classes.sectionIcon} style={{ background: "linear-gradient(135deg, #10a37f, #1a7f64)" }}>
                🤖
              </div>
              <div>
                <h2 className={classes.sectionTitle}>OpenAI - Inteligência Artificial</h2>
                <p className={classes.sectionSubtitle}>Transcrição automática de mensagens de áudio</p>
              </div>
            </div>

            <Grid spacing={3} container className={classes.configGrid}>
              <Grid xs={12} item>
                <FormControl className={classes.selectContainer}>
                  <TextField
                    id='openaikeyaudio'
                    name='openaikeyaudio'
                    margin='dense'
                    label='🎤 OpenAI API Key para Transcrição de Áudio'
                    variant='outlined'
                    value={openaitokenType}
                    placeholder="sk-..."
                    onChange={async (e) => {
                      handleChangeopenaitoken(e.target.value);
                    }}
                    InputProps={{
                      style: { fontSize: "14px" }
                    }}
                  />
                  <FormHelperText style={{ color: "#666", fontSize: "12px" }}>
                    {loadingopenaitokenType ? 
                      '🔄 Atualizando configurações...' : 
                      'Esta chave será usada para transcrever mensagens de áudio em todas as empresas'
                    }
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid xs={12} item>
                <div className={classes.warningBox}>
                  <p style={{ 
                    margin: 0, 
                    color: "#856404", 
                    fontSize: "13px",
                    lineHeight: "1.5"
                  }}>
                    ⚠️ <strong>Importante:</strong> Mantenha sua chave API segura e não a compartilhe. 
                    Esta configuração afeta todas as empresas do sistema.
                  </p>
                </div>
              </Grid>
            </Grid>
          </div>
        </>
      )}

      {/* SEÇÃO DE MENSAGENS CUSTOMIZADAS */}
      <div className={classes.sectionCard}>
        <div className={classes.sectionHeader}>
          <div className={classes.sectionIcon} style={{ background: "linear-gradient(135deg, #dc3545, #c82333)" }}>
            📝
          </div>
          <div>
            <h2 className={classes.sectionTitle}>Mensagens Customizadas</h2>
            <p className={classes.sectionSubtitle}>Personalize as mensagens automáticas do sistema</p>
          </div>
        </div>

        <Grid spacing={3} container className={classes.configGrid}>
          <Grid xs={12} sm={6} item>
            <FormControl className={classes.selectContainer}>
              <TextField
                id="transferMessage"
                name="transferMessage"
                margin="dense"
                multiline
                rows={3}
                label={i18n.t("settings.settings.customMessages.transferMessage")}
                variant="outlined"
                value={transferMessage}
                required={SettingsTransfTicket === "enabled"}
                onChange={async (e) => {
                  handletransferMessage(e.target.value);
                }}
              />
              <FormHelperText>
                {loadingTransferMessage && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6} item>
            <FormControl className={classes.selectContainer}>
              <TextField
                id="greetingAcceptedMessage"
                name="greetingAcceptedMessage"
                margin="dense"
                multiline
                rows={3}
                label={i18n.t("settings.settings.customMessages.greetingAcceptedMessage")}
                variant="outlined"
                value={greetingAcceptedMessage}
                required={SendGreetingAccepted === "enabled"}
                onChange={async (e) => {
                  handleGreetingAcceptedMessage(e.target.value);
                }}
              />
              <FormHelperText>
                {loadingGreetingAcceptedMessage && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6} item>
            <FormControl className={classes.selectContainer}>
              <TextField
                id="AcceptCallWhatsappMessage"
                name="AcceptCallWhatsappMessage"
                margin="dense"
                multiline
                rows={3}
                label={i18n.t("settings.settings.customMessages.AcceptCallWhatsappMessage")}
                variant="outlined"
                required={AcceptCallWhatsapp === "disabled"}
                value={AcceptCallWhatsappMessage}
                onChange={async (e) => {
                  handleAcceptCallWhatsappMessage(e.target.value);
                }}
              />
              <FormHelperText>
                {loadingAcceptCallWhatsappMessage && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6} item>
            <FormControl className={classes.selectContainer}>
              <TextField
                id="sendQueuePositionMessage"
                name="sendQueuePositionMessage"
                margin="dense"
                multiline
                required={sendQueuePosition === "enabled"}
                rows={3}
                label={i18n.t("settings.settings.customMessages.sendQueuePositionMessage")}
                variant="outlined"
                value={sendQueuePositionMessage}
                onChange={async (e) => {
                  handlesendQueuePositionMessage(e.target.value);
                }}
              />
              <FormHelperText>
                {loadingSendQueuePositionMessage && i18n.t("settings.settings.options.updating")}
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
