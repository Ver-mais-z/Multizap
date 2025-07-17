import React from "react";
import PropTypes from "prop-types";
import { Modal, Backdrop, Fade, Grid, IconButton } from "@material-ui/core";

const EmojiReactionModal = ({ open, onClose, onSelect }) => {
  // Emojis suportados pelo WhatsApp
  const whatsappEmojis = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
    >
      <Fade in={open}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          padding: 24,
          borderRadius: 8,
          outline: 'none',
          maxHeight: 300,
          overflowY: 'auto',
        }}>
          <Grid container spacing={1}>
            {whatsappEmojis.map((emoji, idx) => (
              <Grid item key={idx}>
                <IconButton 
                  onClick={() => onSelect(emoji)}
                  style={{ fontSize: '24px' }}
                >
                  {emoji}
                </IconButton>
              </Grid>
            ))}
          </Grid>
        </div>
      </Fade>
    </Modal>
  );
};

EmojiReactionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default EmojiReactionModal;
