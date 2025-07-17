import { Button, IconButton, CircularProgress, Typography, Box, makeStyles } from "@material-ui/core";
import { RecordVoiceOver } from "@material-ui/icons";
import React, { useRef, useEffect, useState } from "react";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const LS_NAME = 'audioMessageRate';

const useStyles = makeStyles((theme) => ({
  audioContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  audioPlayerContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  transcribeButton: {
    marginTop: '8px',
    backgroundColor: '#25D366',
    color: 'white',
    fontSize: '12px',
    padding: '4px 8px',
    minHeight: '28px',
    '&:hover': {
      backgroundColor: '#128C7E',
    },
  },
  transcriptionContainer: {
    marginTop: '8px',
    padding: '8px',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '4px',
    border: `1px solid ${theme.palette.divider}`,
  },
  transcriptionText: {
    fontSize: '14px',
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }
}));

const AudioModal = ({url, message}) => {
    const classes = useStyles();
    const audioRef = useRef(null);
    const [audioRate, setAudioRate] = useState(parseFloat(localStorage.getItem(LS_NAME) || "1"));
    const [showButtonRate, setShowButtonRate] = useState(false);
    const [transcribing, setTranscribing] = useState(false);
    const [transcription, setTranscription] = useState("");
    const [showTranscription, setShowTranscription] = useState(false);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
    useEffect(() => {
      audioRef.current.playbackRate = audioRate;
      localStorage.setItem(LS_NAME, audioRate);
    }, [audioRate]);
  
    useEffect(() => {
      audioRef.current.onplaying = () => {
        setShowButtonRate(true);
      };
      audioRef.current.onpause = () => {
        setShowButtonRate(false);
      };
      audioRef.current.onended = () => {
        setShowButtonRate(false);
      };
    }, []);
  
    const toggleRate = () => {
      let newRate = null;
  
      switch (audioRate) {
        case 0.5:
          newRate = 1;
          break;
        case 1:
          newRate = 1.5;
          break;
        case 1.5:
          newRate = 2;
          break;
        case 2:
          newRate = 0.5;
          break;
        default:
          newRate = 1;
          break;
      }
  
      setAudioRate(newRate);
    };

    const handleTranscribe = async () => {
      if (!message || !message.mediaUrl) {
        toastError("URL do áudio não disponível");
        return;
      }

      setTranscribing(true);
      try {
        const audioUrl = String(message.mediaUrl);
        const match = audioUrl.match(/\/([^\/]+\.(ogg|mp3))$/);
        const extractedPart = match ? match[1] : null;
        
        if (!extractedPart) {
          throw new Error("Formato de URL de áudio inesperado");
        }

        const response = await api.get(`/messages/transcribeAudio/${extractedPart}`);
        const { data } = response;
        
        if (data && data.transcribedText) {
          const transcriptionText = typeof data.transcribedText === "string"
            ? data.transcribedText
            : data.transcribedText.transcription || "";
          
          if (transcriptionText) {
            setTranscription(transcriptionText);
            setShowTranscription(true);
          } else {
            throw new Error("Nenhuma transcrição disponível");
          }
        } else if (data && data.error) {
          throw new Error(data.error);
        } else {
          throw new Error("Dados de transcrição inválidos");
        }
      } catch (err) {
        console.error("Transcription Error:", err);
        toastError(err.message || "Erro ao transcrever áudio");
      } finally {
        setTranscribing(false);
      }
    };
  
    const getAudioSource = () => {
      let sourceUrl = url;
  
      if (isIOS) {
        sourceUrl = sourceUrl.replace(".ogg", ".mp3");
      }
  
      return (
        <source src={sourceUrl} type={isIOS ? "audio/mp3" : "audio/ogg"} />
      );
    };
  
    return (
      <Box>
        <div className={classes.audioContainer}>
          <div className={classes.audioPlayerContainer}>
            <audio ref={audioRef} controls>
              {getAudioSource()}
            </audio>
            {showButtonRate && (
              <Button
                style={{ marginLeft: "5px", marginTop: "-45px" }}
                onClick={toggleRate}
              >
                {audioRate}x
              </Button>
            )}
          </div>
          {message && !message.fromMe && (
            <Button
              className={classes.transcribeButton}
              size="small"
              onClick={handleTranscribe}
              disabled={transcribing}
              startIcon={transcribing ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <RecordVoiceOver fontSize="small" />
              )}
            >
              {transcribing ? "Transcrevendo..." : "Transcrever áudio"}
            </Button>
          )}
        </div>
        
        {showTranscription && (
          <div className={classes.transcriptionContainer}>
            <Typography variant="body2" className={classes.transcriptionText}>
              📝 <strong>Transcrição:</strong> {transcription}
            </Typography>
          </div>
        )}
      </Box>
    );
}

export default AudioModal;