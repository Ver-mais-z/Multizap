import React, { useState, useEffect } from 'react';
import { 
  Snackbar, 
  Alert, 
  Button, 
  Box, 
  Typography,
  IconButton
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import GetAppIcon from '@material-ui/icons/GetApp';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
  installBanner: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    padding: theme.spacing(2),
    zIndex: 1300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.2)',
  },
  installContent: {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
  },
  installIcon: {
    marginRight: theme.spacing(1),
  },
  installText: {
    flexGrow: 1,
    marginRight: theme.spacing(2),
  },
  installButton: {
    backgroundColor: 'white',
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.9)',
    },
    marginRight: theme.spacing(1),
  },
  closeButton: {
    color: 'white',
  },
}));

const PWAInstallBanner = () => {
  const classes = useStyles();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    // Verifica se o banner já foi dispensado nesta sessão
    const dismissed = sessionStorage.getItem('pwa-banner-dismissed');
    if (dismissed) {
      setBannerDismissed(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Só mostra o banner se não foi dispensado e não está em modo standalone
      if (!dismissed && !window.matchMedia('(display-mode: standalone)').matches && !window.navigator.standalone) {
        setTimeout(() => {
          setShowBanner(true);
        }, 3000); // Mostra após 3 segundos
      }
    };

    const handleAppInstalled = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setBannerDismissed(true);
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // Não mostra o banner se foi dispensado ou se não há prompt disponível
  if (bannerDismissed || !showBanner || !deferredPrompt) {
    return null;
  }

  return (
    <Box className={classes.installBanner}>
      <Box className={classes.installContent}>
        <GetAppIcon className={classes.installIcon} />
        <Box className={classes.installText}>
          <Typography variant="body2" component="div">
            <strong>Instalar fservice</strong>
          </Typography>
          <Typography variant="caption" component="div">
            Adicione o app à sua tela inicial para acesso rápido
          </Typography>
        </Box>
      </Box>
      <Button
        className={classes.installButton}
        variant="contained"
        size="small"
        onClick={handleInstall}
        startIcon={<GetAppIcon />}
      >
        Instalar
      </Button>
      <IconButton
        className={classes.closeButton}
        size="small"
        onClick={handleDismiss}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  );
};

export default PWAInstallBanner;
