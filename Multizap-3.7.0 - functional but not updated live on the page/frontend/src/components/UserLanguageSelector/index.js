import React, { useContext, useState, useEffect } from "react";
import { Button, Menu, MenuItem } from "@material-ui/core";
import TranslateIcon from "@material-ui/icons/Translate";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";

// Define custom styles
const useStyles = makeStyles((theme) => ({
  button: {
    color: "#ffffff !important", // White text and icons
    textTransform: "none",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)", // Subtle hover effect for dark background
    },
  },
}));

const UserLanguageSelector = () => {
  const classes = useStyles();
  const [langueMenuAnchorEl, setLangueMenuAnchorEl] = useState(null);
  const { user } = useContext(AuthContext);
  const [selectedLanguage, setSelectedLanguage] = useState("pt-BR"); // Inicial com fallback

  // Mapa de traduções para os nomes dos idiomas
  const languageNames = {
    "pt-BR": {
      "pt-BR": "Português",
      en: "Inglês",
      es: "Espanhol",
      tr: "Turco",
    },
    en: {
      "pt-BR": "Portuguese",
      en: "English",
      es: "Spanish",
      tr: "Turkish",
    },
    es: {
      "pt-BR": "Portugués",
      en: "Inglés",
      es: "Español",
      tr: "Turco",
    },
    tr: {
      "pt-BR": "Portekizce",
      en: "İngilizce",
      es: "İspanyolca",
      tr: "Türkçe",
    },
  };

  // Busca o idioma do usuário diretamente do banco ao montar o componente
  useEffect(() => {
    const fetchUserLanguage = async () => {
      try {
        if (user.id) {
          const response = await api.get(`/users/${user.id}`);
          const { language } = response.data;
          if (language) {
            setSelectedLanguage(language);
            i18n.changeLanguage(language); // Sincroniza o i18n com o idioma do banco
          }
        }
      } catch (err) {
        console.error("Erro ao buscar idioma do usuário:", err);
        toastError(err);
        setSelectedLanguage("pt-BR"); // Fallback caso a API falhe
        i18n.changeLanguage("pt-BR");
      }
    };

    fetchUserLanguage();
  }, [user.id]);

  // Sincroniza com user.language se ele mudar (ex.: após login ou atualização)
  useEffect(() => {
    if (user.language) {
      setSelectedLanguage(user.language);
      i18n.changeLanguage(user.language);
    }
  }, [user.language]);

  const handleOpenLanguageMenu = (e) => {
    setLangueMenuAnchorEl(e.currentTarget);
  };

  const handleCloseLanguageMenu = () => {
    setLangueMenuAnchorEl(null);
  };

  const handleChangeLanguage = async (language) => {
    try {
      await i18n.changeLanguage(language); // Altera o idioma no i18n
      await api.put(`/users/${user.id}/language`, { language }); // Salva no servidor usando a nova rota
      setSelectedLanguage(language); // Atualiza o estado local
    } catch (err) {
      toastError(err);
      console.error("Erro ao mudar idioma:", err);
    }
    handleCloseLanguageMenu();
  };

  // Obtém o nome do idioma no idioma atual
  const getLanguageName = (lang) => {
    return languageNames[selectedLanguage][lang] || languageNames["pt-BR"][lang];
  };

  return (
    <>
      <Button
        className={classes.button}
        onClick={handleOpenLanguageMenu}
        startIcon={<TranslateIcon />}
        endIcon={<ExpandMoreIcon />}
      >
        {getLanguageName(selectedLanguage)}
      </Button>
      <Menu
        anchorEl={langueMenuAnchorEl}
        keepMounted
        open={Boolean(langueMenuAnchorEl)}
        onClose={handleCloseLanguageMenu}
      >
        <MenuItem onClick={() => handleChangeLanguage("pt-BR")}>
          {getLanguageName("pt-BR")}
        </MenuItem>
        <MenuItem onClick={() => handleChangeLanguage("en")}>
          {getLanguageName("en")}
        </MenuItem>
        <MenuItem onClick={() => handleChangeLanguage("es")}>
          {getLanguageName("es")}
        </MenuItem>
        <MenuItem onClick={() => handleChangeLanguage("tr")}>
          {getLanguageName("tr")}
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserLanguageSelector;