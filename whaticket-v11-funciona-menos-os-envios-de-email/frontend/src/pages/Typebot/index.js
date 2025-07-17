import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    overflow: 'hidden', // Para evitar rolagem extra se o iframe tiver barras de rolagem
  },
  iframe: {
    width: '100%',
    height: '100vh', // Faz o iframe ocupar toda a altura da tela
    border: 'none',
  },
}));

const Typebot = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <iframe
        className={classes.iframe}
        src="https://typebot.wamanager.com.br" // URL corrigida para o link correto
        title="Typebot"
      />
    </div>
  );
};

export default Typebot;
